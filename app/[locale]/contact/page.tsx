import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/queries/settings";
import { Link } from "@/i18n/navigation";
import { RouteLine } from "@/components/RouteLine";
import ContactForm from "@/components/ContactForm";
import PersonalizeForm from "@/components/PersonalizeForm";
import { Mail, Phone, MapPin } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  const settings = await getSettings();
  return { title: `${t("title")} | ${settings.company_name}` };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; tour?: string }>;
}) {
  const { mode, tour } = await searchParams;
  const isPersonalize = mode === "personalize";
  const t = await getTranslations("contact");
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("kicker")}</p>
      <h1 className="font-display text-4xl font-semibold text-[var(--color-jade-dark)]">{t("title")}</h1>
      <RouteLine className="my-6 h-5 w-52" />

      <div className="mb-8 flex gap-2">
        <Link
          href="/contact"
          className={`rounded-full px-4 py-2 text-sm font-semibold ${!isPersonalize ? "bg-[var(--color-jade)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"}`}
        >
          {t("tabGeneral")}
        </Link>
        <Link
          href="/contact?mode=personalize"
          className={`rounded-full px-4 py-2 text-sm font-semibold ${isPersonalize ? "bg-[var(--color-clay)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"}`}
        >
          {t("tabPersonalize")}
        </Link>
      </div>

      <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <p className="text-[var(--color-ink-soft)]">{isPersonalize ? t("introPersonalize") : t("introGeneral")}</p>
          <ContactItem icon={<Phone size={18} />} label={t("phone")} value={settings.contact_phone} />
          <ContactItem icon={<Mail size={18} />} label={t("email")} value={settings.contact_email} />
          <ContactItem icon={<MapPin size={18} />} label={t("address")} value={settings.contact_address} />
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          {isPersonalize ? <PersonalizeForm tourSlug={tour} /> : <ContactForm />}
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[var(--color-jade)]">{icon}</div>
      <div>
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p className="font-medium text-[var(--color-ink-soft)]">{value}</p>
      </div>
    </div>
  );
}
