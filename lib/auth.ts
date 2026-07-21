import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { cache } from "react";
import { query, queryOne } from "@/lib/db";
import type { AdminUser, AdminRole } from "@/lib/types";
import { hasPermission, type PermissionKey } from "@/lib/permissions";
import { createDeletionRequest } from "@/lib/queries/deletionRequests";

const SESSION_COOKIE = "tbs_admin_session";
const JWT_SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

function rowToAdmin(row: any): AdminUser {
  return { ...row, permissions: JSON.parse(row.permissions_json || "[]") };
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const row = await queryOne("SELECT * FROM admin_users WHERE email = $1", [email]);
  return row ? rowToAdmin(row) : null;
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
  const row = await queryOne("SELECT * FROM admin_users WHERE id = $1", [id]);
  return row ? rowToAdmin(row) : null;
}

/** Fetches the logged-in admin's role/permissions fresh from the database
 *  every time a *new* page is requested (rather than baking them into the
 *  session cookie), so a super admin revoking someone's access takes effect
 *  on their very next navigation — not only after that person's next login.
 *  cache() here only dedupes repeat calls *within one single request* (the
 *  admin layout and the page it wraps both call this independently — this
 *  was two database round-trips for the same data on every single admin
 *  page load); it does not persist across requests, so the freshness
 *  guarantee above is unaffected. */
export const getCurrentAdmin = cache(async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session) return null;
  return getAdminById(session.sub);
});

/** Fetches the logged-in admin fresh and checks whether they can edit the
 *  given section — used at the top of every mutating server action. Lives
 *  here (not in lib/permissions.ts) because it needs getCurrentAdmin, which
 *  pulls in the database client — importing that from a "use client"
 *  component (which only needs the plain PERMISSION_SECTIONS constants)
 *  would break the browser bundle. */
export async function canEditSection(key: PermissionKey): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return hasPermission(admin, key);
}

/**
 * Every delete action in the admin panel routes through here instead of
 * deleting directly. Super admins delete immediately, same as before.
 * Regular admins never delete anything themselves — this files a deletion
 * request instead, which sits in /admin/deletion-requests until a super
 * admin approves or rejects it. The actual row is untouched either way
 * until that happens.
 */
export async function deleteWithApproval(
  entityType: string,
  entityId: number,
  entityLabel: string,
  directDelete: () => Promise<void>
): Promise<{ deleted: boolean; message: string }> {
  const admin = await getCurrentAdmin();
  if (!admin) return { deleted: false, message: "กรุณาเข้าสู่ระบบ" };

  if (admin.role === "super_admin") {
    await directDelete();
    return { deleted: true, message: "ลบข้อมูลแล้ว" };
  }

  await createDeletionRequest({
    entityType,
    entityId,
    entityLabel,
    requestedBy: admin.id,
    requestedByName: admin.name,
  });
  return { deleted: false, message: "ส่งคำขอลบแล้ว รอ Super Admin อนุมัติก่อนจึงจะลบจริง" };
}

export async function listAdmins(): Promise<AdminUser[]> {
  const rows = await query("SELECT * FROM admin_users ORDER BY created_at ASC");
  return rows.map(rowToAdmin);
}

export async function countSuperAdmins(): Promise<number> {
  const row = await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM admin_users WHERE role = 'super_admin'");
  return Number(row?.c || 0);
}

export async function createAdmin(input: { email: string; password: string; name: string; role: AdminRole; permissions: string[] }): Promise<number> {
  const row = await queryOne<{ id: number }>(
    "INSERT INTO admin_users (email, password_hash, name, role, permissions_json) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [input.email, hashPassword(input.password), input.name, input.role, JSON.stringify(input.permissions)]
  );
  return row!.id;
}

export async function updateAdmin(
  id: number,
  input: { name: string; role: AdminRole; permissions: string[]; password?: string }
): Promise<void> {
  if (input.password) {
    await query("UPDATE admin_users SET name = $1, role = $2, permissions_json = $3, password_hash = $4 WHERE id = $5", [
      input.name,
      input.role,
      JSON.stringify(input.permissions),
      hashPassword(input.password),
      id,
    ]);
  } else {
    await query("UPDATE admin_users SET name = $1, role = $2, permissions_json = $3 WHERE id = $4", [
      input.name,
      input.role,
      JSON.stringify(input.permissions),
      id,
    ]);
  }
}

export async function deleteAdmin(id: number): Promise<void> {
  await query("DELETE FROM admin_users WHERE id = $1", [id]);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function ensureSeedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const existing = await getAdminByEmail(email);
  if (existing) return;
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  await query("INSERT INTO admin_users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)", [
    email,
    hashPassword(password),
    "ผู้ดูแลระบบ",
    "super_admin",
  ]);
}

export async function createSession(admin: AdminUser) {
  const token = jwt.sign({ sub: admin.id, email: admin.email, name: admin.name }, JWT_SECRET, { expiresIn: "7d" });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export interface SessionPayload {
  sub: number;
  email: string;
  name: string;
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as SessionPayload;
  } catch {
    return null;
  }
}
