import { getSettings } from "@/lib/queries/settings";
import SettingsForm from "@/components/admin/SettingsForm";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "settings");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">ตั้งค่าเว็บไซต์</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">ข้อมูลเหล่านี้ใช้แสดงในฟุตเตอร์ ปุ่ม WhatsApp ลอย และหน้าติดต่อเรา</p>
      <div className="mt-8">
        {canEdit ? <SettingsForm settings={settings} /> : <PermissionLocked sectionLabel="ตั้งค่าเว็บไซต์" />}
      </div>
    </div>
  );
}
