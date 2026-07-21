// Shared building blocks for admin forms — boxed fields with bold labels
// and card-style sections with a real header/border, so a long form (like
// the Tours edit screen) is easy to scan: each field is visibly its own
// box, and each section has a clear title instead of small floating text
// that blends into everything around it.

export function AdminSection({
  title,
  icon: Icon,
  description,
  action,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-[var(--color-jade-dark)] sm:text-lg">
            {Icon && (
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-jade)]/10 text-[var(--color-jade)]">
                <Icon size={15} />
              </span>
            )}
            {title}
          </h2>
          {description && <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted)]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminField({
  label,
  icon: Icon,
  hint,
  error,
  full,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  hint?: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${full ? "sm:col-span-2" : ""} ${
        error ? "border-[var(--color-clay)] bg-[var(--color-clay)]/5" : "border-[var(--color-border)] bg-[var(--color-sand)]/60"
      }`}
    >
      <label className="block">
        <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
          {Icon ? <Icon size={13} className="flex-shrink-0" /> : <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--color-gold)]" />}
          {label}
        </span>
        {hint && <span className="mb-1.5 block text-[11px] leading-snug text-[var(--color-muted)]">{hint}</span>}
        {children}
      </label>
      {error && <span className="mt-1.5 block text-xs font-medium text-[var(--color-clay)]">{error}</span>}
    </div>
  );
}
