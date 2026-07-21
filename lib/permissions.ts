import type { AdminUser } from "@/lib/types";

/** Every editable section of the admin panel that a super admin can grant
 *  or withhold, one by one, per admin user. Dashboard is intentionally left
 *  out — it's read-only stats, nothing to lock. Managing admins itself is
 *  never grantable; only a super admin can ever do that. */
export const PERMISSION_SECTIONS = [
  { key: "tours", label: "จัดการทัวร์" },
  { key: "tour_proposals", label: "ใบเสนอราคาลูกค้า" },
  { key: "bookings", label: "การจอง" },
  { key: "trip_requests", label: "ทัวร์ตามสั่ง" },
  { key: "whatsapp", label: "แชท WhatsApp" },
  { key: "customers", label: "ลูกค้า" },
  { key: "reviews", label: "รีวิวลูกค้า" },
  { key: "news", label: "บทความ" },
  { key: "partner_embeds", label: "วิดเจ็ตพันธมิตร" },
  { key: "about", label: "หน้าเกี่ยวกับเรา" },
  { key: "language_page", label: "หน้าเลือกภาษา" },
  { key: "settings", label: "ตั้งค่าเว็บไซต์" },
] as const;

export type PermissionKey = (typeof PERMISSION_SECTIONS)[number]["key"];

/** Super admins bypass the permissions list entirely — they can always do
 *  everything, by design ("supper admin ทำได้ทุกอย่าง"). For a regular
 *  admin, access is granted only for sections explicitly present in their
 *  `permissions` array. */
export function hasPermission(admin: Pick<AdminUser, "role" | "permissions"> | null | undefined, key: PermissionKey): boolean {
  if (!admin) return false;
  if (admin.role === "super_admin") return true;
  return admin.permissions.includes(key);
}

export function isSuperAdmin(admin: Pick<AdminUser, "role"> | null | undefined): boolean {
  return admin?.role === "super_admin";
}

export const PERMISSION_DENIED_MESSAGE = "คุณไม่มีสิทธิ์แก้ไขข้อมูลส่วนนี้ กรุณาติดต่อ Super Admin เพื่อขอสิทธิ์";
