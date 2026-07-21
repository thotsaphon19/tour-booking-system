import type { Review } from "@/lib/queries/reviews";

function isTranslatableLocale(locale: string): locale is "th" | "en" | "fr" | "de" | "ja" {
  return locale === "th" || locale === "en" || locale === "fr" || locale === "de" || locale === "ja" || locale === "es";
}

export function localizeReview(review: Review, locale: string): Review {
  if (!isTranslatableLocale(locale)) return review;
  const tr = review.translations?.[locale];
  if (!tr) return review;
  return {
    ...review,
    customer_name: tr.customer_name?.trim() ? tr.customer_name : review.customer_name,
    customer_country: tr.customer_country?.trim() ? tr.customer_country : review.customer_country,
    title: tr.title?.trim() ? tr.title : review.title,
    quote: tr.quote?.trim() ? tr.quote : review.quote,
  };
}

export function localizeReviews(reviews: Review[], locale: string): Review[] {
  return reviews.map((r) => localizeReview(r, locale));
}
