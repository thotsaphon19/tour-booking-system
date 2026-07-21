"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { Menu, Mountain, ChevronDown, Mail, Pencil } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { localizeProvinceName } from "@/lib/thaiProvinces";

export default function SiteHeader({
  provinces,
  contactEmail,
  yearsExperience,
  siteName,
  logoUrl,
}: {
  provinces: string[];
  contactEmail: string;
  yearsExperience: string;
  siteName: string;
  logoUrl?: string;
}) {
  const t = useTranslations("nav");
  const tHome = useTranslations("home");
  const locale = useLocale();
  const [destOpen, setDestOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-sand)]/95 backdrop-blur">
      {/* Top utility bar */}
      <div className="hidden bg-[var(--color-jade-dark)] text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 text-xs">
          <p className="italic text-[var(--color-gold-light)]">{tHome("heroKicker")}</p>
          <div className="flex items-center gap-5">
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-1.5 text-white/80 hover:text-white">
              <Mail size={12} /> {contactEmail}
            </a>
            <Link href="/news" className="text-white/80 hover:text-white">
              {t("articles")}
            </Link>
            <LanguageSwitcher className="text-white/90" />
            <CurrencySwitcher className="text-white/90" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <NextLink href="/" className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-jade)] text-[var(--color-gold-light)]">
              <Mountain size={18} strokeWidth={2.2} />
            </span>
          )}
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--color-jade-dark)]">
            {siteName}
          </span>
        </NextLink>

        <nav className="hidden items-center gap-7 md:flex">
          <div className="relative" onMouseEnter={() => setDestOpen(true)} onMouseLeave={() => setDestOpen(false)}>
            <button className="flex items-center gap-1 text-sm font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-jade)]">
              {t("destinations")} <ChevronDown size={14} />
            </button>
            {destOpen && (
              <div className="absolute left-0 top-full w-44 rounded-xl border border-[var(--color-border)] bg-white py-2 shadow-lg">
                {provinces.map((c) => (
                  <Link
                    key={c}
                    href={`/tours?province=${encodeURIComponent(c)}`}
                    className="block px-4 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-jade)]/5 hover:text-[var(--color-jade)]"
                  >
                    {localizeProvinceName(c, locale)}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/tours" className="text-sm font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-jade)]">
            {t("allTours")}
          </Link>
          <Link href="/about" className="text-sm font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-jade)]">
            {t("about")}
          </Link>
          <Link href="/reviews" className="text-sm font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-jade)]">
            {t("reviews")}
          </Link>
          <Link href="/contact" className="text-sm font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-jade)]">
            {t("contact")}
          </Link>
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact?mode=personalize"
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-clay)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Pencil size={14} /> {t("personalizeCta")}
          </Link>
        </div>

        <details className="md:hidden">
          <summary className="list-none rounded-full border border-[var(--color-border)] p-2">
            <Menu size={20} />
          </summary>
          <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-[var(--color-border)] bg-[var(--color-sand)] px-5 py-4">
            <Link href="/tours" className="py-2 text-sm font-medium text-[var(--color-ink-soft)]">
              {t("allTours")}
            </Link>
            <Link href="/about" className="py-2 text-sm font-medium text-[var(--color-ink-soft)]">
              {t("about")}
            </Link>
            <Link href="/reviews" className="py-2 text-sm font-medium text-[var(--color-ink-soft)]">
              {t("reviews")}
            </Link>
            <Link href="/contact" className="py-2 text-sm font-medium text-[var(--color-ink-soft)]">
              {t("contact")}
            </Link>
            <Link href="/contact?mode=personalize" className="py-2 text-sm font-semibold text-[var(--color-clay)]">
              {t("personalizeCta")}
            </Link>
            <LanguageSwitcher className="py-2 text-[var(--color-ink-soft)]" />
            <CurrencySwitcher className="py-2 text-[var(--color-ink-soft)]" />
          </div>
        </details>
      </div>
    </header>
  );
}
