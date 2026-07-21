"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/lib/queries/settings";
import { sendWhatsAppMessage, isWhatsAppApiConfigured } from "@/lib/whatsapp";
import { findOrCreateConversation, addMessage, getConversationById } from "@/lib/queries/whatsappChat";
import { getSession, canEditSection } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

const startChatSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  phone: z.string().min(6, "กรุณากรอกเบอร์ WhatsApp ที่ถูกต้อง"),
  message: z.string().min(1, "กรุณากรอกข้อความ"),
});

export type StartChatState = {
  ok: boolean;
  message?: string;
  conversationId?: number;
  waLink?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Called when a visitor submits the on-site chat widget's first message.
 *
 * WhatsApp does not allow a business to freeform-message someone who has
 * never messaged the business first (Meta's anti-spam policy — see
 * lib/whatsapp.ts). So this doesn't send anything via the API. Instead it:
 * 1. Creates/reuses a conversation thread keyed by the visitor's phone number.
 * 2. Returns a wa.me deep link with the message pre-filled, which the
 *    widget opens so the visitor sends it themselves from their own
 *    WhatsApp — that's what legitimately "opens the door" for the business
 *    to reply via the API afterward, within the 24-hour service window.
 * Once that reply comes in via the webhook, it'll show up back in the
 * widget (which polls this conversation) and in the admin inbox.
 */
export async function startWebsiteChat(_prev: StartChatState, formData: FormData): Promise<StartChatState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = startChatSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const settings = await getSettings();
  const conversation = await findOrCreateConversation(parsed.data.phone, parsed.data.name);

  const digits = settings.whatsapp_number.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${digits}?text=${encodeURIComponent(parsed.data.message)}`;

  return { ok: true, conversationId: conversation.id, waLink };
}

const replySchema = z.object({
  conversation_id: z.coerce.number().int().positive(),
  body: z.string().min(1, "กรุณากรอกข้อความ"),
});

export type ReplyState = { ok: boolean; message?: string };

/** Admin inbox reply — actually sends via the Cloud API (works only within
 *  the 24h window after the visitor's last inbound message, or if WhatsApp
 *  API credentials aren't configured, it just tells the admin so). */
export async function sendAdminWhatsAppReply(_prev: ReplyState, formData: FormData): Promise<ReplyState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "กรุณาเข้าสู่ระบบ" };
  if (!(await canEditSection("whatsapp"))) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  const parsed = replySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: "กรุณากรอกข้อความ" };

  const settings = await getSettings();
  if (!isWhatsAppApiConfigured(settings)) {
    return { ok: false, message: "ยังไม่ได้ตั้งค่า WhatsApp API ในหน้าตั้งค่า — กรุณากรอก Phone Number ID และ Access Token ก่อน" };
  }

  const conversation = await getConversationById(parsed.data.conversation_id);
  if (!conversation) return { ok: false, message: "ไม่พบบทสนทนานี้" };

  const result = await sendWhatsAppMessage(settings, conversation.visitor_phone, parsed.data.body);
  if (!result.sent) {
    return { ok: false, message: `ส่งไม่สำเร็จ: ${result.error || "ไม่ทราบสาเหตุ"}` };
  }

  await addMessage(conversation.id, "outbound", parsed.data.body, result.waMessageId);
  revalidatePath("/admin/whatsapp");
  return { ok: true, message: "ส่งข้อความแล้ว" };
}
