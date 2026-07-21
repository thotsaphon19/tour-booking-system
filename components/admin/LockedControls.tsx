import { Lock } from "lucide-react";

/** Replaces an actionable button/link with a disabled, grayed-out
 *  look-alike plus a small lock icon, so the layout stays the same but
 *  nothing is clickable. Used in place of "add new", edit, and delete
 *  controls when the current admin doesn't have permission. */
export function LockedIconButton() {
  return (
    <span
      title="ไม่มีสิทธิ์แก้ไข"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-border)]/30 text-[var(--color-muted)]"
    >
      <Lock size={13} />
    </span>
  );
}

export function LockedAddButton({ label }: { label: string }) {
  return (
    <span
      title="ไม่มีสิทธิ์เพิ่มรายการ"
      className="flex cursor-not-allowed items-center gap-2 rounded-full bg-[var(--color-border)]/50 px-5 py-2.5 text-sm font-semibold text-[var(--color-muted)]"
    >
      <Lock size={15} /> {label}
    </span>
  );
}
