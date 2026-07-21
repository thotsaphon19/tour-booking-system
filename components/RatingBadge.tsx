import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

export default function RatingBadge({
  score,
  count,
  source,
}: {
  score: number | null;
  count: number | null;
  source: string | null;
}) {
  const t = useTranslations("reviews");
  if (!score) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
      <div className="flex text-[var(--color-gold)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} fill={i < Math.round(score) ? "currentColor" : "none"} strokeWidth={1.5} />
        ))}
      </div>
      <span className="text-xs font-semibold text-[var(--color-ink)]">{score.toFixed(1)}</span>
      {count && (
        <span className="text-xs text-[var(--color-muted)]">
          ({count.toLocaleString()} {t("reviewsWord")}
          {source ? ` · ${source}` : ""})
        </span>
      )}
    </div>
  );
}
