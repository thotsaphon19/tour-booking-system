import { getSettings } from "@/lib/queries/settings";
import AboutForm from "@/components/admin/AboutForm";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function AdminAboutPage() {
  const settings = await getSettings();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "about");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">หน้าเกี่ยวกับเรา</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">เนื้อหาที่แสดงในหน้า &quot;เกี่ยวกับเรา&quot; ของเว็บไซต์ ปรับได้ทุกภาษา</p>
      <div className="mt-8">
        {canEdit ? <AboutForm settings={settings} /> : <PermissionLocked sectionLabel="หน้าเกี่ยวกับเรา" />}
      </div>
    </div>
  );
}
