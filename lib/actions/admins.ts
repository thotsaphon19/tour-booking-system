"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getCurrentAdmin,
  countSuperAdmins,
  getAdminById,
} from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import type { AdminRole } from "@/lib/types";

async function requireSuperAdmin() {
  const admin = await getCurrentAdmin();
  if (!isSuperAdmin(admin)) redirect("/admin");
  return admin!;
}

const baseSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  role: z.enum(["admin", "super_admin"]),
  permissions: z.union([z.string(), z.array(z.string())]).optional(),
});

export type AdminUserFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

function toPermissionsArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function createAdminAction(_prev: AdminUserFormState, formData: FormData): Promise<AdminUserFormState> {
  await requireSuperAdmin();

  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    return { ok: false, fieldErrors: { password: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = baseSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  try {
    await createAdmin({
      email: parsed.data.email,
      password,
      name: parsed.data.name,
      role: parsed.data.role as AdminRole,
      permissions: parsed.data.role === "super_admin" ? [] : toPermissionsArray(formData.getAll("permissions") as string[]),
    });
  } catch {
    return { ok: false, message: "อีเมลนี้มีผู้ใช้งานในระบบแล้ว" };
  }

  revalidatePath("/admin/admins");
  redirect("/admin/admins?created=1");
}

export async function updateAdminAction(id: number, _prev: AdminUserFormState, formData: FormData): Promise<AdminUserFormState> {
  await requireSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = baseSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  // Refuse to demote the last remaining super admin — the system must
  // always have at least one, or nobody could manage permissions anymore.
  if (parsed.data.role !== "super_admin") {
    const target = await getAdminById(id);
    if (target?.role === "super_admin" && (await countSuperAdmins()) <= 1) {
      return { ok: false, message: "ไม่สามารถลดสิทธิ์ได้ ต้องมี Super Admin อย่างน้อย 1 คนเสมอ" };
    }
  }

  const password = String(formData.get("password") || "");
  await updateAdmin(id, {
    name: parsed.data.name,
    role: parsed.data.role as AdminRole,
    permissions: parsed.data.role === "super_admin" ? [] : toPermissionsArray(formData.getAll("permissions") as string[]),
    password: password.length >= 8 ? password : undefined,
  });

  revalidatePath("/admin/admins");
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteAdminAction(id: number) {
  const current = await requireSuperAdmin();

  if (current.id === id) return; // can't delete your own account from under yourself

  const target = await getAdminById(id);
  if (target?.role === "super_admin" && (await countSuperAdmins()) <= 1) {
    return; // refuse silently — UI already explains this rule
  }

  await deleteAdmin(id);
  revalidatePath("/admin/admins");
}
