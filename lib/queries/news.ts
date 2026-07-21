import { query, queryOne } from "@/lib/db";
import type { NewsPost, NewsTranslations } from "@/lib/types";

function rowToNews(row: any): NewsPost {
  return { ...row, published: !!row.published, translations: JSON.parse(row.translations_json || "{}") };
}

export async function listNews(publishedOnly = false): Promise<NewsPost[]> {
  const rows = publishedOnly
    ? await query("SELECT * FROM news WHERE published = 1 ORDER BY created_at DESC")
    : await query("SELECT * FROM news ORDER BY created_at DESC");
  return rows.map(rowToNews);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const row = await queryOne("SELECT * FROM news WHERE slug = $1", [slug]);
  return row ? rowToNews(row) : null;
}

export async function getNewsById(id: number): Promise<NewsPost | null> {
  const row = await queryOne("SELECT * FROM news WHERE id = $1", [id]);
  return row ? rowToNews(row) : null;
}

export interface NewsInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  published: boolean;
  translations: NewsTranslations;
}

export async function createNews(input: NewsInput): Promise<number> {
  const row = await queryOne<{ id: number }>(
    "INSERT INTO news (slug, title, excerpt, content, cover_image_url, published, translations_json) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [input.slug, input.title, input.excerpt, input.content, input.cover_image_url, input.published ? 1 : 0, JSON.stringify(input.translations || {})]
  );
  return row!.id;
}

export async function updateNews(id: number, input: NewsInput): Promise<void> {
  await query(
    "UPDATE news SET slug = $1, title = $2, excerpt = $3, content = $4, cover_image_url = $5, published = $6, translations_json = $7 WHERE id = $8",
    [input.slug, input.title, input.excerpt, input.content, input.cover_image_url, input.published ? 1 : 0, JSON.stringify(input.translations || {}), id]
  );
}

export async function deleteNews(id: number): Promise<void> {
  await query("DELETE FROM news WHERE id = $1", [id]);
}

export async function createContactMessage(data: { name: string; email: string; subject?: string; message: string }): Promise<number> {
  const row = await queryOne<{ id: number }>(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING id",
    [data.name, data.email, data.subject || null, data.message]
  );
  return row!.id;
}

export async function listContactMessages() {
  return query("SELECT * FROM contact_messages ORDER BY created_at DESC");
}
