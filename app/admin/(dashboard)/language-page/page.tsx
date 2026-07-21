import { getSettings } from "@/lib/queries/settings";
import LanguagePageForm from "@/components/admin/LanguagePageForm";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function AdminLanguagePagePage() {
  const settings = await getSettings();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "language_page");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">หน้าเลือกภาษา</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">หน้าแรกสุดที่ลูกค้าเห็นก่อนเข้าเว็บไซต์ — จัดการรูปภาพและคำโปรยของแต่ละภาษาได้ที่นี่</p>
      <div className="mt-8">
        {canEdit ? <LanguagePageForm languagePageJson={settings.language_page_json} /> : <PermissionLocked sectionLabel="หน้าเลือกภาษา" />}
      </div>
    </div>
  );
}
