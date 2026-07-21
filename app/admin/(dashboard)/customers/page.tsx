import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listCustomers } from "@/lib/queries/bookings";
import { formatMoney, formatDate } from "@/lib/format";
import { deleteCustomerAction } from "@/lib/actions/customers";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LockedAddButton, LockedIconButton } from "@/components/admin/LockedControls";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function AdminCustomersPage() {
  const customers = await listCustomers();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "customers");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="ลูกค้า" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">ลูกค้า</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {customers.length} คน</p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/customers/new"
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-jade)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
          >
            <Plus size={15} /> เพิ่มลูกค้า
          </Link>
        ) : (
          <LockedAddButton label="เพิ่มลูกค้า" />
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">ชื่อ</th>
              <th className="px-5 py-3">อีเมล</th>
              <th className="px-5 py-3">เบอร์โทร</th>
              <th className="px-5 py-3">จำนวนการจอง</th>
              <th className="px-5 py-3">ยอดใช้จ่ายรวม</th>
              <th className="px-5 py-3">สมัครเมื่อ</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3 font-medium text-[var(--color-jade-dark)]">{c.name}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{c.email}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{c.phone || "-"}</td>
                <td className="px-5 py-3 font-mono-data">{c.total_bookings}</td>
                <td className="px-5 py-3 font-mono-data">{formatMoney(c.total_spent)}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{formatDate(c.created_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {canEdit ? (
                      <>
                        <Link
                          href={`/admin/customers/${c.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                        >
                          <Pencil size={14} />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteCustomerAction(c.id, c.name);
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
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ยังไม่มีข้อมูลลูกค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
