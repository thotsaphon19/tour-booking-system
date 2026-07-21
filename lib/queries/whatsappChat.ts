import { query, queryOne } from "@/lib/db";

export interface WhatsAppConversation {
  id: number;
  visitor_name: string | null;
  visitor_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: number;
  conversation_id: number;
  direction: "inbound" | "outbound";
  body: string;
  wa_message_id: string | null;
  status: string;
  created_at: string;
}

/** Finds the most recent open conversation for a phone number, or creates a
 *  new one. Phone numbers are normalized to digits-only so "+66 81 234 5678"
 *  and "0812345678" style variants still match the same thread. */
export async function findOrCreateConversation(phone: string, name?: string): Promise<WhatsAppConversation> {
  const digits = phone.replace(/[^0-9]/g, "");
  const existing = await queryOne<WhatsAppConversation>(
    "SELECT * FROM whatsapp_conversations WHERE visitor_phone = $1 ORDER BY created_at DESC LIMIT 1",
    [digits]
  );
  if (existing) {
    if (name && !existing.visitor_name) {
      await query("UPDATE whatsapp_conversations SET visitor_name = $1 WHERE id = $2", [name, existing.id]);
      return { ...existing, visitor_name: name };
    }
    return existing;
  }
  const created = await queryOne<WhatsAppConversation>(
    "INSERT INTO whatsapp_conversations (visitor_name, visitor_phone) VALUES ($1, $2) RETURNING *",
    [name || null, digits]
  );
  return created!;
}

export async function findConversationByPhone(phone: string): Promise<WhatsAppConversation | null> {
  const digits = phone.replace(/[^0-9]/g, "");
  return queryOne<WhatsAppConversation>(
    "SELECT * FROM whatsapp_conversations WHERE visitor_phone = $1 ORDER BY created_at DESC LIMIT 1",
    [digits]
  );
}

export async function getConversationById(id: number): Promise<WhatsAppConversation | null> {
  return queryOne<WhatsAppConversation>("SELECT * FROM whatsapp_conversations WHERE id = $1", [id]);
}

export async function listConversations(): Promise<WhatsAppConversation[]> {
  return query<WhatsAppConversation>("SELECT * FROM whatsapp_conversations ORDER BY updated_at DESC");
}

export async function addMessage(
  conversationId: number,
  direction: "inbound" | "outbound",
  body: string,
  waMessageId?: string,
  status = "sent"
): Promise<WhatsAppMessage> {
  const msg = await queryOne<WhatsAppMessage>(
    `INSERT INTO whatsapp_messages (conversation_id, direction, body, wa_message_id, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [conversationId, direction, body, waMessageId || null, status]
  );
  await query("UPDATE whatsapp_conversations SET updated_at = NOW() WHERE id = $1", [conversationId]);
  return msg!;
}

export async function listMessages(conversationId: number): Promise<WhatsAppMessage[]> {
  return query<WhatsAppMessage>(
    "SELECT * FROM whatsapp_messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [conversationId]
  );
}

export async function listMessagesSince(conversationId: number, sinceId: number): Promise<WhatsAppMessage[]> {
  return query<WhatsAppMessage>(
    "SELECT * FROM whatsapp_messages WHERE conversation_id = $1 AND id > $2 ORDER BY created_at ASC",
    [conversationId, sinceId]
  );
}
