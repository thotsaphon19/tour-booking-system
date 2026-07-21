import type { Metadata } from "next";
import { locales, localeLabels, localeImages, type Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/queries/settings";
import { buildThemeCss } from "@/lib/theme";
import LanguageLandingMotion from "@/components/LanguageLandingMotion";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `${settings.site_name} / ${settings.company_name}` };
}

// A small bilingual tagline per locale card — this page renders before any
// locale is resolved, so it can't use the translation dictionaries. This is
// the fallback used for any locale the admin hasn't customized in
// /admin/language-page (see settings.language_page_json).
const defaultTaglines: Partial<Record<Locale, string>> = {
  th: "ทัวร์ในประเทศไทย โดยไกด์ท้องถิ่น",
  en: "Thailand tours, guided by locals",
  fr: "Circuits en Thaïlande, guidés par des locaux",
  de: "Thailand-Reisen mit einheimischen Guides",
  ja: "地元ガイドが案内するタイ国内の旅",
  es: "Tours por Tailandia, guiados por locales",
};

interface LanguagePageOverride {
  image?: string;
  tagline?: string;
}

function parseLanguagePageJson(json: string): Partial<Record<Locale, LanguagePageOverride>> {
  try {
    const parsed = JSON.parse(json || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export default async function LanguageLandingPage() {
  const settings = await getSettings();
  const overrides = parseLanguagePageJson(settings.language_page_json);

  const images = Object.fromEntries(
    locales.map((l) => [l, overrides[l]?.image || localeImages[l]])
  ) as Record<Locale, string>;
  const taglines = Object.fromEntries(
    locales.map((l) => [l, overrides[l]?.tagline || defaultTaglines[l] || ""])
  ) as Record<Locale, string>;

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: buildThemeCss(settings) }} />
      <LanguageLandingMotion
        locales={locales}
        localeLabels={localeLabels}
        localeImages={images}
        taglines={taglines}
        siteName={settings.site_name}
        companyName={settings.company_name}
        logoUrl={settings.logo_url}
        year={new Date().getFullYear()}
      />
    </>
  );
}
