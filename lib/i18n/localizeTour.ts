import type { Tour, TranslatableLocale } from "@/lib/types";
import { localizeProvinceName } from "@/lib/thaiProvinces";

function isTranslatableLocale(locale: string): locale is TranslatableLocale {
  return locale === "th" || locale === "en" || locale === "fr" || locale === "de" || locale === "ja" || locale === "es";
}

/**
 * Returns a copy of `tour` with every translatable field replaced by its
 * `locale` translation, when one has been entered by an admin. The tour's
 * base fields (title, description, etc.) are whatever language the admin
 * originally typed them in — usually Thai, but not guaranteed. Any locale,
 * including Thai, can have its own override entered in the translations
 * panel; any field left blank in a translation falls back to the base value
 * automatically — the page never renders an empty string just because a
 * translation is partial.
 */
export function localizeTour(tour: Tour, locale: string): Tour {
  if (!isTranslatableLocale(locale)) return tour;
  const tr = tour.translations?.[locale];

  // Province names are a known, finite list (Thailand's 77 provinces), so
  // they can always be localized canonically — no per-tour translation
  // entry required. A manual override in the translations panel still wins
  // if an admin has entered one.
  const province = tr?.province?.trim() ? tr.province : localizeProvinceName(tour.province, locale);

  if (!tr) return { ...tour, province };

  const itinerary = tour.itinerary.map((day) => {
    const dayTr = tr.itinerary?.find((d) => d.day === day.day);
    if (!dayTr) return day;
    return {
      ...day,
      title: dayTr.title?.trim() ? dayTr.title : day.title,
      description: dayTr.description?.trim() ? dayTr.description : day.description,
      accommodation: dayTr.accommodation?.trim() ? dayTr.accommodation : day.accommodation,
    };
  });

  // Hotel list items don't have a stable unique key like itinerary days do,
  // so translations are matched by position — the translations panel and
  // the base "ที่พัก" list are always edited in the same order.
  const hotel_list = tour.hotel_list.map((item, i) => {
    const itemTr = tr.hotel_list?.[i];
    if (!itemTr) return item;
    return {
      ...item,
      city: itemTr.city?.trim() ? itemTr.city : item.city,
      name: itemTr.name?.trim() ? itemTr.name : item.name,
    };
  });

  return {
    ...tour,
    title: tr.title?.trim() ? tr.title : tour.title,
    category: tr.category?.trim() ? tr.category : tour.category,
    province,
    difficulty: tr.difficulty?.trim() ? tr.difficulty : tour.difficulty,
    summary: tr.summary?.trim() ? tr.summary : tour.summary,
    description: tr.description?.trim() ? tr.description : tour.description,
    highlights: tr.highlights?.length ? tr.highlights : tour.highlights,
    includes: tr.includes?.length ? tr.includes : tour.includes,
    excludes: tr.excludes?.length ? tr.excludes : tour.excludes,
    hotel_name: tr.hotel_name?.trim() ? tr.hotel_name : tour.hotel_name,
    hotel_description: tr.hotel_description?.trim() ? tr.hotel_description : tour.hotel_description,
    agent_name: tr.agent_name?.trim() ? tr.agent_name : tour.agent_name,
    agent_role: tr.agent_role?.trim() ? tr.agent_role : tour.agent_role,
    itinerary,
    hotel_list,
  };
}

export function localizeTours(tours: Tour[], locale: string): Tour[] {
  return tours.map((t) => localizeTour(t, locale));
}

/**
 * Builds a lookup from each canonical (Thai) category/province value to its
 * localized display label, using whichever tour has a translation for that
 * value. Falls back to the Thai value itself when nothing has been
 * translated yet — filter chips are never blank.
 */
export function buildLabelMaps(tours: Tour[], locale: string): { categoryLabel: Record<string, string>; provinceLabel: Record<string, string> } {
  const categoryLabel: Record<string, string> = {};
  const provinceLabel: Record<string, string> = {};
  for (const tour of tours) {
    const localized = localizeTour(tour, locale);
    if (!(tour.category in categoryLabel)) categoryLabel[tour.category] = localized.category;
    if (!(tour.province in provinceLabel)) provinceLabel[tour.province] = localized.province;
  }
  return { categoryLabel, provinceLabel };
}
