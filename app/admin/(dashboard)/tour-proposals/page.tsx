import Link from "next/link";
import { Plus, Pencil, FileDown, Trash2 } from "lucide-react";
import { listTourProposals } from "@/lib/queries/tourProposals";
import { formatDate } from "@/lib/format";
import { deleteTourProposalAction } from "@/lib/actions/tourProposals";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LockedAddButton, LockedIconButton } from "@/components/admin/LockedControls";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function TourProposalsPage() {
  const proposals = await listTourProposals();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "tour_proposals");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="ใบเสนอราคาลูกค้า" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">ใบเสนอราคาลูกค้า</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            สำหรับตอบรับลูกค้าที่ต้องการจัดทัวร์เฉพาะบุคคล — ทั้งหมด {proposals.length} รายการ
          </p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/tour-proposals/new"
            className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
          >
            <Plus size={16} /> สร้างใบเสนอราคาใหม่
          </Link>
        ) : (
          <LockedAddButton label="สร้างใบเสนอราคาใหม่" />
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">ลูกค้า</th>
              <th className="px-5 py-3">โปรแกรมทัวร์</th>
              <th className="px-5 py-3">วันเดินทาง</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3">สร้างเมื่อ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-[var(--color-jade-dark)]">{p.client_name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{p.client_email}</p>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{p.title}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                  {p.travel_start_date ? `${p.travel_start_date} → ${p.travel_end_date}` : "-"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.status === "sent" ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-border)] text-[var(--color-muted)]"
                    }`}
                  >
                    {p.status === "sent" ? "ส่งแล้ว" : "ฉบับร่าง"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{formatDate(p.created_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <a
                      href={`/api/admin/tour-proposals/${p.id}/pdf`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
                    >
                      <FileDown size={14} />
                    </a>
                    {canEdit ? (
                      <>
                        <Link
                          href={`/admin/tour-proposals/${p.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                        >
                          <Pencil size={14} />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteTourProposalAction(p.id, `ใบเสนอราคา: ${p.client_name} — ${p.title}`);
                          }}
                        >
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <LockedIconButton />
                        <LockedIconButton />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {proposals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ยังไม่มีใบเสนอราคา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
