import { query, queryOne } from "@/lib/db";
import type { Tour, ItineraryDay, PriceTier, HotelListItem, TourTranslations } from "@/lib/types";

function rowToTour(row: any): Tour {
  return {
    ...row,
    duration_days: Number(row.duration_days),
    price: Number(row.price),
    max_group_size: Number(row.max_group_size),
    difficulty_rating: Number(row.difficulty_rating),
    comfort_rating: Number(row.comfort_rating),
    rating_score: row.rating_score === null ? null : Number(row.rating_score),
    rating_count: row.rating_count === null ? null : Number(row.rating_count),
    gallery: JSON.parse(row.gallery_json || "[]"),
    itinerary: JSON.parse(row.itinerary_json || "[]"),
    includes: JSON.parse(row.includes_json || "[]"),
    excludes: JSON.parse(row.excludes_json || "[]"),
    highlights: JSON.parse(row.highlights_json || "[]"),
    price_tiers: JSON.parse(row.price_tiers_json || "[]"),
    hotel_images: JSON.parse(row.hotel_images_json || "[]"),
    hotel_list: JSON.parse(row.hotel_list_json || "[]"),
    tags: JSON.parse(row.tags_json || "[]"),
    translations: JSON.parse(row.translations_json || "{}"),
    departure_dates: JSON.parse(row.departure_dates_json || "[]"),
  };
}

export async function listTours(opts: { status?: string; category?: string; province?: string; tag?: string } = {}): Promise<Tour[]> {
  let sql = "SELECT * FROM tours WHERE 1=1";
  const params: any[] = [];
  if (opts.status) {
    params.push(opts.status);
    sql += ` AND status = $${params.length}`;
  }
  if (opts.category) {
    params.push(opts.category);
    sql += ` AND category = $${params.length}`;
  }
  if (opts.province) {
    params.push(opts.province);
    sql += ` AND province = $${params.length}`;
  }
  if (opts.tag) {
    params.push(`%${opts.tag}%`);
    sql += ` AND tags_json LIKE $${params.length}`;
  }
  sql += " ORDER BY created_at DESC";
  const rows = await query(sql, params);
  return rows.map(rowToTour);
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const row = await queryOne("SELECT * FROM tours WHERE slug = $1", [slug]);
  return row ? rowToTour(row) : null;
}

export async function getTourById(id: number): Promise<Tour | null> {
  const row = await queryOne("SELECT * FROM tours WHERE id = $1", [id]);
  return row ? rowToTour(row) : null;
}

export interface TourInput {
  slug: string;
  title: string;
  category: string;
  province: string;
  duration_days: number;
  price: number;
  currency: string;
  max_group_size: number;
  difficulty: string;
  cover_image_url: string;
  gallery: string[];
  summary: string;
  description: string;
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  status: string;
  price_tiers: PriceTier[];
  difficulty_rating: number;
  comfort_rating: number;
  rating_score: number | null;
  rating_count: number | null;
  rating_source: string | null;
  hotel_name: string;
  hotel_description: string;
  hotel_images: string[];
  hotel_list: HotelListItem[];
  agent_name: string;
  agent_role: string;
  agent_photo_url: string;
  tags: string[];
  video_url: string;
  tour_code: string;
  map_embed_url: string;
  translations: TourTranslations;
  departure_dates: string[];
}

const COLUMNS = [
  "slug", "title", "category", "province", "duration_days", "price", "currency",
  "max_group_size", "difficulty", "cover_image_url", "gallery_json", "summary",
  "description", "itinerary_json", "includes_json", "excludes_json", "highlights_json", "status",
  "price_tiers_json", "difficulty_rating", "comfort_rating", "rating_score", "rating_count", "rating_source",
  "hotel_name", "hotel_description", "hotel_images_json", "hotel_list_json", "agent_name", "agent_role", "agent_photo_url",
  "tags_json", "video_url", "tour_code", "map_embed_url", "translations_json", "departure_dates_json",
];

function toParams(input: TourInput) {
  return [
    input.slug,
    input.title,
    input.category,
    input.province,
    input.duration_days,
    input.price,
    input.currency,
    input.max_group_size,
    input.difficulty,
    input.cover_image_url,
    JSON.stringify(input.gallery),
    input.summary,
    input.description,
    JSON.stringify(input.itinerary),
    JSON.stringify(input.includes),
    JSON.stringify(input.excludes),
    JSON.stringify(input.highlights),
    input.status,
    JSON.stringify(input.price_tiers),
    input.difficulty_rating,
    input.comfort_rating,
    input.rating_score,
    input.rating_count,
    input.rating_source,
    input.hotel_name || null,
    input.hotel_description || null,
    JSON.stringify(input.hotel_images),
    JSON.stringify(input.hotel_list),
    input.agent_name || null,
    input.agent_role || null,
    input.agent_photo_url || null,
    JSON.stringify(input.tags),
    input.video_url || null,
    input.tour_code || null,
    input.map_embed_url || null,
    JSON.stringify(input.translations || {}),
    JSON.stringify(input.departure_dates || []),
  ];
}

export async function createTour(input: TourInput): Promise<number> {
  const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(", ");
  const row = await queryOne<{ id: number }>(
    `INSERT INTO tours (${COLUMNS.join(", ")}) VALUES (${placeholders}) RETURNING id`,
    toParams(input)
  );
  return row!.id;
}

export async function updateTour(id: number, input: TourInput): Promise<void> {
  const params = toParams(input);
  const setClause = COLUMNS.map((c, i) => `${c} = $${i + 1}`).join(", ");
  params.push(id);
  await query(`UPDATE tours SET ${setClause}, updated_at = NOW() WHERE id = $${params.length}`, params);
}

export async function updateTourStatus(id: number, status: string): Promise<void> {
  await query("UPDATE tours SET status = $1, updated_at = NOW() WHERE id = $2", [status, id]);
}

export async function deleteTour(id: number): Promise<void> {
  await query("DELETE FROM tours WHERE id = $1", [id]);
}

/** Lightweight id+title lookup — used by the public review form's optional
 *  "which tour was this?" dropdown, so it doesn't need to pull every tour
 *  field just to populate a <select>. */
export async function listTourTitles(): Promise<{ id: number; title: string }[]> {
  return query<{ id: number; title: string }>("SELECT id, title FROM tours WHERE status = 'active' ORDER BY title ASC");
}

export async function listCategories(): Promise<string[]> {
  const rows = await query<{ category: string }>("SELECT DISTINCT category FROM tours ORDER BY category");
  return rows.map((r) => r.category);
}

export async function listProvinces(): Promise<string[]> {
  const rows = await query<{ province: string }>("SELECT DISTINCT province FROM tours ORDER BY province");
  return rows.map((r) => r.province);
}
