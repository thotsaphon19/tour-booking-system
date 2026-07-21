import { cache } from "react";
import { query } from "@/lib/db";

export interface SiteSettings {
  site_name: string;
  company_name: string;
  logo_url: string;
  color_bg: string;
  color_surface: string;
  color_primary: string;
  color_primary_dark: string;
  color_accent: string;
  color_ink: string;
  hero_images: string;
  /** Payment method logo images (PayPal, Wise, credit cards, Amazing
   *  Thailand, etc.) shown in the footer — one image URL per line, same
   *  storage pattern as hero_images. Admin uploads their own logo files via
   *  the settings page so we never hotlink third-party brand assets. */
  payment_logos: string;
  consultant_name: string;
  consultant_role: string;
  consultant_photo_url: string;
  consultant_greeting: string;
  consultant_role_th?: string;
  consultant_role_en?: string;
  consultant_role_fr?: string;
  consultant_role_de?: string;
  consultant_role_ja?: string;
  consultant_greeting_th?: string;
  consultant_greeting_en?: string;
  consultant_greeting_fr?: string;
  consultant_greeting_de?: string;
  consultant_greeting_ja?: string;
  rate_usd: string;
  rate_eur: string;
  rate_gbp: string;
  rate_jpy: string;
  rate_aud: string;
  rate_cad: string;
  whatsapp_number: string;
  notification_emails: string;
  whatsapp_api_phone_number_id: string;
  whatsapp_api_access_token: string;
  whatsapp_api_business_account_id: string;
  whatsapp_api_webhook_verify_token: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  years_experience: string;
  stat_travelers: string;
  stat_english_travelers: string;
  stat_employees: string;
  stat_guides: string;
  stat_happy_percent: string;
  stat_recommendation_percent: string;
  tripadvisor_url: string;
  google_reviews_url: string;
  facebook_url: string;
  instagram_url: string;
  getyourguide_url: string;
  kkday_url: string;
  viator_url: string;
  custom_review_1_label: string;
  custom_review_1_url: string;
  custom_review_2_label: string;
  custom_review_2_url: string;
  custom_review_3_label: string;
  custom_review_3_url: string;
  /** Optional uploaded logo image for each "follow/review us on" badge —
   *  when set, TrustBadges renders this image instead of the default
   *  lucide icon + brand-color circle. Lets the admin use the platform's
   *  real logo (e.g. Facebook, TikTok) instead of a generic icon. */
  tripadvisor_logo_url: string;
  google_reviews_logo_url: string;
  facebook_logo_url: string;
  instagram_logo_url: string;
  getyourguide_logo_url: string;
  kkday_logo_url: string;
  viator_logo_url: string;
  custom_review_1_logo_url: string;
  custom_review_2_logo_url: string;
  custom_review_3_logo_url: string;
  /** "sans" (default, Noto Sans Thai — required for Thai/Japanese text) or
   *  "serif" (Times-Roman, a classic quotation look). Serif only applies to
   *  Latin-script PDF languages (en/fr/de/es); Thai and Japanese PDFs always
   *  use the sans font since it's the only one with those glyphs embedded. */
  pdf_font_style: string;
  /** "About Us" page content (item — editable about page). Base fields are
   *  Thai; about_translations_json holds per-locale overrides in the same
   *  shape as tour/review translations: {en: {kicker, title, intro,
   *  value1Title, value1Desc, value2Title, value2Desc, value3Title,
   *  value3Desc}, fr: {...}, ...}. */
  about_kicker: string;
  about_title: string;
  about_intro: string;
  about_value1_title: string;
  about_value1_desc: string;
  about_value2_title: string;
  about_value2_desc: string;
  about_value3_title: string;
  about_value3_desc: string;
  about_translations_json: string;
  /** Per-language card content on the language-select landing page (the
   *  very first page a visitor sees) — image + tagline per locale. JSON
   *  shape: {"th": {"image": "...", "tagline": "..."}, "en": {...}, ...}.
   *  A locale missing here falls back to the built-in default image/tagline
   *  in i18n/routing.ts and app/page.tsx so the page never shows blank. */
  language_page_json: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "November Trip",
  company_name: "November Trip",
  logo_url: "/logo.jpg",
  // Blue/white palette to match the November Trip logo (navy + sky blue).
  color_bg: "#ffffff",
  color_surface: "#ffffff",
  color_primary: "#1b4965",
  color_primary_dark: "#0d2b3f",
  color_accent: "#4fa8c9",
  color_ink: "#16324a",
  hero_images:
    "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200\nhttps://images.unsplash.com/photo-1528127269322-539801943592?w=1200\nhttps://images.unsplash.com/photo-1508009603885-50cf7c079365?w=1200",
  payment_logos: "",
  consultant_name: "คุณมายา",
  consultant_role: "ที่ปรึกษาการเดินทาง",
  consultant_photo_url: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=300",
  consultant_greeting: "สวัสดีค่ะ 👋 มีทริปในใจแล้วหรือยัง ให้ช่วยแนะนำไหมคะ?",
  rate_usd: "0.028",
  rate_eur: "0.026",
  rate_gbp: "0.022",
  rate_jpy: "4.3",
  rate_aud: "0.043",
  rate_cad: "0.038",
  whatsapp_number: "66812345678",
  notification_emails: process.env.ADMIN_NOTIFY_EMAIL || "",
  whatsapp_api_phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  whatsapp_api_access_token: process.env.WHATSAPP_ACCESS_TOKEN || "",
  whatsapp_api_business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
  whatsapp_api_webhook_verify_token: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
  contact_email: "hello@novembertrip.example",
  contact_phone: "02-123-4567",
  contact_address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
  years_experience: "12",
  stat_travelers: "18,400",
  stat_english_travelers: "9,200",
  stat_employees: "24",
  stat_guides: "80",
  stat_happy_percent: "98",
  stat_recommendation_percent: "72",
  tripadvisor_url: "",
  google_reviews_url: "",
  facebook_url: "",
  instagram_url: "",
  getyourguide_url: "",
  kkday_url: "",
  viator_url: "",
  custom_review_1_label: "",
  custom_review_1_url: "",
  custom_review_2_label: "",
  custom_review_2_url: "",
  custom_review_3_label: "",
  custom_review_3_url: "",
  tripadvisor_logo_url: "",
  google_reviews_logo_url: "",
  facebook_logo_url: "",
  instagram_logo_url: "",
  getyourguide_logo_url: "",
  kkday_logo_url: "",
  viator_logo_url: "",
  custom_review_1_logo_url: "",
  custom_review_2_logo_url: "",
  custom_review_3_logo_url: "",
  pdf_font_style: "sans",
  about_kicker: "เรื่องราวของเรา",
  about_title: "เกี่ยวกับ November Trip",
  about_intro:
    "November Trip ก่อตั้งขึ้นจากความเชื่อว่าการเดินทางที่ดีที่สุดคือการเดินทางที่ออกแบบร่วมกับคนในพื้นที่ เราทำงานร่วมกับไกด์ท้องถิ่นทั่วประเทศไทย ทั้งภาคเหนือ ภาคใต้ ภาคกลาง และภาคอีสาน เพื่อสร้างทริปที่ให้ทั้งความรู้ ความสนุก และความยั่งยืนต่อชุมชนที่เราไปเยือน",
  about_value1_title: "ออกแบบเฉพาะเส้นทาง",
  about_value1_desc: "ไม่มีสองทริปที่เหมือนกันทุกประการ ทุกอย่างปรับได้ตามกลุ่มเดินทาง",
  about_value2_title: "ใส่ใจในรายละเอียด",
  about_value2_desc: "จากที่พักไปจนถึงมื้ออาหาร เราคัดสรรด้วยตัวเองทุกจุด",
  about_value3_title: "ท่องเที่ยวอย่างยั่งยืน",
  about_value3_desc: "สนับสนุนชุมชนท้องถิ่นและลดผลกระทบต่อสิ่งแวดล้อม",
  about_translations_json: JSON.stringify({
    en: {
      kicker: "Our Story",
      title: "About November Trip",
      intro:
        "November Trip was founded on the belief that the best trips are designed together with people who live there. We work with local guides across Thailand — from the north to the south, the central plains to the northeast — to build trips that are educational, fun, and sustainable for the communities we visit.",
      value1Title: "Route-first design",
      value1Desc: "No two trips are exactly alike — everything adapts to your travel group.",
      value2Title: "Attention to detail",
      value2Desc: "From accommodation to meals, we personally curate every touchpoint.",
      value3Title: "Sustainable travel",
      value3Desc: "Supporting local communities and reducing our environmental impact.",
    },
    fr: {
      kicker: "Notre histoire",
      title: "À propos de November Trip",
      intro:
        "November Trip est né de la conviction que les meilleurs voyages sont conçus avec les personnes qui vivent sur place. Nous travaillons avec des guides locaux dans toute la Thaïlande — du nord au sud, des plaines centrales au nord-est — pour créer des voyages enrichissants, agréables et durables pour les communautés que nous visitons.",
      value1Title: "Conception centrée sur l'itinéraire",
      value1Desc: "Deux voyages ne se ressemblent jamais — tout s'adapte à votre groupe de voyageurs.",
      value2Title: "Souci du détail",
      value2Desc: "De l'hébergement aux repas, nous sélectionnons personnellement chaque étape.",
      value3Title: "Voyage durable",
      value3Desc: "Soutenir les communautés locales et réduire notre impact environnemental.",
    },
    de: {
      kicker: "Unsere Geschichte",
      title: "Über November Trip",
      intro:
        "November Trip wurde aus der Überzeugung gegründet, dass die besten Reisen gemeinsam mit den Menschen vor Ort gestaltet werden. Wir arbeiten mit einheimischen Guides in ganz Thailand zusammen — vom Norden bis zum Süden, von der Zentralebene bis zum Nordosten —, um Reisen zu schaffen, die lehrreich, unterhaltsam und nachhaltig für die besuchten Gemeinschaften sind.",
      value1Title: "Routenorientiertes Design",
      value1Desc: "Keine zwei Reisen sind genau gleich — alles passt sich Ihrer Reisegruppe an.",
      value2Title: "Liebe zum Detail",
      value2Desc: "Von der Unterkunft bis zu den Mahlzeiten kuratieren wir jeden Berührungspunkt persönlich.",
      value3Title: "Nachhaltiges Reisen",
      value3Desc: "Unterstützung lokaler Gemeinschaften und Reduzierung unserer Umweltauswirkungen.",
    },
    ja: {
      kicker: "私たちの物語",
      title: "November Tripについて",
      intro:
        "November Tripは、「最高の旅とは、その土地に住む人々と一緒にデザインするものだ」という信念のもとに生まれました。タイ全土——北部から南部、中部から東北部まで——の現地ガイドと協力し、学びと楽しさ、そして地域社会にとって持続可能な旅をつくっています。",
      value1Title: "ルート重視の設計",
      value1Desc: "同じ旅は二つとありません。すべてはお客様の旅行グループに合わせて調整されます。",
      value2Title: "細部へのこだわり",
      value2Desc: "宿泊先から食事まで、私たち自身が一つひとつ厳選しています。",
      value3Title: "持続可能な旅",
      value3Desc: "地域社会を支援し、環境への影響を減らします。",
    },
    es: {
      kicker: "Nuestra Historia",
      title: "Sobre November Trip",
      intro:
        "November Trip nació de la convicción de que los mejores viajes se diseñan junto a quienes viven allí. Trabajamos con guías locales por toda Tailandia, del norte al sur, de las llanuras centrales al noreste, para crear viajes educativos, divertidos y sostenibles para las comunidades que visitamos.",
      value1Title: "Diseño centrado en la ruta",
      value1Desc: "No hay dos viajes exactamente iguales: todo se adapta a tu grupo de viaje.",
      value2Title: "Atención al detalle",
      value2Desc: "Desde el alojamiento hasta las comidas, seleccionamos personalmente cada punto de contacto.",
      value3Title: "Viaje sostenible",
      value3Desc: "Apoyamos a las comunidades locales y reducimos nuestro impacto ambiental.",
    },
  }),
  language_page_json: "{}",
};

// Wrapped in React's cache() so that no matter how many components call
// getSettings() during a single request (layout, page, generateMetadata all
// called it independently — up to 3 separate DB round-trips per navigation
// before this), the settings row is only fetched from the database once and
// shared for the rest of that request.
// Wrapped in React's cache() so that no matter how many components call
// getSettings() during a single request (layout, page, generateMetadata all
// called it independently — up to 3 separate DB round-trips per navigation
// before this), the settings row is only fetched from the database once and
// shared for the rest of that request. This is per-request only (not shared
// across visitors) — it doesn't touch the filesystem, so it's safe on any
// hosting platform regardless of whether the filesystem is writable.
export const getSettings = cache(async function getSettings(): Promise<SiteSettings> {
  const rows = await query<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
});

export async function updateSettings(partial: Partial<SiteSettings>): Promise<void> {
  for (const [key, value] of Object.entries(partial)) {
    await query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
      [key, String(value ?? "")]
    );
  }
}

export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/[^0-9]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function parseHeroImages(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parses the Settings page's "notification emails" field (one per line, or
 *  comma-separated) into a clean list, dropping blanks and obvious typos. */
export function parseNotificationEmails(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.includes("@"));
}

/** Resolves the consultant popup's role/greeting for a given locale, falling
 *  back to the Thai base text whenever no translation has been entered. */
export function getLocalizedConsultant(settings: SiteSettings, locale: string): { role: string; greeting: string } {
  const key = locale as "th" | "en" | "fr" | "de" | "ja";
  const roleKey = `consultant_role_${key}` as keyof SiteSettings;
  const greetingKey = `consultant_greeting_${key}` as keyof SiteSettings;
  return {
    role: (settings[roleKey] as string) || settings.consultant_role,
    greeting: (settings[greetingKey] as string) || settings.consultant_greeting,
  };
}
