"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/queries/settings";
import { getSession, canEditSection } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

export type LanguagePageFormState = { ok: boolean; message?: string };

export async function updateLanguagePageAction(
  _prev: LanguagePageFormState,
  formData: FormData
): Promise<LanguagePageFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("language_page"))) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const json = String(formData.get("language_page_json") || "{}");
  try {
    JSON.parse(json);
  } catch {
    return { ok: false, message: "ข้อมูลไม่ถูกต้อง กรุณาลองใหม่" };
  }

  await updateSettings({ language_page_json: json });
  revalidatePath("/");
  return { ok: true, message: "บันทึกหน้าเลือกภาษาแล้ว" };
}
