import Link from "next/link";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { listAdmins, getCurrentAdmin } from "@/lib/auth";
import { isSuperAdmin, PERMISSION_SECTIONS } from "@/lib/permissions";
import { deleteAdminAction } from "@/lib/actions/admins";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function AdminUsersPage() {
  const current = await getCurrentAdmin();
  if (!isSuperAdmin(current)) {
    return <PermissionLocked sectionLabel="จัดการผู้ดูแลระบบ (Super Admin เท่านั้น)" />;
  }

  const admins = await listAdmins();
  const labelFor = (key: string) => PERMISSION_SECTIONS.find((s) => s.key === key)?.label || key;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">จัดการผู้ดูแลระบบ</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {admins.length} บัญชี</p>
        </div>
        <Link
          href="/admin/admins/new"
          className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
        >
          <Plus size={16} /> เพิ่มผู้ดูแลระบบ
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">ชื่อ</th>
              <th className="px-5 py-3">อีเมล</th>
              <th className="px-5 py-3">สิทธิ์</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-[var(--color-border)] align-top last:border-0">
                <td className="px-5 py-3 font-medium text-[var(--color-jade-dark)]">
                  {a.name}
                  {a.id === current!.id && <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">(คุณ)</span>}
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{a.email}</td>
                <td className="px-5 py-3">
                  {a.role === "super_admin" ? (
                    <span className="flex w-fit items-center gap-1 rounded-full bg-[var(--color-gold)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-gold)]">
                      <ShieldCheck size={12} /> Super Admin
                    </span>
                  ) : a.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {a.permissions.map((p) => (
                        <span key={p} className="rounded-full bg-[var(--color-jade)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-jade)]">
                          {labelFor(p)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">ดูได้อย่างเดียว (ยังไม่มีสิทธิ์แก้ไข)</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/admins/${a.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                    >
                      <Pencil size={14} />
                    </Link>
                    {a.id !== current!.id && (
                      <form
                        action={async () => {
                          "use server";
                          await deleteAdminAction(a.id);
                        }}
                      >
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
