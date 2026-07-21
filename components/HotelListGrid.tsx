import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import type { HotelListItem } from "@/lib/types";

export default function HotelListGrid({ items }: { items: HotelListItem[] }) {
  const t = useTranslations("tourDetail");
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((h, i) => (
        <div key={i} className="flex overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {h.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={h.image} alt={h.name} className="h-full w-32 flex-shrink-0 object-cover" />
          )}
          <div className="flex flex-1 flex-col justify-center p-4">
            <span className="w-fit rounded-full bg-[var(--color-ink)]/80 px-2.5 py-0.5 text-[10px] font-medium text-white">
              {t("dayLabel", { days: h.days })}
            </span>
            <p className="mt-2 text-xs text-[var(--color-muted)]">{h.city}</p>
            <p className="font-display font-semibold text-[var(--color-jade-dark)]">{h.name}</p>
            {h.stars > 0 && (
              <div className="mt-1 flex text-[var(--color-gold)]">
                {Array.from({ length: h.stars }).map((_, si) => (
                  <Star key={si} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
