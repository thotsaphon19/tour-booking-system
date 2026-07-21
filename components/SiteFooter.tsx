import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RouteLine } from "@/components/RouteLine";
import TrustBadges from "@/components/TrustBadges";
import PaymentBadges from "@/components/PaymentBadges";
import type { SiteSettings } from "@/lib/queries/settings";
import type { PartnerEmbed } from "@/lib/queries/partnerEmbeds";
import PartnerEmbeds from "@/components/PartnerEmbeds";
import AnimatedNumber from "@/components/motion/AnimatedNumber";

export default function SiteFooter({ settings, partnerEmbeds = [] }: { settings: SiteSettings; partnerEmbeds?: PartnerEmbed[] }) {
  const t = useTranslations("footer");

  const stats = [
    { value: settings.years_experience, label: "" },
    { value: settings.stat_travelers, label: "" },
    { value: settings.stat_english_travelers, label: "" },
    { value: settings.stat_employees, label: "" },
    { value: settings.stat_guides, label: "" },
    { value: `${settings.stat_happy_percent}%`, label: "" },
    { value: `${settings.stat_recommendation_percent}%`, label: "" },
  ];
  const statLabels = t.raw("statLabels") as string[] | undefined;

  return (
    <footer className="mt-24 bg-[var(--color-jade-dark)] text-[var(--color-sand)]">
      {/* Stats bar */}
      <div className="border-b border-white/10 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 text-center sm:grid-cols-4 lg:grid-cols-7">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="font-display text-2xl font-semibold text-[var(--color-gold-light)]">
                <AnimatedNumber value={String(s.value)} />
              </p>
              <p className="mt-1 text-xs text-[var(--color-sand)]/70">{statLabels?.[i]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-14">
        <RouteLine className="mb-10 h-4 w-40" withPins={false} />
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl font-semibold text-white">{settings.company_name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-sand)]/70">{t("tagline")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-light)]">{t("exploreTitle")}</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-sand)]/80">
              <li><Link href="/tours">{t("allTours")}</Link></li>
              <li><Link href="/reviews">{t("reviews")}</Link></li>
              <li><Link href="/news">{t("articles")}</Link></li>
              <li><Link href="/about">{t("about")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-light)]">{t("contactTitle")}</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-sand)]/80">
              <li>{t("phone")} {settings.contact_phone}</li>
              <li>{settings.contact_email}</li>
              <li><Link href="/contact">{t("sendMessage")}</Link></li>
              <li><a href="/admin" className="text-[var(--color-sand)]/40">{t("adminPanel")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <PaymentBadges settings={settings} label={t("paymentMethods")} variant="dark" />
        </div>

        <div className="mt-6 border-t border-white/10 pt-8">
          <TrustBadges settings={settings} label={t("findReviews")} variant="dark" />
        </div>

        {partnerEmbeds.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-8">
            <PartnerEmbeds embeds={partnerEmbeds} />
          </div>
        )}

        <p className="mt-12 text-xs text-[var(--color-sand)]/40">
          © {new Date().getFullYear()} {settings.company_name} · {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
