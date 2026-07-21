import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Clock, MapPin, Users } from "lucide-react";
import type { Tour } from "@/lib/types";
import Price from "@/components/Price";

export default function TourCard({ tour }: { tour: Tour }) {
  const t = useTranslations("tourCard");

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl hover:shadow-black/10"
    >
      <div className="relative h-52 w-full overflow-hidden bg-[var(--color-border)]">
        {tour.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tour.cover_image_url}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-jade-dark)]/85 px-3 py-1 text-xs font-medium text-white backdrop-blur transition-transform duration-300 group-hover:scale-105">
          {tour.category}
        </span>
        {tour.tour_code && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-jade-dark)]">
            {tour.tour_code}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-gold)]">
          <MapPin size={13} /> {tour.province}
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-[var(--color-jade-dark)] transition-colors duration-300 group-hover:text-[var(--color-jade)]">
          {tour.title}
        </h3>
        <p className="line-clamp-2 text-sm text-[var(--color-muted)]">{tour.summary}</p>
        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <div className="flex gap-3 text-xs text-[var(--color-muted)]">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {tour.duration_days} {t("days")}
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} /> {t("maxGroup")} {tour.max_group_size}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--color-muted)]">{t("startingFrom")}</p>
            <p className="font-mono-data text-base font-semibold text-[var(--color-jade)]">
              <Price amountTHB={tour.price} />
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
