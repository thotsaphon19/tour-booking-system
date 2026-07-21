import { query, queryOne } from "@/lib/db";
import type { ReviewTranslations } from "@/lib/types";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: number;
  customer_name: string;
  customer_country: string | null;
  customer_photo_url: string | null;
  customer_email: string | null;
  tour_id: number | null;
  rating: number;
  title: string;
  quote: string;
  travel_dates: string | null;
  featured: boolean;
  status: ReviewStatus;
  translations: ReviewTranslations;
  created_at: string;
  // joined field, populated only by listReviewsForAdmin
  tour_title?: string;
}

function rowToReview(row: any): Review {
  return {
    ...row,
    rating: Number(row.rating),
    featured: !!row.featured,
    tour_id: row.tour_id ?? null,
    status: (row.status || "approved") as ReviewStatus,
    translations: JSON.parse(row.translations_json || "{}"),
  };
}

/** Public-facing: only ever returns reviews that passed moderation, so a
 *  pending or rejected customer submission can never show up on the site
 *  before an admin has looked at it. */
export async function listReviews(featuredOnly = false): Promise<Review[]> {
  const rows = featuredOnly
    ? await query("SELECT * FROM reviews WHERE featured = 1 AND status = 'approved' ORDER BY created_at DESC")
    : await query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC");
  return rows.map(rowToReview);
}

/** Admin-facing: every review regardless of status, optionally filtered to
 *  one status (e.g. the "pending" moderation queue). Includes the tour
 *  title for submissions linked to a specific tour. */
export async function listReviewsForAdmin(status?: ReviewStatus): Promise<Review[]> {
  const rows = status
    ? await query(
        `SELECT reviews.*, tours.title AS tour_title FROM reviews
         LEFT JOIN tours ON tours.id = reviews.tour_id
         WHERE reviews.status = $1 ORDER BY reviews.created_at DESC`,
        [status]
      )
    : await query(
        `SELECT reviews.*, tours.title AS tour_title FROM reviews
         LEFT JOIN tours ON tours.id = reviews.tour_id
         ORDER BY reviews.created_at DESC`
      );
  return rows.map(rowToReview);
}

export async function countPendingReviews(): Promise<number> {
  const row = await queryOne<{ count: string }>("SELECT COUNT(*)::text AS count FROM reviews WHERE status = 'pending'");
  return Number(row?.count || 0);
}

export async function getReviewById(id: number): Promise<Review | null> {
  const row = await queryOne("SELECT * FROM reviews WHERE id = $1", [id]);
  return row ? rowToReview(row) : null;
}

export interface ReviewInput {
  customer_name: string;
  customer_country: string;
  customer_photo_url: string;
  rating: number;
  title: string;
  quote: string;
  travel_dates: string;
  featured: boolean;
  status: ReviewStatus;
  translations: ReviewTranslations;
}

/** Used by the admin review form. Admin-authored reviews still publish
 *  immediately by default (status defaults to "approved" below), same as
 *  before this feature existed — moderation only applies to what customers
 *  submit through the public form. */
export async function createReview(input: ReviewInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO reviews (customer_name, customer_country, customer_photo_url, rating, title, quote, travel_dates, featured, status, translations_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      input.customer_name,
      input.customer_country || null,
      input.customer_photo_url || null,
      input.rating,
      input.title,
      input.quote,
      input.travel_dates || null,
      input.featured ? 1 : 0,
      input.status || "approved",
      JSON.stringify(input.translations || {}),
    ]
  );
  return row!.id;
}

export async function updateReview(id: number, input: ReviewInput): Promise<void> {
  await query(
    `UPDATE reviews SET customer_name = $1, customer_country = $2, customer_photo_url = $3, rating = $4, title = $5, quote = $6, travel_dates = $7, featured = $8, status = $9, translations_json = $10
     WHERE id = $11`,
    [
      input.customer_name,
      input.customer_country || null,
      input.customer_photo_url || null,
      input.rating,
      input.title,
      input.quote,
      input.travel_dates || null,
      input.featured ? 1 : 0,
      input.status || "approved",
      JSON.stringify(input.translations || {}),
      id,
    ]
  );
}

export async function deleteReview(id: number): Promise<void> {
  await query("DELETE FROM reviews WHERE id = $1", [id]);
}

// -----------------------------------------------------------------------------
// Public submission (item #6 — customers writing their own review)
// -----------------------------------------------------------------------------

export interface PublicReviewInput {
  customer_name: string;
  customer_email: string;
  customer_country: string;
  tour_id: number | null;
  rating: number;
  title: string;
  quote: string;
  travel_dates: string;
}

/** A review a customer submits themselves through the public site. Always
 *  starts as "pending" and not featured — it only becomes visible once an
 *  admin approves it in /admin/reviews. */
export async function createPublicReview(input: PublicReviewInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO reviews (customer_name, customer_email, customer_country, tour_id, rating, title, quote, travel_dates, featured, status, translations_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'pending', '{}') RETURNING id`,
    [
      input.customer_name,
      input.customer_email || null,
      input.customer_country || null,
      input.tour_id,
      input.rating,
      input.title,
      input.quote,
      input.travel_dates || null,
    ]
  );
  return row!.id;
}

export async function setReviewStatus(id: number, status: "approved" | "rejected"): Promise<void> {
  await query("UPDATE reviews SET status = $1 WHERE id = $2", [status, id]);
}
