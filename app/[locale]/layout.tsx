import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingContact from "@/components/FloatingContact";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { getSettings, getLocalizedConsultant } from "@/lib/queries/settings";
import { listProvinces } from "@/lib/queries/tours";
import { listPartnerEmbeds } from "@/lib/queries/partnerEmbeds";
import { buildThemeCss } from "@/lib/theme";
import { ratesFromSettings } from "@/lib/currency";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Every page under this layout (home, tours, tour detail, about, reviews,
// news, contact) is rendered once and cached for up to 60 seconds, then
// served instantly to visitors from Vercel's cache instead of hitting the
// database on every single page view — regenerating quietly in the
// background so content still updates automatically, just with up to a
// 60-second delay instead of zero delay. This is Next.js's original ISR
// mechanism, not the new "Cache Components" API (unstable_cache/
// updateTag) — that one caused a production outage here recently because
// it's part of an experimental system with known open issues on Vercel as
// of Next.js 16.2. `revalidate` has been stable since Next.js 12 and is
// the same mechanism used by nearly every production Next.js site's blog/
// product pages, so it's a much safer way to get the same speed win.
//
// A page can opt out (always render fresh, e.g. if it ever needs live
// per-visitor data) by exporting its own `export const revalidate = 0;`.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getSettings(),
  ]);
  return {
    description: t("description", { company: settings.company_name }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale subtree.
  setRequestLocale(locale);

  const [settings, provinces, partnerEmbeds] = await Promise.all([getSettings(), listProvinces(), listPartnerEmbeds()]);
  const rates = ratesFromSettings(settings);
  const consultant = getLocalizedConsultant(settings, locale);

  return (
    <NextIntlClientProvider>
      <CurrencyProvider rates={rates}>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: buildThemeCss(settings) }} />
        <SiteHeader
          provinces={provinces}
          contactEmail={settings.contact_email}
          yearsExperience={settings.years_experience}
          siteName={settings.site_name}
          logoUrl={settings.logo_url}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} partnerEmbeds={partnerEmbeds} />
        <FloatingContact
          whatsappNumber={settings.whatsapp_number}
          email={settings.contact_email}
          phone={settings.contact_phone}
          consultantName={settings.consultant_name}
          consultantRole={consultant.role}
          consultantPhotoUrl={settings.consultant_photo_url}
          consultantGreeting={consultant.greeting}
        />
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
