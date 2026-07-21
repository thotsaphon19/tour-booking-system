"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, FileDown } from "lucide-react";
import type { Tour } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import TourStatusToggle from "@/components/admin/TourStatusToggle";
import { LockedIconButton } from "@/components/admin/LockedControls";

export default function ToursTable({
  tours,
  canEdit,
  deleteAction,
}: {
  tours: Tour[];
  canEdit: boolean;
  deleteAction: (id: number, label: string) => Promise<unknown>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tours;
    return tours.filter((t) =>
      [t.title, t.tour_code, t.province, t.category].some((field) => (field || "").toLowerCase().includes(q))
    );
  }, [tours, query]);

  return (
    <div>
      <div className="relative w-full max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อทัวร์, รหัสทัวร์, จังหวัด, หมวดหมู่..."
          className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--color-jade)]"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">ลำดับ</th>
              <th className="px-5 py-3">รหัสทัวร์</th>
              <th className="px-5 py-3">ทัวร์</th>
              <th className="px-5 py-3">จังหวัด</th>
              <th className="px-5 py-3">ราคา</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3 text-[var(--color-muted)]">{i + 1}</td>
                <td className="px-5 py-3 font-mono-data text-[var(--color-ink-soft)]">{t.tour_code || "—"}</td>
                <td className="px-5 py-3 font-medium text-[var(--color-jade-dark)]">{t.title}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{t.province}</td>
                <td className="px-5 py-3 font-mono-data">{formatMoney(t.price, t.currency)}</td>
                <td className="px-5 py-3">
                  <TourStatusToggle id={t.id} status={t.status} readOnly={!canEdit} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <a
                      href={`/api/admin/tours/${t.id}/pdf`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10"
                    >
                      <FileDown size={14} />
                    </a>
                    {canEdit ? (
                      <>
                        <Link
                          href={`/admin/tours/${t.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                        >
                          <Pencil size={14} />
                        </Link>
                        <form
                          action={async () => {
                            await deleteAction(t.id, t.title);
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  {tours.length === 0 ? 'ยังไม่มีทัวร์ กด "เพิ่มทัวร์ใหม่" เพื่อเริ่มต้น' : "ไม่พบทัวร์ที่ตรงกับคำค้นหา"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
