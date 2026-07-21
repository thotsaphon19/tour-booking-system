import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";
import type { Review } from "@/lib/queries/reviews";

export default function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations("reviews");
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center gap-3">
        {review.customer_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.customer_photo_url} alt={review.customer_name} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-jade)]/10 font-display font-semibold text-[var(--color-jade)]">
            {review.customer_name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-[var(--color-jade-dark)]">{review.customer_name}</p>
          <p className="text-xs text-[var(--color-muted)]">{review.customer_country}</p>
        </div>
      </div>
      <Quote size={18} className="text-[var(--color-gold)]/50" />
      <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{review.quote}</p>
      <div className="mt-auto flex items-center justify-between pt-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-jade)]">{review.title}</p>
        <div className="flex text-[var(--color-gold)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
          ))}
        </div>
      </div>
      {review.travel_dates && <p className="text-xs text-[var(--color-muted)]">{t("travelDatesPrefix")} {review.travel_dates}</p>}
    </div>
  );
}
