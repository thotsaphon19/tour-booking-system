import type { SiteSettings } from "@/lib/queries/settings";

export interface AboutContent {
  kicker: string;
  title: string;
  intro: string;
  value1Title: string;
  value1Desc: string;
  value2Title: string;
  value2Desc: string;
  value3Title: string;
  value3Desc: string;
}

type AboutTranslations = Partial<Record<string, Partial<AboutContent>>>;

function parseAboutTranslations(json: string): AboutTranslations {
  try {
    const parsed = JSON.parse(json || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Merges the About Us content stored in settings with the `locale`
 *  translation, falling back field-by-field to the Thai base text for
 *  anything left blank in that language — same pattern as localizeTour. */
export function localizeAbout(settings: SiteSettings, locale: string): AboutContent {
  const base: AboutContent = {
    kicker: settings.about_kicker,
    title: settings.about_title,
    intro: settings.about_intro,
    value1Title: settings.about_value1_title,
    value1Desc: settings.about_value1_desc,
    value2Title: settings.about_value2_title,
    value2Desc: settings.about_value2_desc,
    value3Title: settings.about_value3_title,
    value3Desc: settings.about_value3_desc,
  };
  if (locale === "th") return base;

  const translations = parseAboutTranslations(settings.about_translations_json);
  const override = translations[locale] || {};
  return {
    kicker: override.kicker || base.kicker,
    title: override.title || base.title,
    intro: override.intro || base.intro,
    value1Title: override.value1Title || base.value1Title,
    value1Desc: override.value1Desc || base.value1Desc,
    value2Title: override.value2Title || base.value2Title,
    value2Desc: override.value2Desc || base.value2Desc,
    value3Title: override.value3Title || base.value3Title,
    value3Desc: override.value3Desc || base.value3Desc,
  };
}
