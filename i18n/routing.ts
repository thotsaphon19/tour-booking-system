import { defineRouting } from "next-intl/routing";

// -----------------------------------------------------------------------------
// i18n routing configuration
// -----------------------------------------------------------------------------
// This is the single place that defines which languages the public site
// supports. To add a new language later:
//   1. Add its code to `locales` below and give it a label in `localeLabels`.
//   2. Create a matching messages/<code>.json file (copy messages/en.json
//      and translate the values — keys must stay identical).
//   3. That's it — the language switcher, routing, and middleware all pick
//      up new locales automatically from this file.
// -----------------------------------------------------------------------------

export const locales = ["th", "en", "fr", "de", "ja", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const localeLabels: Record<Locale, string> = {
  th: "ไทย",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  es: "Español",
};

// Representative photo shown on the language-picker landing page for each
// locale. Add an entry here when adding a new language.
export const localeImages: Record<Locale, string> = {
  th: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=70",
  en: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=70",
  fr: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=70",
  de: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=70",
  ja: "https://images.unsplash.com/photo-1548544149-4835e62ee5b3?w=400&q=70",
  es: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=400&q=70",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // "always" gives every locale an explicit URL prefix (/th, /en, ...) so the
  // bare root "/" is free to be used as a language-picker landing page
  // (see app/page.tsx) instead of being auto-claimed by the default locale.
  localePrefix: "always",
});
