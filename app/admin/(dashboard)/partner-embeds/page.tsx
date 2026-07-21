import { listPartnerEmbeds } from "@/lib/queries/partnerEmbeds";
import PartnerEmbedForm from "@/components/admin/PartnerEmbedForm";
import PartnerEmbedListItem from "@/components/admin/PartnerEmbedListItem";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function AdminPartnerEmbedsPage() {
  const embeds = await listPartnerEmbeds();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "partner_embeds");

  return (
    <div className="max-w-2xl">
      {!canEdit && <ReadOnlyBanner sectionLabel="วิดเจ็ต/ลิงก์พันธมิตร" />}
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">วิดเจ็ต/ลิงก์พันธมิตร</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        วางโค้ด HTML จากพันธมิตร (เช่น GetYourGuide, Viator, Klook) เพื่อแสดงป้าย/ลิงก์ในหน้าเว็บได้ เพิ่มได้ไม่จำกัดจำนวนรายการ —
        จะแสดงในฟุตเตอร์ของทุกหน้า เรียงตาม "ลำดับการแสดง" จากน้อยไปมาก
      </p>

      {canEdit && (
        <div className="mt-8">
          <PartnerEmbedForm />
        </div>
      )}

      <div className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-ink-soft)]">รายการที่เพิ่มแล้ว ({embeds.length})</h2>
        {embeds.map((embed) => (
          <PartnerEmbedListItem key={embed.id} embed={embed} readOnly={!canEdit} />
        ))}
        {embeds.length === 0 && <p className="text-sm text-[var(--color-muted)]">ยังไม่มีวิดเจ็ตพันธมิตร</p>}
      </div>
    </div>
  );
}
