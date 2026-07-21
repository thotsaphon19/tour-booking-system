import Link from "next/link";
import { listBookings } from "@/lib/queries/bookings";
import { formatDate, formatMoney } from "@/lib/format";
import BookingStatusSelect from "@/components/admin/BookingStatusSelect";
import StatusBadge from "@/components/admin/StatusBadge";
import type { BookingStatus, RequestType } from "@/lib/types";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

const statusTabs: { value?: BookingStatus; label: string }[] = [
  { value: undefined, label: "ทั้งหมด" },
  { value: "pending", label: "รอยืนยัน" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

const typeTabs: { value?: RequestType; label: string }[] = [
  { value: undefined, label: "ทุกประเภท" },
  { value: "booking", label: "จองทันที" },
  { value: "quote", label: "ขอใบเสนอราคา" },
];

function buildHref(status?: BookingStatus, type?: RequestType) {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (type) p.set("type", type);
  const qs = p.toString();
  return qs ? `/admin/bookings?${qs}` : "/admin/bookings";
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: BookingStatus; type?: RequestType }>;
}) {
  const { status, type } = await searchParams;
  const bookings = await listBookings(status, type);
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "bookings");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="การจอง" />}
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">การจอง</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {bookings.length} รายการ</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusTabs.map((t) => (
          <Link
            key={`s-${t.label}`}
            href={buildHref(t.value, type)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              status === t.value ? "bg-[var(--color-jade)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {typeTabs.map((t) => (
          <Link
            key={`t-${t.label}`}
            href={buildHref(status, t.value)}
            className={`rounded-full px-4 py-1.5 text-xs ${
              type === t.value ? "bg-[var(--color-gold)] text-[var(--color-jade-dark)]" : "border border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">ประเภท</th>
              <th className="px-5 py-3">ลูกค้า</th>
              <th className="px-5 py-3">ทัวร์</th>
              <th className="px-5 py-3">วันเดินทาง</th>
              <th className="px-5 py-3">คน</th>
              <th className="px-5 py-3">ยอดรวม</th>
              <th className="px-5 py-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-[var(--color-border)] align-top last:border-0">
                <td className="px-5 py-3 font-mono-data text-[var(--color-muted)]">#{b.id}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={b.request_type} />
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-[var(--color-jade-dark)]">{b.customer_name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{b.customer_email}</p>
                  <p className="text-xs text-[var(--color-muted)]">{b.customer_phone}</p>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{b.tour_title}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{formatDate(b.travel_date)}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{b.num_travelers}</td>
                <td className="px-5 py-3 font-mono-data">{formatMoney(b.total_price)}</td>
                <td className="px-5 py-3">
                  <BookingStatusSelect id={b.id} status={b.status} readOnly={!canEdit} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ไม่มีรายการในหมวดนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
