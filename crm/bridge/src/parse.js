// Funções puras: transformam uma mensagem do WhatsApp nos dados do CRM.
import {
  getContentType,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  isJidStatusBroadcast,
  isLidUser,
  isPnUser,
  jidNormalizedUser,
  normalizeMessageContent,
} from 'baileys';

/** Conversas que nunca viram card: grupos, status, listas de transmissão e canais. */
export function isIgnoredChat(jid) {
  if (!jid) return true;
  return Boolean(
    isJidGroup(jid) || isJidStatusBroadcast(jid) || isJidBroadcast(jid) || isJidNewsletter(jid),
  );
}

export function phoneFromJid(jid) {
  if (!jid || !isPnUser(jid)) return null;
  const digits = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
  return digits || null;
}

/**
 * Identifica o contato de uma conversa individual.
 * O WhatsApp pode endereçar o contato pelo telefone (@s.whatsapp.net) ou por um
 * identificador anônimo (@lid); quando os dois vêm, guardamos os dois.
 */
export function contactFromKey(key) {
  const candidates = [key?.remoteJid, key?.remoteJidAlt]
    .filter(Boolean)
    .map((jid) => jidNormalizedUser(jid));
  const pnJid = candidates.find((jid) => isPnUser(jid)) ?? null;
  const lid = candidates.find((jid) => isLidUser(jid)) ?? null;
  if (!pnJid && !lid) return null;
  return { jid: pnJid ?? lid, lid, phone: phoneFromJid(pnJid) };
}

const withCaption = (label, caption) => (caption?.trim() ? `${label}: ${caption.trim()}` : label);

/** Texto legível da mensagem, ou null para o que não deve aparecer no CRM. */
export function messageText(rawMessage) {
  const message = normalizeMessageContent(rawMessage);
  if (!message) return null;
  const type = getContentType(message);
  const content = type ? message[type] : null;

  switch (type) {
    case 'conversation':
      return message.conversation?.trim() || null;
    case 'extendedTextMessage':
      return content?.text?.trim() || null;
    case 'imageMessage':
      return withCaption('📷 Imagem', content?.caption);
    case 'videoMessage':
      return withCaption(content?.gifPlayback ? '🎞️ GIF' : '🎥 Vídeo', content?.caption);
    case 'ptvMessage':
      return '🎥 Vídeo';
    case 'audioMessage':
      return content?.ptt ? '🎤 Áudio' : '🎵 Arquivo de áudio';
    case 'documentMessage':
      return withCaption(`📄 ${content?.fileName || 'Documento'}`, content?.caption);
    case 'documentWithCaptionMessage':
      return messageText(content?.message);
    case 'stickerMessage':
      return '🏷️ Figurinha';
    case 'locationMessage':
    case 'liveLocationMessage':
      return '📍 Localização';
    case 'contactMessage':
      return `👤 Contato: ${content?.displayName || 'sem nome'}`;
    case 'contactsArrayMessage':
      return '👥 Contatos';
    case 'buttonsResponseMessage':
      return content?.selectedDisplayText || null;
    case 'listResponseMessage':
      return content?.title || null;
    case 'templateButtonReplyMessage':
      return content?.selectedDisplayText || null;
    case 'pollCreationMessage':
    case 'pollCreationMessageV2':
    case 'pollCreationMessageV3':
      return `📊 Enquete: ${content?.name || ''}`.trim();
    default:
      // Reações, confirmações de leitura, edições, mensagens apagadas e afins.
      return null;
  }
}

function toDate(timestamp) {
  const seconds = Number(timestamp);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : new Date();
}

/** Converte uma mensagem do Baileys nos parâmetros de crm_ingest_message, ou null. */
export function toIngestParams(msg, { createFromOutgoing = false } = {}) {
  const key = msg?.key;
  if (!key?.id || isIgnoredChat(key.remoteJid)) return null;

  const contact = contactFromKey(key);
  if (!contact) return null;

  const body = messageText(msg.message);
  if (!body) return null;

  const fromMe = Boolean(key.fromMe);
  return {
    p_jid: contact.jid,
    p_lid: contact.lid,
    p_phone: contact.phone,
    p_push_name: fromMe ? null : msg.pushName?.trim() || null,
    p_from_me: fromMe,
    p_wa_message_id: key.id,
    p_body: body,
    p_sent_at: toDate(msg.messageTimestamp).toISOString(),
    p_create_if_missing: !fromMe || createFromOutgoing,
  };
}
