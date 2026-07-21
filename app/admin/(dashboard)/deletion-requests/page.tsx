import { Check, X, ShieldAlert } from "lucide-react";
import { listAllDeletionRequests } from "@/lib/queries/deletionRequests";
import { getCurrentAdmin } from "@/lib/auth";
import { isSuperAdmin, PERMISSION_SECTIONS } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";
import { approveDeletionRequestAction, rejectDeletionRequestAction } from "@/lib/actions/deletionRequests";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = { pending: "รอดำเนินการ", approved: "อนุมัติแล้ว", rejected: "ปฏิเสธแล้ว" };
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-[var(--color-gold)]/15 text-[var(--color-gold)]",
  approved: "bg-[var(--color-jade)]/10 text-[var(--color-jade)]",
  rejected: "bg-[var(--color-clay)]/10 text-[var(--color-clay)]",
};

export default async function DeletionRequestsPage() {
  const current = await getCurrentAdmin();
  if (!isSuperAdmin(current)) {
    return <PermissionLocked sectionLabel="คำขอลบข้อมูล (Super Admin เท่านั้น)" />;
  }

  const requests = await listAllDeletionRequests();
  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");
  const sectionLabel = (key: string) => PERMISSION_SECTIONS.find((s) => s.key === key)?.label || key;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">คำขอลบข้อมูล</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        เมื่อแอดมิน (ที่ไม่ใช่ Super Admin) กดลบข้อมูล จะมาแสดงที่นี่แทนการลบทันที ต้องอนุมัติก่อนถึงจะลบจริง
      </p>

      {pending.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-gold)]">
            <ShieldAlert size={16} /> มี {pending.length} คำขอรอการอนุมัติ
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">รายการที่ขอลบ</th>
              <th className="px-5 py-3">หมวด</th>
              <th className="px-5 py-3">ขอลบโดย</th>
              <th className="px-5 py-3">เมื่อ</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {[...pending, ...resolved].map((r) => (
              <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-5 py-3 font-medium text-[var(--color-jade-dark)]">{r.entity_label}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{sectionLabel(r.entity_type)}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{r.requested_by_name}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{formatDate(r.created_at)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                </td>
                <td className="px-5 py-3">
                  {r.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await approveDeletionRequestAction(r.id);
                        }}
                      >
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-jade)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10">
                          <Check size={14} />
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await rejectDeletionRequestAction(r.id);
                        }}
                      >
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-clay)] text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                          <X size={14} />
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ยังไม่มีคำขอลบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
