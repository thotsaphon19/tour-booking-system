"use server";

import { redirect } from "next/navigation";
import { getAdminByEmail, verifyPassword, createSession, destroySession } from "@/lib/auth";

export type LoginState = { ok: boolean; message?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const admin = await getAdminByEmail(email);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  await createSession(admin);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
