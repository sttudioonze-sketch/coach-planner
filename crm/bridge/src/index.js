// Ponte WhatsApp -> CRM.
// Conecta ao seu WhatsApp como um aparelho vinculado (igual ao WhatsApp Web),
// grava cada mensagem no Supabase e envia as respostas pedidas pelo app.
import { rm } from 'node:fs/promises';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
  useMultiFileAuthState,
} from 'baileys';
import { createClient } from '@supabase/supabase-js';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { phoneFromJid, toIngestParams } from './parse.js';

try {
  process.loadEnvFile();
} catch {
  // Sem arquivo .env: usa as variáveis do ambiente.
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Faltou a variável ${name}. Copie .env.example para .env e preencha.`);
    process.exit(1);
  }
  return value;
}

const SUPABASE_URL = required('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = required('SUPABASE_SERVICE_ROLE_KEY');
const AUTH_DIR = process.env.WA_AUTH_DIR?.trim() || './auth';
const CREATE_FROM_OUTGOING = process.env.CREATE_LEADS_FROM_OUTGOING === 'true';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const logger = pino({ level: process.env.LOG_LEVEL || 'warn' });
const log = (...args) => console.log(new Date().toISOString(), ...args);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let sock = null;
let connected = false;
let currentState = 'iniciando';
let reconnectTimer = null;

async function setStatus(fields) {
  if (fields.state) currentState = fields.state;
  const { error } = await supabase
    .from('crm_bridge_status')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) log('Não consegui atualizar o status da ponte:', error.message);
}

// ---------------------------------------------------------------------------
// Mensagens recebidas e enviadas -> CRM
// ---------------------------------------------------------------------------

async function ingest(msg) {
  const params = toIngestParams(msg, { createFromOutgoing: CREATE_FROM_OUTGOING });
  if (!params) return;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const { error } = await supabase.rpc('crm_ingest_message', params);
    if (!error) return;
    log(`Erro ao salvar a mensagem ${params.p_wa_message_id} (tentativa ${attempt}):`, error.message);
    await wait(1000 * 2 ** attempt);
  }
}

// ---------------------------------------------------------------------------
// Respostas escritas no app -> WhatsApp
// ---------------------------------------------------------------------------

async function resolveJid(lead) {
  // Contatos que já conversaram têm o endereço exato vindo do próprio WhatsApp.
  if (lead.wa_jid && (lead.last_message_at || lead.wa_jid.endsWith('@lid'))) return lead.wa_jid;

  // Cards criados à mão: confere o número (inclusive o 9º dígito) no WhatsApp.
  const number = lead.phone || phoneFromJid(lead.wa_jid);
  if (!number) throw new Error('Este card não tem número de WhatsApp.');
  const [result] = (await sock.onWhatsApp(number)) ?? [];
  if (!result?.exists) throw new Error(`O número ${number} não está no WhatsApp.`);

  if (result.jid !== lead.wa_jid) {
    const { error } = await supabase
      .from('crm_leads')
      .update({ wa_jid: result.jid, phone: phoneFromJid(result.jid) ?? number })
      .eq('id', lead.id);
    if (error) log('Não consegui corrigir o número do card:', error.message);
  }
  return result.jid;
}

async function sendOne(item) {
  const { data: claimed, error: claimError } = await supabase
    .from('crm_outbox')
    .update({ status: 'enviando' })
    .eq('id', item.id)
    .eq('status', 'pendente')
    .select('id');
  if (claimError || !claimed?.length) return;

  try {
    const { data: lead, error } = await supabase
      .from('crm_leads')
      .select('id, wa_jid, phone, last_message_at')
      .eq('id', item.lead_id)
      .single();
    if (error || !lead) throw new Error('Card não encontrado.');

    const jid = await resolveJid(lead);
    const sent = await sock.sendMessage(jid, { text: item.body });

    await supabase
      .from('crm_outbox')
      .update({ status: 'enviado', sent_at: new Date().toISOString(), error: null })
      .eq('id', item.id);
    if (sent) await ingest(sent);
    log('Mensagem enviada para', jid);
  } catch (err) {
    log('Falha ao enviar mensagem:', err.message);
    await supabase
      .from('crm_outbox')
      .update({ status: 'erro', error: String(err.message).slice(0, 500) })
      .eq('id', item.id);
  }
}

let draining = false;
let drainAgain = false;

async function drainOutbox() {
  if (!connected) return;
  if (draining) {
    drainAgain = true;
    return;
  }
  draining = true;
  try {
    do {
      drainAgain = false;
      const { data: pending, error } = await supabase
        .from('crm_outbox')
        .select('id, lead_id, body')
        .eq('status', 'pendente')
        .order('created_at')
        .limit(20);
      if (error) {
        log('Erro ao ler a fila de envio:', error.message);
        break;
      }
      for (const item of pending) {
        if (!connected) break;
        await sendOne(item);
        await wait(800); // ritmo humano entre envios seguidos
      }
    } while (drainAgain && connected);
  } finally {
    draining = false;
  }
}

async function recoverInterruptedSends() {
  // Um envio interrompido no meio pode ter saído ou não; não reenviamos sozinhos.
  const { error } = await supabase
    .from('crm_outbox')
    .update({ status: 'erro', error: 'Envio interrompido. Confira no WhatsApp e, se preciso, envie de novo.' })
    .eq('status', 'enviando');
  if (error) log('Não consegui revisar envios interrompidos:', error.message);
}

// ---------------------------------------------------------------------------
// Conexão com o WhatsApp
// ---------------------------------------------------------------------------

function scheduleReconnect(ms) {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    connect().catch((err) => {
      log('Erro ao reconectar:', err.message);
      scheduleReconnect(15000);
    });
  }, ms);
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({}));

  sock = makeWASocket({
    auth: state,
    version,
    logger,
    browser: Browsers.ubuntu('Coach Planner CRM'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      log('Abra o WhatsApp no celular > Aparelhos conectados > Conectar aparelho e escaneie:');
      qrcode.generate(qr, { small: true });
      await setStatus({ state: 'qr', qr });
    }

    if (connection === 'open') {
      connected = true;
      const phone = phoneFromJid(jidNormalizedUser(sock.user?.id));
      log('WhatsApp conectado', phone ? `(${phone})` : '');
      await setStatus({ state: 'conectado', qr: null, phone });
      drainOutbox();
    }

    if (connection === 'close') {
      connected = false;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        log('O aparelho foi desconectado pelo celular. Gerando um novo QR Code.');
        await rm(AUTH_DIR, { recursive: true, force: true });
        await setStatus({ state: 'sessao_encerrada', qr: null });
        scheduleReconnect(3000);
      } else {
        log('Conexão caiu', code ? `(código ${code})` : '', '- reconectando.');
        await setStatus({ state: 'desconectado' });
        scheduleReconnect(code === DisconnectReason.restartRequired ? 0 : 5000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) await ingest(msg);
  });
}

async function main() {
  log('Iniciando a ponte do CRM...');
  await setStatus({ state: 'iniciando', qr: null });
  await recoverInterruptedSends();

  supabase
    .channel('crm-outbox')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crm_outbox' }, () => drainOutbox())
    .subscribe();

  setInterval(drainOutbox, 15_000); // reserva, caso o tempo real falhe
  setInterval(() => setStatus({ state: currentState }), 60_000); // sinal de vida para o app

  await connect();
}

async function shutdown() {
  log('Encerrando a ponte...');
  clearTimeout(reconnectTimer);
  connected = false;
  sock?.end(undefined);
  await setStatus({ state: 'desconectado' });
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
