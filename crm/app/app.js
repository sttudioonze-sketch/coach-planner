import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.119.0';
import QRCode from 'https://esm.sh/qrcode@1.5.4';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config.js';

// ---------------------------------------------------------------------------
// Configuração do funil
// ---------------------------------------------------------------------------

const STAGES = [
  { id: 'novo', label: 'Novo lead', color: '#d83942' },
  { id: 'conversa', label: 'Em conversa', color: '#e07b39' },
  { id: 'proposta', label: 'Proposta enviada', color: '#c9a227' },
  { id: 'pagamento', label: 'Aguardando pagamento', color: '#5b7fd6' },
  { id: 'entregar', label: 'Pago · entregar', color: '#7b5bd6' },
  { id: 'concluido', label: 'Concluído', color: '#1f8a4c' },
  { id: 'perdido', label: 'Perdido', color: '#626870' },
];

// Preço vazio = preencher no card.
const PRODUCTS = [
  { id: 'PRO', price: 57 },
  { id: 'ELITE', price: 147 },
  { id: 'SPECIAL', price: 197 },
  { id: 'T-Manager', price: null },
  { id: 'Bola Parada PRO', price: null },
  { id: 'Combo', price: null },
  { id: 'Futsal', price: null },
  { id: 'Futebol 7', price: null },
];

// {nome}, {produto} e {valor} são trocados pelos dados do card.
const TEMPLATES = [
  { label: 'Boas-vindas', text: 'Olá, {nome}! Aqui é do Coach Planner. Como posso te ajudar?' },
  {
    label: 'Valores',
    text: 'O Coach Planner {produto} sai por {valor}, pagamento único e sem mensalidade. Você recebe o PDF para imprimir em A4. Posso te enviar o link de pagamento?',
  },
  { label: 'Aguardando pagamento', text: 'Perfeito, {nome}! Assim que o pagamento for confirmado, envio o seu material por aqui.' },
  {
    label: 'SPECIAL: pedir escudo',
    text: 'Para personalizar o SPECIAL, me envie o nome do clube e o escudo em boa resolução. A entrega sai em até 72 horas.',
  },
  { label: 'Entrega', text: 'Pronto, {nome}! Segue o seu Coach Planner. Qualquer dúvida, é só chamar por aqui.' },
  { label: 'Retorno', text: 'Oi, {nome}! Passando para saber se ficou alguma dúvida sobre o Coach Planner.' },
];

const BRIDGE_STALE_MS = 3 * 60 * 1000;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (key === 'style') el.style.cssText = value;
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child !== null && child !== undefined && child !== false) el.append(child);
  }
  return el;
}

const money = (value) =>
  value === null || value === undefined || value === ''
    ? ''
    : Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const todayISO = () => new Date().toLocaleDateString('sv-SE');

function formatPhone(digits) {
  if (!digits) return '';
  const m = String(digits).match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : `+${digits}`;
}

function normalizePhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`; // DDD + número
  return digits.length >= 12 ? digits : null;
}

const displayName = (lead) => lead.name || formatPhone(lead.phone) || 'Contato sem nome';
const firstName = (lead) => (lead.name || '').trim().split(/\s+/)[0] || '';
const activityAt = (lead) => lead.last_message_at || lead.created_at;

function relTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function followState(lead) {
  if (!lead.follow_up) return null;
  const today = todayISO();
  if (lead.follow_up < today) return 'overdue';
  if (lead.follow_up === today) return 'due';
  return 'later';
}

let toastTimer;
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 4000);
}

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

const state = {
  leads: new Map(),
  openId: null,
  messages: [],
  outbox: [],
  bridge: null,
  started: false,
  channel: null,
};

const configured = !SUPABASE_URL.includes('SEU-PROJETO') && !SUPABASE_ANON_KEY.startsWith('COLE');
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function show(view) {
  for (const id of ['login-view', 'setup-view', 'board-view']) $(id).hidden = id !== view;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

$('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  $('login-error').textContent = '';
  const { error } = await supabase.auth.signInWithPassword({
    email: $('login-email').value.trim(),
    password: $('login-password').value,
  });
  button.disabled = false;
  if (error) $('login-error').textContent = 'E-mail ou senha incorretos.';
});

$('logout').addEventListener('click', () => supabase.auth.signOut());

// ---------------------------------------------------------------------------
// Quadro
// ---------------------------------------------------------------------------

function buildColumns() {
  const board = $('board');
  board.replaceChildren();
  for (const stage of STAGES) {
    const cards = h('div', { class: 'cards', 'data-stage': stage.id });
    const column = h(
      'section',
      { class: 'column', 'data-stage': stage.id, style: `--col:${stage.color}`, 'aria-label': stage.label },
      h(
        'div',
        { class: 'column-head' },
        h('div', { class: 'column-title' }, h('span', { text: stage.label }), h('span', { class: 'column-count', text: '0' })),
        h('div', { class: 'column-total' }),
      ),
      cards,
    );

    column.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      column.classList.add('drop-target');
    });
    column.addEventListener('dragleave', (event) => {
      if (!column.contains(event.relatedTarget)) column.classList.remove('drop-target');
    });
    column.addEventListener('drop', (event) => {
      event.preventDefault();
      column.classList.remove('drop-target');
      const id = event.dataTransfer.getData('text/plain');
      if (id) moveLead(id, stage.id);
    });
    board.append(column);
  }
}

function matches(lead, query, filter) {
  if (filter === 'ignored' ? !lead.ignored : lead.ignored) return false;
  if (filter === 'unread' && !lead.unread_count) return false;
  if (filter === 'due' && !['due', 'overdue'].includes(followState(lead))) return false;
  if (!query) return true;
  const haystack = [lead.name, lead.phone, formatPhone(lead.phone), lead.last_message_preview, lead.notes, lead.product]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function cardFor(lead) {
  const follow = followState(lead);
  const preview = lead.last_message_preview
    ? `${lead.last_message_from_me ? 'Você: ' : ''}${lead.last_message_preview}`
    : lead.notes || 'Sem mensagens ainda';

  const card = h(
    'div',
    {
      class: `card${lead.unread_count ? ' unread' : ''}`,
      role: 'button',
      tabindex: '0',
      draggable: 'true',
      'data-id': lead.id,
      'aria-label': `${displayName(lead)}${lead.unread_count ? `, ${lead.unread_count} não lidas` : ''}`,
      onclick: () => openDrawer(lead.id),
      onkeydown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDrawer(lead.id);
        }
      },
      ondragstart: (event) => {
        event.dataTransfer.setData('text/plain', lead.id);
        event.dataTransfer.effectAllowed = 'move';
        event.currentTarget.classList.add('dragging');
      },
      ondragend: (event) => event.currentTarget.classList.remove('dragging'),
    },
    lead.unread_count ? h('span', { class: 'badge', text: String(lead.unread_count) }) : null,
    h(
      'div',
      { class: 'card-top' },
      h('span', { class: 'card-name', text: displayName(lead) }),
      h('span', { class: 'card-time', text: relTime(activityAt(lead)) }),
    ),
    h('div', { class: 'card-preview', text: preview }),
  );

  const meta = [];
  if (lead.product) meta.push(h('span', { class: 'chip product', text: lead.product }));
  if (lead.value !== null && lead.value !== undefined) meta.push(h('span', { class: 'chip', text: money(lead.value) }));
  if (follow === 'overdue' || follow === 'due') {
    const label = follow === 'due' ? 'Retornar hoje' : `Retorno ${new Date(`${lead.follow_up}T12:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
    meta.push(h('span', { class: `chip ${follow}`, text: label }));
  }
  if (meta.length) card.append(h('div', { class: 'card-meta' }, meta));
  return card;
}

let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderBoard();
  });
}

function renderBoard() {
  const query = $('search').value.trim().toLowerCase();
  const filter = $('filter').value;
  const visible = [...state.leads.values()]
    .filter((lead) => matches(lead, query, filter))
    .sort((a, b) => String(activityAt(b)).localeCompare(String(activityAt(a))));

  for (const stage of STAGES) {
    const column = $('board').querySelector(`.column[data-stage="${stage.id}"]`);
    const list = column.querySelector('.cards');
    const leads = visible.filter((lead) => lead.stage === stage.id);
    const total = leads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
    column.querySelector('.column-count').textContent = String(leads.length);
    column.querySelector('.column-total').textContent = total ? money(total) : '';

    const scroll = list.scrollTop;
    list.replaceChildren(...(leads.length ? leads.map(cardFor) : [h('p', { class: 'empty-col', text: 'Arraste um card para cá' })]));
    list.scrollTop = scroll;
  }

  const unread = [...state.leads.values()].filter((l) => !l.ignored).reduce((sum, l) => sum + (l.unread_count || 0), 0);
  document.title = `${unread ? `(${unread}) ` : ''}CRM · Coach Planner`;
}

$('search').addEventListener('input', scheduleRender);
$('filter').addEventListener('change', scheduleRender);

async function loadLeads() {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(5000);
  if (error) {
    toast(`Não consegui carregar os contatos: ${error.message}`);
    return;
  }
  state.leads = new Map(data.map((lead) => [lead.id, lead]));
  scheduleRender();
  if (state.openId) fillDrawer();
}

async function updateLead(id, patch) {
  const before = state.leads.get(id);
  if (!before) return null;
  state.leads.set(id, { ...before, ...patch });
  scheduleRender();

  const { data, error } = await supabase.from('crm_leads').update(patch).eq('id', id).select().single();
  if (error) {
    state.leads.set(id, before);
    scheduleRender();
    if (state.openId === id) fillDrawer();
    toast(error.code === '23505' ? 'Já existe um card com esse número.' : `Não foi possível salvar: ${error.message}`);
    return null;
  }
  state.leads.set(id, data);
  scheduleRender();
  return data;
}

function moveLead(id, stage) {
  const lead = state.leads.get(id);
  if (!lead || lead.stage === stage) return;
  updateLead(id, { stage });
  if (state.openId === id) $('d-stage').value = stage;
}

$('new-lead').addEventListener('click', async () => {
  const { data, error } = await supabase.from('crm_leads').insert({ stage: 'novo' }).select().single();
  if (error) {
    toast(`Não foi possível criar o card: ${error.message}`);
    return;
  }
  state.leads.set(data.id, data);
  scheduleRender();
  openDrawer(data.id);
  $('d-name').focus();
});

// ---------------------------------------------------------------------------
// Painel do contato
// ---------------------------------------------------------------------------

for (const stage of STAGES) $('d-stage').append(h('option', { value: stage.id, text: stage.label }));
$('d-product').append(h('option', { value: '', text: '—' }));
for (const product of PRODUCTS) $('d-product').append(h('option', { value: product.id, text: product.id }));
TEMPLATES.forEach((template, index) => $('d-template').append(h('option', { value: String(index), text: template.label })));

function openLead() {
  return state.leads.get(state.openId);
}

function fillDrawer() {
  const lead = openLead();
  if (!lead) {
    closeDrawer();
    return;
  }
  const active = document.activeElement;
  const setIfIdle = (id, value) => {
    if ($(id) !== active) $(id).value = value ?? '';
  };
  setIfIdle('d-name', lead.name);
  setIfIdle('d-stage', lead.stage);
  setIfIdle('d-product', lead.product);
  setIfIdle('d-value', lead.value);
  setIfIdle('d-follow', lead.follow_up);
  setIfIdle('d-phone-input', lead.phone ? formatPhone(lead.phone) : '');
  setIfIdle('d-notes', lead.notes);

  $('d-phone').textContent = lead.phone ? formatPhone(lead.phone) : lead.wa_jid ? 'Número oculto pelo WhatsApp' : 'Sem número';
  $('d-wa').hidden = !lead.phone;
  if (lead.phone) $('d-wa').href = `https://wa.me/${lead.phone}`;
  $('d-ignore').textContent = lead.ignored ? 'Voltar a acompanhar' : 'Ignorar contato';
  updateReplyHint();
}

async function openDrawer(id) {
  state.openId = id;
  state.messages = [];
  state.outbox = [];
  $('d-saved').textContent = '';
  $('d-text').value = '';
  fillDrawer();
  renderMessages();
  $('drawer').hidden = false;
  $('drawer-backdrop').hidden = false;

  const [messages, outbox] = await Promise.all([
    supabase.from('crm_messages').select('*').eq('lead_id', id).order('sent_at', { ascending: false }).limit(300),
    supabase.from('crm_outbox').select('*').eq('lead_id', id).in('status', ['pendente', 'enviando', 'erro']).order('created_at'),
  ]);
  if (state.openId !== id) return;
  if (messages.error) toast(`Não consegui carregar a conversa: ${messages.error.message}`);
  state.messages = (messages.data || []).sort((a, b) => a.sent_at.localeCompare(b.sent_at));
  state.outbox = outbox.data || [];
  renderMessages();
  markRead();
}

function closeDrawer() {
  state.openId = null;
  $('drawer').hidden = true;
  $('drawer-backdrop').hidden = true;
}

$('d-close').addEventListener('click', closeDrawer);
$('drawer-backdrop').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !$('drawer').hidden) closeDrawer();
});

function markRead() {
  const lead = openLead();
  if (lead?.unread_count) updateLead(lead.id, { unread_count: 0 });
}

async function saveField(patch) {
  const lead = openLead();
  if (!lead) return;
  const saved = await updateLead(lead.id, patch);
  if (saved) {
    $('d-saved').textContent = 'Salvo';
    setTimeout(() => ($('d-saved').textContent = ''), 1500);
  }
}

$('d-name').addEventListener('change', (e) => saveField({ name: e.target.value.trim() || null }));
$('d-stage').addEventListener('change', (e) => saveField({ stage: e.target.value }));
$('d-follow').addEventListener('change', (e) => saveField({ follow_up: e.target.value || null }));
$('d-notes').addEventListener('change', (e) => saveField({ notes: e.target.value.trim() || null }));
$('d-value').addEventListener('change', (e) => saveField({ value: e.target.value === '' ? null : Number(e.target.value) }));

$('d-product').addEventListener('change', (e) => {
  const lead = openLead();
  const product = PRODUCTS.find((p) => p.id === e.target.value);
  const previous = PRODUCTS.find((p) => p.id === lead?.product);
  const patch = { product: e.target.value || null };
  // Preenche o valor se estava vazio ou era o preço do produto anterior.
  const currentValue = lead?.value === null || lead?.value === undefined ? null : Number(lead.value);
  if (product?.price && (currentValue === null || currentValue === previous?.price)) patch.value = product.price;
  if (patch.value !== undefined) $('d-value').value = patch.value;
  saveField(patch);
});

$('d-phone-input').addEventListener('change', (e) => {
  const lead = openLead();
  if (!lead) return;
  const raw = e.target.value.trim();
  if (!raw) {
    if (!lead.last_message_at) saveField({ phone: null, wa_jid: null });
    return;
  }
  const phone = normalizePhone(raw);
  if (!phone) {
    toast('Número inválido. Use DDD + número, por exemplo 51 99999-9999.');
    return;
  }
  const patch = { phone };
  // Cards criados à mão ainda não têm endereço no WhatsApp; a ponte confere ao enviar.
  if (!lead.last_message_at) patch.wa_jid = `${phone}@s.whatsapp.net`;
  e.target.value = formatPhone(phone);
  saveField(patch);
});

$('d-template').addEventListener('change', (e) => {
  const template = TEMPLATES[Number(e.target.value)];
  e.target.value = '';
  if (!template) return;
  const lead = openLead() || {};
  const name = firstName(lead);
  let text = template.text
    .replaceAll('{produto}', lead.product || '')
    .replaceAll('{valor}', lead.value !== null && lead.value !== undefined ? money(lead.value) : 'R$ —');
  text = name ? text.replaceAll('{nome}', name) : text.replaceAll(', {nome}', '').replaceAll('{nome}', '');
  $('d-text').value = text.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1');
  $('d-text').focus();
});

$('d-ignore').addEventListener('click', async () => {
  const lead = openLead();
  if (!lead) return;
  const ignored = !lead.ignored;
  if (await updateLead(lead.id, { ignored })) {
    toast(ignored ? 'Contato ignorado. Novas mensagens dele não entram no CRM.' : 'Contato voltou ao quadro.');
    closeDrawer();
  }
});

$('d-delete').addEventListener('click', async () => {
  const lead = openLead();
  if (!lead) return;
  const ok = confirm(
    `Excluir o card de ${displayName(lead)} e o histórico salvo?\n\nSe ele mandar mensagem de novo, um card novo será criado. Para não receber mais, use "Ignorar contato".`,
  );
  if (!ok) return;
  const { error } = await supabase.from('crm_leads').delete().eq('id', lead.id);
  if (error) {
    toast(`Não foi possível excluir: ${error.message}`);
    return;
  }
  state.leads.delete(lead.id);
  closeDrawer();
  scheduleRender();
});

// Conversa ------------------------------------------------------------------

function renderMessages() {
  const box = $('d-messages');
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  const items = [
    ...state.messages.map((m) => ({ at: m.sent_at, me: m.from_me, body: m.body })),
    ...state.outbox.map((o) => ({ at: o.created_at, me: true, body: o.body, status: o.status, error: o.error })),
  ];

  if (!items.length) {
    box.replaceChildren(h('p', { class: 'muted', text: 'Nenhuma mensagem registrada ainda.' }));
    return;
  }

  const nodes = [];
  let lastDay = '';
  for (const item of items) {
    const date = new Date(item.at);
    const day = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
    if (day !== lastDay) {
      nodes.push(h('span', { class: 'day', text: day }));
      lastDay = day;
    }
    let time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (item.status === 'pendente' || item.status === 'enviando') time = `${time} · enviando…`;
    if (item.status === 'erro') time = `${time} · não enviada${item.error ? `: ${item.error}` : ''}`;
    nodes.push(
      h(
        'div',
        { class: `msg${item.me ? ' me' : ''}${item.status === 'erro' ? ' failed' : item.status ? ' pending' : ''}` },
        item.body,
        h('time', { datetime: item.at, text: time }),
      ),
    );
  }
  box.replaceChildren(...nodes);
  if (nearBottom || box.dataset.lead !== state.openId) box.scrollTop = box.scrollHeight;
  box.dataset.lead = state.openId;
}

function bridgeOnline() {
  const bridge = state.bridge;
  return bridge?.state === 'conectado' && Date.now() - new Date(bridge.updated_at).getTime() < BRIDGE_STALE_MS;
}

function updateReplyHint() {
  const lead = openLead();
  let hint = '';
  if (lead && !lead.wa_jid) hint = 'Informe o telefone para poder enviar.';
  else if (!bridgeOnline()) hint = 'A ponte está desligada: a mensagem sai quando ela voltar.';
  $('d-reply-hint').textContent = hint;
}

$('d-reply').addEventListener('submit', async (event) => {
  event.preventDefault();
  const lead = openLead();
  const body = $('d-text').value.trim();
  if (!lead || !body) return;
  if (!lead.wa_jid) {
    toast('Informe o telefone do contato antes de enviar.');
    $('d-phone-input').focus();
    return;
  }
  const button = event.submitter;
  button.disabled = true;
  const { data, error } = await supabase.from('crm_outbox').insert({ lead_id: lead.id, body }).select().single();
  button.disabled = false;
  if (error) {
    toast(`Não foi possível enviar: ${error.message}`);
    return;
  }
  $('d-text').value = '';
  if (!state.outbox.some((o) => o.id === data.id)) state.outbox.push(data);
  renderMessages();
  $('d-messages').scrollTop = $('d-messages').scrollHeight;
});

$('d-text').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) $('d-reply').requestSubmit();
});

// ---------------------------------------------------------------------------
// Conexão com o WhatsApp (ponte)
// ---------------------------------------------------------------------------

let lastQr = null;
function renderBridge() {
  const bridge = state.bridge;
  const stale = !bridge || Date.now() - new Date(bridge.updated_at).getTime() > BRIDGE_STALE_MS;
  let key = stale ? 'offline' : bridge.state;
  const labels = {
    offline: 'Ponte desligada',
    iniciando: 'Conectando…',
    qr: 'Escaneie o QR Code',
    conectado: bridge?.phone ? `WhatsApp ${formatPhone(bridge.phone)}` : 'WhatsApp conectado',
    desconectado: 'Reconectando…',
    sessao_encerrada: 'Sessão encerrada',
  };
  if (!labels[key]) key = 'desconectado';
  $('bridge-pill').dataset.state = key;
  $('bridge-label').textContent = labels[key];

  const showQr = key === 'qr' && bridge.qr;
  $('qr-panel').hidden = !showQr;
  if (showQr && bridge.qr !== lastQr) {
    lastQr = bridge.qr;
    QRCode.toCanvas($('qr-canvas'), bridge.qr, { width: 240, margin: 1 }).catch(() => {});
  }
  updateReplyHint();
}

$('bridge-pill').addEventListener('click', () => {
  const key = $('bridge-pill').dataset.state;
  const help = {
    offline: 'A ponte não dá sinal há alguns minutos. Confira se o servidor está ligado (veja crm/README.md).',
    conectado: 'Tudo certo: mensagens novas entram no quadro automaticamente.',
    qr: 'Escaneie o QR Code acima com o WhatsApp do celular.',
  };
  toast(help[key] || 'A ponte está tentando se reconectar ao WhatsApp.');
});

async function loadBridge() {
  const { data } = await supabase.from('crm_bridge_status').select('*').eq('id', 1).maybeSingle();
  state.bridge = data;
  renderBridge();
}

// ---------------------------------------------------------------------------
// Tempo real
// ---------------------------------------------------------------------------

let subscribedOnce = false;

function subscribe() {
  subscribedOnce = false;
  state.channel = supabase
    .channel('crm-board')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, ({ eventType, new: row, old }) => {
      if (eventType === 'DELETE') {
        state.leads.delete(old.id);
        if (state.openId === old.id) closeDrawer();
      } else {
        state.leads.set(row.id, row);
        if (state.openId === row.id) {
          fillDrawer();
          if (row.unread_count && !document.hidden) markRead();
        }
      }
      scheduleRender();
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'crm_messages' }, ({ new: row }) => {
      if (row.lead_id !== state.openId || state.messages.some((m) => m.id === row.id)) return;
      state.messages.push(row);
      state.messages.sort((a, b) => a.sent_at.localeCompare(b.sent_at));
      renderMessages();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_outbox' }, ({ new: row }) => {
      if (!row?.id || row.lead_id !== state.openId) return;
      state.outbox = state.outbox.filter((o) => o.id !== row.id);
      if (row.status !== 'enviado') state.outbox.push(row);
      renderMessages();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crm_bridge_status' }, ({ new: row }) => {
      state.bridge = row;
      renderBridge();
    })
    .subscribe((status) => {
      // Ao reconectar, recarrega para não perder o que chegou no intervalo.
      if (status === 'SUBSCRIBED' && subscribedOnce) {
        loadLeads();
        loadBridge();
      }
      if (status === 'SUBSCRIBED') subscribedOnce = true;
    });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden || !state.started) return;
  loadLeads();
  loadBridge();
  if (state.openId) markRead();
});

setInterval(() => {
  if (!state.started) return;
  renderBridge();
  scheduleRender(); // atualiza "há 5 min" e os retornos do dia
}, 30_000);

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

function startBoard() {
  if (state.started) return;
  state.started = true;
  show('board-view');
  buildColumns();
  renderBridge();
  loadLeads();
  loadBridge();
  subscribe();
}

function stopBoard() {
  if (state.channel) supabase.removeChannel(state.channel);
  state.channel = null;
  state.started = false;
  state.leads = new Map();
  state.bridge = null;
  closeDrawer();
  show('login-view');
}

if (!configured) {
  show('setup-view');
} else {
  supabase.auth.onAuthStateChange((_event, session) => {
    // Não chamar o Supabase direto aqui dentro (recomendação da biblioteca).
    setTimeout(() => (session ? startBoard() : stopBoard()), 0);
  });
}
