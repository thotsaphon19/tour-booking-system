export function RouteLine({ className = "", withPins = true }: { className?: string; withPins?: boolean }) {
  return (
    <svg
      viewBox="0 0 400 24"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="4"
        y1="12"
        x2="396"
        y2="12"
        stroke="var(--color-gold)"
        strokeWidth="2"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      {withPins && (
        <>
          <circle cx="4" cy="12" r="5" fill="var(--color-jade)" />
          <circle cx="200" cy="12" r="4" fill="var(--color-gold)" />
          <circle cx="396" cy="12" r="5" fill="var(--color-clay)" />
        </>
      )}
    </svg>
  );
}
