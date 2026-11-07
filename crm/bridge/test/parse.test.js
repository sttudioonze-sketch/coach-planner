import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contactFromKey, isIgnoredChat, messageText, toIngestParams } from '../src/parse.js';

const incoming = (overrides = {}) => ({
  key: { remoteJid: '5551988887777@s.whatsapp.net', fromMe: false, id: 'ABC123' },
  pushName: 'João',
  messageTimestamp: 1_762_510_000,
  message: { conversation: 'Oi, quero o ELITE' },
  ...overrides,
});

test('mensagem de texto recebida vira parâmetros do CRM', () => {
  assert.deepEqual(toIngestParams(incoming()), {
    p_jid: '5551988887777@s.whatsapp.net',
    p_lid: null,
    p_phone: '5551988887777',
    p_push_name: 'João',
    p_from_me: false,
    p_wa_message_id: 'ABC123',
    p_body: 'Oi, quero o ELITE',
    p_sent_at: new Date(1_762_510_000 * 1000).toISOString(),
    p_create_if_missing: true,
  });
});

test('mensagem enviada por mim não usa meu nome nem cria card por padrão', () => {
  const params = toIngestParams(
    incoming({ key: { remoteJid: '5551988887777@s.whatsapp.net', fromMe: true, id: 'X' }, pushName: 'Eu' }),
  );
  assert.equal(params.p_from_me, true);
  assert.equal(params.p_push_name, null);
  assert.equal(params.p_create_if_missing, false);
  assert.equal(
    toIngestParams(incoming({ key: { remoteJid: '5551988887777@s.whatsapp.net', fromMe: true, id: 'X' } }), {
      createFromOutgoing: true,
    }).p_create_if_missing,
    true,
  );
});

test('grupos, status e canais são ignorados', () => {
  assert.equal(isIgnoredChat('120363000000000000@g.us'), true);
  assert.equal(isIgnoredChat('status@broadcast'), true);
  assert.equal(isIgnoredChat('120363000000000000@newsletter'), true);
  assert.equal(isIgnoredChat('5551988887777@s.whatsapp.net'), false);
  assert.equal(toIngestParams(incoming({ key: { remoteJid: '1203@g.us', id: 'G' } })), null);
});

test('contato por LID guarda o telefone quando ele vem junto', () => {
  assert.deepEqual(contactFromKey({ remoteJid: '123456@lid', remoteJidAlt: '5551977776666@s.whatsapp.net' }), {
    jid: '5551977776666@s.whatsapp.net',
    lid: '123456@lid',
    phone: '5551977776666',
  });
  assert.deepEqual(contactFromKey({ remoteJid: '123456@lid' }), { jid: '123456@lid', lid: '123456@lid', phone: null });
});

test('mídias viram descrições legíveis', () => {
  assert.equal(messageText({ imageMessage: { caption: 'comprovante' } }), '📷 Imagem: comprovante');
  assert.equal(messageText({ audioMessage: { ptt: true } }), '🎤 Áudio');
  assert.equal(messageText({ documentMessage: { fileName: 'pix.pdf' } }), '📄 pix.pdf');
  assert.equal(messageText({ extendedTextMessage: { text: ' link https://x ' } }), 'link https://x');
  assert.equal(
    messageText({ ephemeralMessage: { message: { conversation: 'temporária' } } }),
    'temporária',
  );
});

test('reações e mensagens de sistema não entram', () => {
  assert.equal(messageText({ reactionMessage: { text: '👍' } }), null);
  assert.equal(messageText({ protocolMessage: { type: 0 } }), null);
  assert.equal(toIngestParams(incoming({ message: { reactionMessage: { text: '👍' } } })), null);
  assert.equal(toIngestParams(incoming({ message: undefined })), null);
});
