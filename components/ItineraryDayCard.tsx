import { useTranslations } from "next-intl";
import { Coffee, UtensilsCrossed, Wine, Home } from "lucide-react";
import type { ItineraryDay } from "@/lib/types";
import RouteTimeline from "@/components/RouteTimeline";

export default function ItineraryDayCard({ day }: { day: ItineraryDay }) {
  const t = useTranslations("tourDetail");
  const route = Array.isArray(day.route) ? day.route : [];
  const photos = Array.isArray(day.photos) ? day.photos : [];
  const hasMeals = day.breakfast || day.lunch || day.dinner;
  const hasRoute = route.length > 0;
  const thumbnail = photos[0];

  return (
    <li className="flex gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-jade)] font-mono-data text-sm font-semibold text-white">
        {day.day}
      </div>
      <div className="flex-1 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-gold)]">{t("dayLabel", { days: day.day })}</p>
        <h3 className="font-semibold text-[var(--color-jade-dark)]">{day.title}</h3>

        <div className="mt-3 grid gap-4 sm:grid-cols-[180px_1fr]">
          {(thumbnail || hasRoute) && (
            <div className="space-y-3">
              {thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt={day.title} className="h-32 w-full rounded-xl object-cover sm:h-28" />
              )}
              {hasRoute && <RouteTimeline legs={route} />}
            </div>
          )}

          <div>
            <p className="text-sm text-[var(--color-muted)]">{day.description}</p>

            {(hasMeals || day.accommodation) && (
              <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl bg-[var(--color-sand)] px-4 py-2.5 text-xs text-[var(--color-ink-soft)]">
                {day.breakfast && (
                  <span className="flex items-center gap-1.5">
                    <Coffee size={14} className="text-[var(--color-jade)]" /> {t("mealBreakfast")}
                  </span>
                )}
                {day.lunch && (
                  <span className="flex items-center gap-1.5">
                    <UtensilsCrossed size={14} className="text-[var(--color-jade)]" /> {t("mealLunch")}
                  </span>
                )}
                {day.dinner && (
                  <span className="flex items-center gap-1.5">
                    <Wine size={14} className="text-[var(--color-jade)]" /> {t("mealDinner")}
                  </span>
                )}
                {day.accommodation && (
                  <span className="flex items-center gap-1.5">
                    <Home size={14} className="text-[var(--color-jade)]" /> {day.accommodation}
                  </span>
                )}
              </div>
            )}

            {photos.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {photos.slice(1, 4).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={day.title} className="h-20 w-full rounded-lg object-cover sm:h-24" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
