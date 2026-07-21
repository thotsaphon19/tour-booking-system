import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Compass, ShieldCheck, Users2, Mail } from "lucide-react";
import { listTours, listCategories } from "@/lib/queries/tours";
import { listNews } from "@/lib/queries/news";
import { listReviews } from "@/lib/queries/reviews";
import { getSettings, parseHeroImages } from "@/lib/queries/settings";
import TourCard from "@/components/TourCard";
import TrustBadges from "@/components/TrustBadges";
import ReviewCard from "@/components/ReviewCard";
import HeroCarousel from "@/components/HeroCarousel";
import FiveStepsSection from "@/components/FiveStepsSection";
import { RouteLine } from "@/components/RouteLine";
import { formatDate } from "@/lib/format";
import { localizeTours, buildLabelMaps } from "@/lib/i18n/localizeTour";
import { localizeNewsList } from "@/lib/i18n/localizeNews";
import { localizeReviews } from "@/lib/i18n/localizeReview";
import Reveal from "@/components/motion/Reveal";

export default async function HomePage() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const settings = await getSettings();
  const heroImages =
    parseHeroImages(settings.hero_images).length > 0
      ? parseHeroImages(settings.hero_images)
      : ["https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200"];

  // These four don't depend on each other, so fetch them all at once instead
  // of waiting for each one in turn — this was one of the bigger sources of
  // the "site feels slow" complaints, since the home page is the very first
  // page people land on after picking a language.
  const [rawTours, rawCategories, rawNews, rawReviews] = await Promise.all([
    listTours({ status: "active" }),
    listCategories(),
    listNews(true),
    listReviews(true),
  ]);

  const tours = localizeTours(rawTours, locale).slice(0, 3);
  const { categoryLabel } = buildLabelMaps(rawTours, locale);
  const categories = rawCategories.map((c) => ({ value: c, label: categoryLabel[c] || c }));
  const posts = localizeNewsList(rawNews.slice(0, 2), locale);
  const reviews = localizeReviews(rawReviews.slice(0, 3), locale);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-jade-dark)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
          <Reveal direction="right">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-light)]">
              {t("heroKicker")}
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.15] md:text-5xl">
              {t("heroTitleLine1")}
              <br />
              <span className="text-[var(--color-gold-light)]">{t("heroTitleLine2")}</span>
            </h1>
            <RouteLine className="my-7 h-5 w-52" />
            <p className="max-w-md text-[var(--color-sand)]/75">{t("heroDesc")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tours"
                className="rounded-full bg-[var(--color-gold)] px-6 py-3 text-sm font-semibold text-[var(--color-jade-dark)] transition hover:scale-105 hover:bg-[var(--color-gold-light)]"
              >
                {t("ctaAllTours")}
              </Link>
              <Link
                href="/contact?mode=personalize"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white/10"
              >
                {t("ctaPersonalize")}
              </Link>
            </div>
          </div>
          </Reveal>
          <Reveal direction="left" delay={0.15}>
          <div className="h-72 overflow-hidden rounded-2xl sm:h-96">
            <HeroCarousel images={heroImages} />
          </div>
          </Reveal>
        </div>

        <Reveal delay={0.3}>
          <div className="border-t border-white/10 py-5">
            <TrustBadges settings={settings} label={t("trustBadgesLabel")} variant="dark" />
          </div>
        </Reveal>
      </section>

      {/* Category strip */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-muted)]">{t("categoryLabel")}</span>
          {categories.map((c, i) => (
            <Reveal key={c.value} delay={i * 0.05} direction="up" duration={0.4} className="inline-block">
            <Link
              href={`/tours?category=${encodeURIComponent(c.value)}`}
              className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm text-[var(--color-ink-soft)] transition hover:scale-105 hover:border-[var(--color-jade)] hover:text-[var(--color-jade)]"
            >
              {c.label}
            </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured tours */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("featuredKicker")}</p>
            <h2 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">{t("featuredTitle")}</h2>
          </div>
          <Link href="/tours" className="text-sm font-semibold text-[var(--color-jade)] hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tours.map((tr, i) => (
            <Reveal key={tr.id} delay={i * 0.1}>
              <TourCard tour={tr} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-[var(--color-surface)] py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">{t("whyUsTitle")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Reveal delay={0}>
              <Feature icon={<Compass size={22} />} title={t("why1Title")} desc={t("why1Desc")} />
            </Reveal>
            <Reveal delay={0.12}>
              <Feature icon={<Mail size={22} />} title={t("why2Title")} desc={t("why2Desc")} />
            </Reveal>
            <Reveal delay={0.24}>
              <Feature icon={<ShieldCheck size={22} />} title={t("why3Title")} desc={t("why3Desc")} />
            </Reveal>
          </div>
        </div>
      </section>

      <FiveStepsSection />

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-[var(--color-surface)] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("reviewsKicker")}</p>
                <h2 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">{t("reviewsTitle")}</h2>
              </div>
              <Link href="/reviews" className="text-sm font-semibold text-[var(--color-jade)] hover:underline">
                {t("viewAllReviews")}
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.1}>
                  <ReviewCard review={r} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">{t("newsTitle")}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
              <Link
                href={`/news/${p.slug}`}
                className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {p.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image_url} alt={p.title} className="h-24 w-24 flex-shrink-0 rounded-xl object-cover" />
                )}
                <div>
                  <p className="text-xs text-[var(--color-muted)]">{formatDate(p.created_at)}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-jade-dark)]">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">{p.excerpt}</p>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-[var(--color-jade)] px-8 py-12 text-white md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Users2 size={32} className="text-[var(--color-gold-light)]" />
            <div>
              <h3 className="font-display text-2xl font-semibold">{t("ctaTitle")}</h3>
              <p className="text-[var(--color-sand)]/75">{t("ctaDesc")}</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-jade-dark)] transition hover:scale-105 hover:bg-[var(--color-gold-light)]"
          >
            {t("ctaButton")}
          </Link>
        </div>
        </Reveal>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-jade)]/10 text-[var(--color-jade)] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--color-jade)]/20">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-[var(--color-jade-dark)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{desc}</p>
    </div>
  );
}
