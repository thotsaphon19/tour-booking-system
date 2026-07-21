"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/queries/settings";
import { getSession, canEditSection } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

export type SettingsFormState = { ok: boolean; message?: string };

export async function updateSettingsAction(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("settings"))) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  await updateSettings(raw as Record<string, string>);

  revalidatePath("/", "layout");
  return { ok: true, message: "บันทึกการตั้งค่าแล้ว" };
}
