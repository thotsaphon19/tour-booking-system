import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listNews } from "@/lib/queries/news";
import { deleteNewsAction } from "@/lib/actions/news";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LockedAddButton, LockedIconButton } from "@/components/admin/LockedControls";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function AdminNewsPage() {
  const posts = await listNews();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "news");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="บทความ" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">บทความ</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {posts.length} บทความ</p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/news/new"
            className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
          >
            <Plus size={16} /> เขียนบทความใหม่
          </Link>
        ) : (
          <LockedAddButton label="เขียนบทความใหม่" />
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">หัวข้อ</th>
              <th className="px-5 py-3">วันที่สร้าง</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3 font-medium text-[var(--color-jade-dark)]">{p.title}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{formatDate(p.created_at)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.published ? "active" : "draft"} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {canEdit ? (
                      <>
                        <Link
                          href={`/admin/news/${p.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                        >
                          <Pencil size={14} />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteNewsAction(p.id, p.title);
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
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ยังไม่มีบทความ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
