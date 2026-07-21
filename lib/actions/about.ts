"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/queries/settings";
import { getSession, canEditSection } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

export type AboutFormState = { ok: boolean; message?: string };

const aboutSchema = z.object({
  about_kicker: z.string().min(1, "กรุณากรอกข้อความ"),
  about_title: z.string().min(1, "กรุณากรอกหัวข้อ"),
  about_intro: z.string().min(1, "กรุณากรอกเนื้อหาแนะนำ"),
  about_value1_title: z.string().optional(),
  about_value1_desc: z.string().optional(),
  about_value2_title: z.string().optional(),
  about_value2_desc: z.string().optional(),
  about_value3_title: z.string().optional(),
  about_value3_desc: z.string().optional(),
  about_translations_json: z.string().optional(),
});

export async function updateAboutAction(_prev: AboutFormState, formData: FormData): Promise<AboutFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("about"))) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  const parsed = aboutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  await updateSettings(parsed.data as Record<string, string>);
  revalidatePath("/", "layout");
  return { ok: true, message: "บันทึกหน้าเกี่ยวกับเราแล้ว" };
}
