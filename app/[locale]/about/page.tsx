import { getLocale } from "next-intl/server";
import { getSettings } from "@/lib/queries/settings";
import { localizeAbout } from "@/lib/i18n/localizeAbout";
import { RouteLine } from "@/components/RouteLine";
import { Compass, Heart, Leaf } from "lucide-react";

export async function generateMetadata() {
  const settings = await getSettings();
  const locale = await getLocale();
  const about = localizeAbout(settings, locale);
  return { title: `${about.title} | ${settings.company_name}` };
}

export default async function AboutPage() {
  const settings = await getSettings();
  const locale = await getLocale();
  const about = localizeAbout(settings, locale);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{about.kicker}</p>
      <h1 className="font-display text-4xl font-semibold text-[var(--color-jade-dark)]">{about.title}</h1>
      <RouteLine className="my-6 h-5 w-52" />
      <p className="whitespace-pre-line text-base leading-relaxed text-[var(--color-ink-soft)]">{about.intro}</p>
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        <Value icon={<Compass size={22} />} title={about.value1Title} desc={about.value1Desc} />
        <Value icon={<Heart size={22} />} title={about.value2Title} desc={about.value2Desc} />
        <Value icon={<Leaf size={22} />} title={about.value3Title} desc={about.value3Desc} />
      </div>
    </div>
  );
}

function Value({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-jade)]/10 text-[var(--color-jade)]">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-[var(--color-jade-dark)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{desc}</p>
    </div>
  );
}
