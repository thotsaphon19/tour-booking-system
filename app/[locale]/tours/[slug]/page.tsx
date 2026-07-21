import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, XCircle, Clock, Users, MapPin, ChevronRight, Pencil } from "lucide-react";
import { getTourBySlug, listTours } from "@/lib/queries/tours";
import { RouteLine } from "@/components/RouteLine";
import TourBookingPanel from "@/components/TourBookingPanel";
import TourCard from "@/components/TourCard";
import TourTabs from "@/components/TourTabs";
import RatingBadge from "@/components/RatingBadge";
import DotScale from "@/components/DotScale";
import PriceTierTable from "@/components/PriceTierTable";
import ItineraryDayCard from "@/components/ItineraryDayCard";
import HotelListGrid from "@/components/HotelListGrid";
import RouteMap from "@/components/RouteMap";
import YoutubeEmbed from "@/components/YoutubeEmbed";
import TourHeroGallery from "@/components/TourHeroGallery";
import { localizeTour, localizeTours } from "@/lib/i18n/localizeTour";

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rawTour = await getTourBySlug(slug);
  if (!rawTour || rawTour.status !== "active") notFound();

  const t = await getTranslations("tourDetail");
  const locale = await getLocale();
  const tour = localizeTour(rawTour, locale);

  // Matching stays on the canonical (Thai) category/province values, since
  // translated wording can vary tour to tour — the underlying taxonomy is
  // always the Thai value regardless of which locale is being displayed.
  const allActiveTours = await listTours({ status: "active" });
  const matchedRelated = allActiveTours.filter(
    (tr) => tr.id !== rawTour.id && (tr.category === rawTour.category || tr.province === rawTour.province)
  );
  // If there aren't enough same-category/province tours, fill the rest with
  // other active tours rather than showing fewer than 3 (or none at all) —
  // some recommendation is better than an empty section when scrolling down.
  const backfill = allActiveTours.filter(
    (tr) => tr.id !== rawTour.id && !matchedRelated.some((m) => m.id === tr.id)
  );
  const rawRelated = [...matchedRelated, ...backfill].slice(0, 3);
  const related = localizeTours(rawRelated, locale);

  const heroImages = Array.from(new Set([tour.cover_image_url, ...(tour.gallery || [])].filter((src): src is string => !!src)));
  const heroImageCount = heroImages.length;

  const overviewContent = (
    <div>
      <p className="text-base leading-relaxed text-[var(--color-ink-soft)]">{tour.description}</p>

      {tour.video_url && (
        <div className="mt-5">
          <YoutubeEmbed url={tour.video_url} title={t("watchVideo")} />
        </div>
      )}

      {tour.highlights.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tour.highlights.map((h) => (
            <span key={h} className="rounded-full bg-[var(--color-gold)]/10 px-3 py-1 text-xs font-medium text-[var(--color-gold)]">
              ✦ {h}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:flex-row sm:gap-8">
        <DotScale label={t("difficulty")} value={tour.difficulty_rating} />
        <DotScale label={t("comfort")} value={tour.comfort_rating} />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="font-semibold text-[var(--color-jade-dark)]">{t("included")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
            {tour.includes.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-jade)]" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-jade-dark)]">{t("notIncluded")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
            {tour.excludes.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <XCircle size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-clay)]" /> {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const itineraryContent = (
    <div>
      {tour.map_embed_url && (
        <div className="mb-8">
          <RouteMap embedUrl={tour.map_embed_url} title={tour.title} />
        </div>
      )}
      <RouteLine className="mb-6 h-4 w-40" />
      <ol className="space-y-6">
        {tour.itinerary.map((day) => (
          <ItineraryDayCard key={day.day} day={day} />
        ))}
      </ol>
    </div>
  );

  const hotelContent = (
    <div>
      {tour.hotel_description && <p className="mb-5 text-sm text-[var(--color-ink-soft)]">{tour.hotel_description}</p>}
      {tour.hotel_list.length > 0 ? (
        <HotelListGrid items={tour.hotel_list} />
      ) : (
        <p className="text-sm text-[var(--color-muted)]">{t("hotelEmpty")}</p>
      )}
    </div>
  );

  const priceContent = (
    <div>
      <PriceTierTable tiers={tour.price_tiers} currency={tour.currency} fallbackPrice={tour.price} note={t("priceNote")} />
      <div className="mt-8 rounded-2xl bg-[var(--color-jade)]/5 p-6">
        <h3 className="font-display text-lg font-semibold text-[var(--color-jade-dark)]">{t("personalizeBoxTitle")}</h3>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{t("personalizeBoxDesc")}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="relative h-[360px] w-full overflow-hidden bg-[var(--color-jade-dark)] md:h-[440px]">
        <TourHeroGallery
          images={heroImages}
          alt={tour.title}
          slideLabels={heroImageCount > 0 ? Array.from({ length: heroImageCount }, (_, i) => t("heroSlideLabel", { number: i + 1 })) : []}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-jade-dark)] via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-8 text-white">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-white/70">
            <Link href="/" className="hover:text-white">{t("home")}</Link>
            <ChevronRight size={12} />
            <Link href={`/tours?province=${encodeURIComponent(rawTour.province)}`} className="hover:text-white">
              {tour.province}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tour.tour_code && (
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">{tour.tour_code}</span>
            )}
            <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs">{tour.province}</span>
            <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs">{tour.duration_days} {t("daysWord")}</span>
            {tour.departure_dates.length > 0 && (
              <span className="rounded-md bg-[var(--color-gold)]/90 px-2 py-0.5 text-xs font-semibold text-[var(--color-jade-dark)]">
                {t("groupTourBadge")}
              </span>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{tour.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingBadge score={tour.rating_score} count={tour.rating_count} source={tour.rating_source} />
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Clock size={13} /> {tour.duration_days} {t("daysWord")}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Users size={13} /> {t("maxGroup")} {tour.max_group_size} {t("people")}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[1fr_360px]">
        <div>
          <TourTabs
            tabs={[
              { id: "overview", label: t("tabOverview"), content: overviewContent },
              { id: "itinerary", label: t("tabItinerary"), content: itineraryContent },
              { id: "hotel", label: t("tabHotel"), content: hotelContent },
              { id: "price", label: t("tabPrice"), content: priceContent },
            ]}
            action={
              <Link
                href={`/contact?mode=personalize&tour=${tour.slug}`}
                className="flex items-center gap-1.5 rounded-full bg-[var(--color-clay)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                <Pencil size={13} /> {t("personalizeButton")}
              </Link>
            }
          />
        </div>

        <aside className="md:sticky md:top-24 md:h-fit">
          <TourBookingPanel
            tourId={tour.id}
            price={tour.price}
            currency={tour.currency}
            priceTiers={tour.price_tiers}
            agentName={tour.agent_name}
            agentRole={tour.agent_role}
            agentPhotoUrl={tour.agent_photo_url}
            departureDates={tour.departure_dates}
          />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="bg-[var(--color-jade)]/[0.03] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("similarToursKicker")}</p>
            <h2 className="font-display text-2xl font-semibold text-[var(--color-jade-dark)]">{t("similarTours")}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((tr) => (
                <TourCard key={tr.id} tour={tr} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
