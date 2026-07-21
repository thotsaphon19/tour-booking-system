import { getTranslations, getLocale } from "next-intl/server";
import { getSettings } from "@/lib/queries/settings";
import { listReviews } from "@/lib/queries/reviews";
import { listTourTitles } from "@/lib/queries/tours";
import { RouteLine } from "@/components/RouteLine";
import ReviewCard from "@/components/ReviewCard";
import WriteReviewForm from "@/components/WriteReviewForm";
import { localizeReviews } from "@/lib/i18n/localizeReview";

export async function generateMetadata() {
  const t = await getTranslations("reviews");
  const settings = await getSettings();
  return { title: `${t("title")} | ${settings.company_name}` };
}

export default async function ReviewsPage() {
  const t = await getTranslations("reviews");
  const locale = await getLocale();
  const [rawReviews, tours] = await Promise.all([listReviews(), listTourTitles()]);
  const reviews = localizeReviews(rawReviews, locale);
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("kicker")}</p>
          <h1 className="font-display text-4xl font-semibold text-[var(--color-jade-dark)]">{t("title")}</h1>
        </div>
      </div>
      <RouteLine className="my-6 h-5 w-52" />
      {reviews.length > 0 && (
        <p className="text-[var(--color-muted)]">
          <span className="font-semibold text-[var(--color-jade)]">{avg.toFixed(1)}/5</span> {t("avgLabel")} {reviews.length} {t("reviewsWord")}
        </p>
      )}

      <div className="mt-6">
        <WriteReviewForm tours={tours} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {reviews.length === 0 && <p className="text-[var(--color-muted)]">-</p>}
      </div>
    </div>
  );
}
