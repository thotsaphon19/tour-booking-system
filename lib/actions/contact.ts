"use server";

import { z } from "zod";
import { createContactMessage } from "@/lib/queries/news";
import { sendContactAck } from "@/lib/email";
import { getSettings, parseNotificationEmails } from "@/lib/queries/settings";

const contactSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อ"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  subject: z.string().optional(),
  message: z.string().min(5, "กรุณากรอกข้อความ"),
});

export type ContactFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  await createContactMessage(parsed.data);
  await sendContactAck({
    name: parsed.data.name,
    email: parsed.data.email,
    adminEmails: parseNotificationEmails((await getSettings()).notification_emails),
  });

  return { ok: true, message: "ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับโดยเร็วที่สุด" };
}
