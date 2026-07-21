import Link from "next/link";
import { Wallet, CalendarClock, Users, MapPinned, Clock, MessageSquareText } from "lucide-react";
import { getDashboardStats, listBookings } from "@/lib/queries/bookings";
import { formatMoney, formatDate } from "@/lib/format";
import SalesChart from "@/components/admin/SalesChart";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const recent = (await listBookings()).slice(0, 6);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แดชบอร์ด</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">ภาพรวมยอดขายและการจองล่าสุด</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Wallet size={18} />} label="รายได้ (ยืนยันแล้ว)" value={formatMoney(stats.totalRevenue)} />
        <StatCard icon={<CalendarClock size={18} />} label="การจองทั้งหมด" value={String(stats.totalBookings)} />
        <StatCard icon={<Clock size={18} />} label="รอยืนยัน" value={String(stats.pendingBookings)} accent />
        <StatCard icon={<MessageSquareText size={18} />} label="ขอใบเสนอราคา" value={String(stats.quoteRequests)} accent />
        <StatCard icon={<Users size={18} />} label="ลูกค้าทั้งหมด" value={String(stats.totalCustomers)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold text-[var(--color-jade-dark)]">รายได้รายเดือน</h2>
          {stats.monthly.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[var(--color-muted)]">ยังไม่มีข้อมูลการจอง</p>
          ) : (
            <div className="mt-4">
              <SalesChart data={stats.monthly} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold text-[var(--color-jade-dark)]">การจองตามหมวดหมู่</h2>
          <ul className="mt-4 space-y-3">
            {(stats.byCategory as any[]).map((c) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <MapPinned size={14} className="text-[var(--color-jade)]" /> {c.category}
                </span>
                <span className="font-mono-data font-semibold text-[var(--color-jade-dark)]">{c.bookings}</span>
              </li>
            ))}
            {stats.byCategory.length === 0 && <p className="text-sm text-[var(--color-muted)]">ยังไม่มีข้อมูล</p>}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-jade-dark)]">การจองล่าสุด</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-[var(--color-jade)] hover:underline">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="py-2 pr-4">ประเภท</th>
                <th className="py-2 pr-4">ลูกค้า</th>
                <th className="py-2 pr-4">ทัวร์</th>
                <th className="py-2 pr-4">วันเดินทาง</th>
                <th className="py-2 pr-4">ยอดรวม</th>
                <th className="py-2 pr-4">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3 pr-4"><StatusBadge status={b.request_type} /></td>
                  <td className="py-3 pr-4">{b.customer_name}</td>
                  <td className="py-3 pr-4">{b.tour_title}</td>
                  <td className="py-3 pr-4">{formatDate(b.travel_date)}</td>
                  <td className="py-3 pr-4 font-mono-data">{formatMoney(b.total_price)}</td>
                  <td className="py-3 pr-4"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-muted)]">
                    ยังไม่มีการจองเข้ามา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${accent ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)]" : "bg-[var(--color-jade)]/10 text-[var(--color-jade)]"}`}>
        {icon}
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">{label}</p>
      <p className="font-mono-data text-xl font-semibold text-[var(--color-jade-dark)]">{value}</p>
    </div>
  );
}
