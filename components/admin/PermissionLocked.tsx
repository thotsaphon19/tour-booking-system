import { Lock } from "lucide-react";

export default function PermissionLocked({ sectionLabel }: { sectionLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-border)]/20 px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-border)]">
        <Lock size={22} className="text-[var(--color-muted)]" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-[var(--color-ink-soft)]">ไม่มีสิทธิ์เข้าถึงส่วนนี้</h2>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
        บัญชีของคุณยังไม่ได้รับสิทธิ์แก้ไข &quot;{sectionLabel}&quot; กรุณาติดต่อ Super Admin เพื่อขอสิทธิ์เข้าถึงส่วนนี้
      </p>
    </div>
  );
}
