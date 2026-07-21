import { Lock } from "lucide-react";

export default function ReadOnlyBanner({ sectionLabel }: { sectionLabel: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-[var(--color-border)]/40 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
      <Lock size={15} className="flex-shrink-0 text-[var(--color-muted)]" />
      <span>
        คุณดูข้อมูล &quot;{sectionLabel}&quot; ได้ แต่ยังไม่มีสิทธิ์เพิ่ม/แก้ไข/ลบ — ติดต่อ Super Admin เพื่อขอสิทธิ์
      </span>
    </div>
  );
}
