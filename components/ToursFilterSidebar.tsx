"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatFromTHB } from "@/lib/currency";
import DualRangeSlider from "@/components/DualRangeSlider";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface RangeBounds {
  min: number;
  max: number;
  histogram: number[];
}

export default function ToursFilterSidebar({
  categories,
  provinces,
  tags,
  duration,
  price,
  departureTourCount,
}: {
  categories: FilterOption[];
  provinces: FilterOption[];
  tags: FilterOption[];
  duration: RangeBounds;
  price: RangeBounds;
  departureTourCount: number;
}) {
  const t = useTranslations("tours");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currency, rates } = useCurrency();

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  // Filters default to collapsed on mobile so the tour results are visible
  // right away instead of the person having to scroll past a tall filter
  // panel first. Always expanded on lg+ screens regardless of this state.
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCategories = useMemo(() => parseList(searchParams.get("category")), [searchParams]);
  const selectedProvinces = useMemo(() => parseList(searchParams.get("province")), [searchParams]);
  const selectedTags = useMemo(() => parseList(searchParams.get("tag")), [searchParams]);
  const minDays = Number(searchParams.get("minDays")) || duration.min;
  const maxDays = Number(searchParams.get("maxDays")) || duration.max;
  const minPrice = Number(searchParams.get("minPrice")) || price.min;
  const maxPrice = Number(searchParams.get("maxPrice")) || price.max;
  const onlyDepartures = searchParams.get("onlyDepartures") === "1";

  function toggleOnlyDepartures() {
    updateParams((p) => {
      if (onlyDepartures) p.delete("onlyDepartures");
      else p.set("onlyDepartures", "1");
    });
  }

  function updateParams(mutator: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(searchParams.toString());
    mutator(p);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleListParam(key: string, value: string, current: string[]) {
    updateParams((p) => {
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (next.length > 0) p.set(key, next.join(","));
      else p.delete(key);
    });
  }

  function hasActiveFilters() {
    return (
      selectedCategories.length > 0 ||
      selectedProvinces.length > 0 ||
      selectedTags.length > 0 ||
      onlyDepartures ||
      minDays !== duration.min ||
      maxDays !== duration.max ||
      minPrice !== price.min ||
      maxPrice !== price.max
    );
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedProvinces.length +
    selectedTags.length +
    (onlyDepartures ? 1 : 0) +
    (minDays !== duration.min || maxDays !== duration.max ? 1 : 0) +
    (minPrice !== price.min || maxPrice !== price.max ? 1 : 0);

  const visibleCategories = categoriesOpen ? categories : categories.slice(0, 5);

  return (
    <aside className="w-full flex-shrink-0 lg:w-64">
      {/* Mobile-only toggle — the filter panel starts collapsed on small
          screens and expands on tap. Hidden on lg+ where the sidebar is
          always shown expanded. */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="flex w-full items-center justify-between rounded-2xl bg-[var(--color-surface)] px-4 py-3.5 lg:hidden"
      >
        <span className="flex items-center gap-2 font-display text-base font-semibold text-[var(--color-jade-dark)]">
          <SlidersHorizontal size={16} />
          {t("filtersTitle")}
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-jade)] px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </span>
        <ChevronDown size={18} className={`text-[var(--color-muted)] transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`${mobileOpen ? "mt-4 block" : "hidden"} space-y-6 lg:mt-0 lg:block`}>
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="font-display text-lg font-semibold text-[var(--color-jade-dark)]">{t("filtersTitle")}</h2>
          {hasActiveFilters() && (
            <button
              onClick={() => router.replace(pathname, { scroll: false })}
              className="text-xs font-medium text-[var(--color-clay)] underline"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-xs font-medium text-[var(--color-clay)] underline lg:hidden"
          >
            {t("clearFilters")}
          </button>
        )}

      {/* Themes / categories */}
      <div className="rounded-2xl bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink-soft)]">{t("themesLabel")}</h3>
        <div className="space-y-2">
          {visibleCategories.map((c) => (
            <label key={c.value} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-[var(--color-ink-soft)]">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.value)}
                  onChange={() => toggleListParam("category", c.value, selectedCategories)}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-jade)]"
                />
                {c.label}
              </span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-border)] px-1.5 text-[10px] font-semibold text-[var(--color-muted)]">
                {c.count}
              </span>
            </label>
          ))}
        </div>
        {categories.length > 5 && (
          <button
            onClick={() => setCategoriesOpen((v) => !v)}
            className="mt-3 text-xs font-semibold text-[var(--color-jade)] hover:underline"
          >
            {categoriesOpen ? t("less") : t("more")}
          </button>
        )}
      </div>

      {/* Provinces */}
      {provinces.length > 0 && (
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink-soft)]">{t("provincesLabel")}</h3>
          <div className="space-y-2">
            {provinces.map((p) => (
              <label key={p.value} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-[var(--color-ink-soft)]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProvinces.includes(p.value)}
                    onChange={() => toggleListParam("province", p.value, selectedProvinces)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-jade)]"
                  />
                  {p.label}
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-border)] px-1.5 text-[10px] font-semibold text-[var(--color-muted)]">
                  {p.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Suitable for / tags */}
      {tags.length > 0 && (
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink-soft)]">{t("suitableFor")}</h3>
          <div className="space-y-2">
            {tags.map((tag) => (
              <label key={tag.value} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-[var(--color-ink-soft)]">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.value)}
                    onChange={() => toggleListParam("tag", tag.value, selectedTags)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-jade)]"
                  />
                  {tag.label}
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-border)] px-1.5 text-[10px] font-semibold text-[var(--color-muted)]">
                  {tag.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Group tour — fixed departure dates */}
      {departureTourCount > 0 && (
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink-soft)]">{t("groupTourLabel")}</h3>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-[var(--color-ink-soft)]">{t("onlyDeparturesLabel")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={onlyDepartures}
              onClick={toggleOnlyDepartures}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                onlyDepartures ? "bg-[var(--color-jade)]" : "bg-[var(--color-border)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  onlyDepartures ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>
      )}

      {/* Duration */}
      {duration.max > duration.min && (
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink-soft)]">{t("durationLabel")}</h3>
          <DualRangeSlider
            min={duration.min}
            max={duration.max}
            value={[minDays, maxDays]}
            histogram={duration.histogram}
            formatLabel={(v) => `${v} ${t("daysUnit")}`}
            onChangeCommitted={([lo, hi]) =>
              updateParams((p) => {
                lo <= duration.min ? p.delete("minDays") : p.set("minDays", String(lo));
                hi >= duration.max ? p.delete("maxDays") : p.set("maxDays", String(hi));
              })
            }
          />
        </div>
      )}

      {/* Price */}
      {price.max > price.min && (
        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink-soft)]">{t("priceLabel")}</h3>
          <DualRangeSlider
            min={price.min}
            max={price.max}
            step={Math.max(Math.round((price.max - price.min) / 50), 1)}
            value={[minPrice, maxPrice]}
            histogram={price.histogram}
            formatLabel={(v) => formatFromTHB(v, currency, rates)}
            onChangeCommitted={([lo, hi]) =>
              updateParams((p) => {
                lo <= price.min ? p.delete("minPrice") : p.set("minPrice", String(lo));
                hi >= price.max ? p.delete("maxPrice") : p.set("maxPrice", String(hi));
              })
            }
          />
        </div>
      )}
      </div>
    </aside>
  );
}

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}
