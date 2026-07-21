import { getTranslations, getLocale } from "next-intl/server";
import { getSettings } from "@/lib/queries/settings";
import { listTours } from "@/lib/queries/tours";
import { TOUR_TAGS } from "@/lib/types";
import type { Tour } from "@/lib/types";
import ToursGrid from "@/components/ToursGrid";
import ToursFilterSidebar, { type FilterOption, type RangeBounds } from "@/components/ToursFilterSidebar";
import { localizeTours, buildLabelMaps } from "@/lib/i18n/localizeTour";

export async function generateMetadata() {
  const t = await getTranslations("tours");
  const settings = await getSettings();
  return { title: `${t("title")} | ${settings.company_name}` };
}

function parseList(value?: string): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function buildHistogram(values: number[], min: number, max: number, buckets = 12): number[] {
  const counts = new Array(buckets).fill(0);
  const range = Math.max(max - min, 1);
  for (const v of values) {
    const idx = Math.min(Math.floor(((v - min) / range) * buckets), buckets - 1);
    counts[Math.max(idx, 0)]++;
  }
  return counts;
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    province?: string;
    tag?: string;
    minDays?: string;
    maxDays?: string;
    minPrice?: string;
    maxPrice?: string;
    onlyDepartures?: string;
  }>;
}) {
  const t = await getTranslations("tours");
  const tTags = await getTranslations("tags");
  const locale = await getLocale();
  const params = await searchParams;

  const allActiveTours = await listTours({ status: "active" });
  const { categoryLabel, provinceLabel } = buildLabelMaps(allActiveTours, locale);

  // Bounds and histograms always reflect the *full* active catalog, so the
  // sliders/checkbox counts stay stable reference points rather than
  // shrinking every time a filter is applied.
  const allDurations = allActiveTours.map((tr) => tr.duration_days);
  const allPrices = allActiveTours.map((tr) => tr.price);
  const durationBounds: RangeBounds = {
    min: Math.min(...allDurations, 1),
    max: Math.max(...allDurations, 1),
    histogram: buildHistogram(allDurations, Math.min(...allDurations, 1), Math.max(...allDurations, 1)),
  };
  const priceBounds: RangeBounds = {
    min: Math.min(...allPrices, 0),
    max: Math.max(...allPrices, 0),
    histogram: buildHistogram(allPrices, Math.min(...allPrices, 0), Math.max(...allPrices, 0)),
  };

  const selectedCategories = parseList(params.category);
  const selectedProvinces = parseList(params.province);
  const selectedTags = parseList(params.tag);
  const minDays = params.minDays ? Number(params.minDays) : durationBounds.min;
  const maxDays = params.maxDays ? Number(params.maxDays) : durationBounds.max;
  const minPrice = params.minPrice ? Number(params.minPrice) : priceBounds.min;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : priceBounds.max;
  const onlyDepartures = params.onlyDepartures === "1";
  const today = new Date().toISOString().slice(0, 10);

  function hasUpcomingDeparture(tour: Tour): boolean {
    return tour.departure_dates.some((d) => d >= today);
  }

  function matches(tour: Tour): boolean {
    if (selectedCategories.length > 0 && !selectedCategories.includes(tour.category)) return false;
    if (selectedProvinces.length > 0 && !selectedProvinces.includes(tour.province)) return false;
    if (selectedTags.length > 0 && !selectedTags.some((tag) => tour.tags.includes(tag))) return false;
    if (tour.duration_days < minDays || tour.duration_days > maxDays) return false;
    if (tour.price < minPrice || tour.price > maxPrice) return false;
    if (onlyDepartures && !hasUpcomingDeparture(tour)) return false;
    return true;
  }

  const filteredTours = allActiveTours.filter(matches);
  const tours = localizeTours(filteredTours, locale);

  // Counts for checkboxes are computed from the full catalog (not
  // re-narrowed by sibling filters) — simple and predictable rather than a
  // fully "faceted" count that shifts as other filters change.
  function countBy(getKey: (tour: Tour) => string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const tour of allActiveTours) {
      for (const key of getKey(tour)) counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
  const categoryCounts = countBy((tr) => [tr.category]);
  const provinceCounts = countBy((tr) => [tr.province]);
  const tagCounts = countBy((tr) => tr.tags);

  const categoryOptions: FilterOption[] = Object.keys(categoryCounts)
    .sort((a, b) => categoryCounts[b] - categoryCounts[a])
    .map((value) => ({ value, label: categoryLabel[value] || value, count: categoryCounts[value] }));
  const provinceOptions: FilterOption[] = Object.keys(provinceCounts)
    .sort((a, b) => provinceCounts[b] - provinceCounts[a])
    .map((value) => ({ value, label: provinceLabel[value] || value, count: provinceCounts[value] }));
  const tagOptions: FilterOption[] = TOUR_TAGS.filter((tag) => tagCounts[tag] > 0).map((tag) => ({
    value: tag,
    label: tTags(tag),
    count: tagCounts[tag] || 0,
  }));

  const departureTourCount = allActiveTours.filter(hasUpcomingDeparture).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("kicker")}</p>
      <h1 className="font-display text-4xl font-semibold text-[var(--color-jade-dark)]">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-[var(--color-muted)]">{t("desc")}</p>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <ToursFilterSidebar
          categories={categoryOptions}
          provinces={provinceOptions}
          tags={tagOptions}
          duration={durationBounds}
          price={priceBounds}
          departureTourCount={departureTourCount}
        />

        <div className="min-w-0 flex-1">
          <p className="mb-6 text-sm text-[var(--color-muted)]">{t("showResults", { count: tours.length })}</p>
          {tours.length === 0 ? (
            <p className="mt-16 text-center text-[var(--color-muted)]">{t("noResults")}</p>
          ) : (
            <ToursGrid tours={tours} />
          )}
        </div>
      </div>
    </div>
  );
}
