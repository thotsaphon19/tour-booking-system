export default function DotScale({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 flex-shrink-0 text-[var(--color-ink-soft)]">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < value ? "bg-[var(--color-gold)]" : "bg-[var(--color-border)]"}`}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--color-muted)]">
        {value}/{max}
      </span>
    </div>
  );
}
