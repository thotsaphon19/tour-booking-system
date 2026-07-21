import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listTripRequests } from "@/lib/queries/tripRequests";
import { formatDate } from "@/lib/format";
import TripRequestStatusSelect from "@/components/admin/TripRequestStatusSelect";
import { deleteTripRequestAction } from "@/lib/actions/tripRequests";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LockedAddButton, LockedIconButton } from "@/components/admin/LockedControls";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

const GUIDE_LABELS: Record<string, string> = {
  private_guide: "ต้องการไกด์ส่วนตัว",
  no_guide: "ไม่ต้องการไกด์",
  car_with_driver: "รถพร้อมคนขับเท่านั้น",
};

export default async function AdminTripRequestsPage() {
  const requests = await listTripRequests();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "trip_requests");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="ทัวร์ตามสั่ง" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">คำขอทัวร์ตามสั่ง</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {requests.length} คำขอ</p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/trip-requests/new"
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-jade)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
          >
            <Plus size={15} /> เพิ่มคำขอ
          </Link>
        ) : (
          <LockedAddButton label="เพิ่มคำขอ" />
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">ลูกค้า</th>
              <th className="px-5 py-3">ช่วงเวลาเดินทาง</th>
              <th className="px-5 py-3">ผู้เดินทาง</th>
              <th className="px-5 py-3">ไกด์/ที่พัก</th>
              <th className="px-5 py-3">งบประมาณ</th>
              <th className="px-5 py-3">สถานที่สนใจ</th>
              <th className="px-5 py-3">ทัวร์อ้างอิง</th>
              <th className="px-5 py-3">ส่งเมื่อ</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-[var(--color-border)] align-top last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-[var(--color-jade-dark)]">{r.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{r.email}</p>
                  <p className="text-xs text-[var(--color-muted)]">{r.whatsapp}</p>
                  <p className="text-xs text-[var(--color-muted)]">{r.nationality}</p>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                  <p>{r.arrival_date} → {r.departure_date}</p>
                  <p className="text-xs text-[var(--color-muted)]">{r.trip_length_days ? `${r.trip_length_days} วัน` : "-"}</p>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                  <p>{r.traveler_count ?? "-"} คน</p>
                  <p className="text-xs text-[var(--color-muted)]">{r.traveler_type || "-"}</p>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                  <p>{r.guide_preference ? GUIDE_LABELS[r.guide_preference] || r.guide_preference : "-"}</p>
                  {r.guide_language && <p className="text-xs text-[var(--color-muted)]">ภาษา: {r.guide_language}</p>}
                  <p className="text-xs text-[var(--color-muted)]">{r.hotel_level || "-"}</p>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">
                  {r.budget_per_person ? `${r.budget_per_person} ${r.currency || ""}/คน` : "-"}
                </td>
                <td className="px-5 py-3 max-w-xs text-[var(--color-ink-soft)]">{r.places_of_interest || "-"}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{r.tour_slug || "-"}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{formatDate(r.created_at)}</td>
                <td className="px-5 py-3">
                  <TripRequestStatusSelect id={r.id} status={r.status} readOnly={!canEdit} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {canEdit ? (
                      <>
                        <Link
                          href={`/admin/trip-requests/${r.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                        >
                          <Pencil size={14} />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteTripRequestAction(r.id, r.name);
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
            {requests.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ยังไม่มีคำขอทัวร์ตามสั่ง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
