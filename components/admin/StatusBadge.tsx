const styles: Record<string, string> = {
  pending: "bg-[var(--color-gold)]/15 text-[var(--color-gold)]",
  confirmed: "bg-[var(--color-jade)]/15 text-[var(--color-jade)]",
  cancelled: "bg-[var(--color-clay)]/15 text-[var(--color-clay)]",
  active: "bg-[var(--color-jade)]/15 text-[var(--color-jade)]",
  draft: "bg-[var(--color-muted)]/15 text-[var(--color-muted)]",
  booking: "bg-[var(--color-jade)]/15 text-[var(--color-jade)]",
  quote: "bg-[var(--color-clay)]/15 text-[var(--color-clay)]",
};

const labels: Record<string, string> = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิก",
  active: "เผยแพร่",
  draft: "แบบร่าง",
  booking: "จองทันที",
  quote: "ขอใบเสนอราคา",
};

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {label || labels[status] || status}
    </span>
  );
}
