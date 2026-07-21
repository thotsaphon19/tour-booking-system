"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPartnerEmbed, updatePartnerEmbed, deletePartnerEmbed } from "@/lib/queries/partnerEmbeds";
import { getSession, canEditSection, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

const schema = z.object({
  label: z.string().optional(),
  html: z.string().min(5, "กรุณาวางโค้ด HTML ของวิดเจ็ต"),
  sort_order: z.coerce.number().int().default(0),
});

export type PartnerEmbedFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

export async function createPartnerEmbedAction(_prev: PartnerEmbedFormState, formData: FormData): Promise<PartnerEmbedFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("partner_embeds"))) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  await createPartnerEmbed({ label: parsed.data.label || "", html: parsed.data.html, sort_order: parsed.data.sort_order });
  revalidatePath("/admin/partner-embeds");
  revalidatePath("/", "layout");
  return { ok: true, message: "เพิ่มวิดเจ็ตแล้ว — เพิ่มรายการถัดไปได้เลย" };
}

export async function updatePartnerEmbedAction(id: number, _prev: PartnerEmbedFormState, formData: FormData): Promise<PartnerEmbedFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("partner_embeds"))) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  await updatePartnerEmbed(id, { label: parsed.data.label || "", html: parsed.data.html, sort_order: parsed.data.sort_order });
  revalidatePath("/admin/partner-embeds");
  revalidatePath("/", "layout");
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deletePartnerEmbedAction(id: number, label: string) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("partner_embeds"))) return;

  const result = await deleteWithApproval("partner_embeds", id, label, () => deletePartnerEmbed(id));
  revalidatePath("/admin/partner-embeds");
  revalidatePath("/admin/deletion-requests");
  revalidatePath("/", "layout");
  return result;
}
