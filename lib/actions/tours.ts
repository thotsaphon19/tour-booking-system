"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createTour, updateTour, deleteTour, updateTourStatus, type TourInput } from "@/lib/queries/tours";
import { getSession, canEditSection, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import { slugify } from "@/lib/format";
import type { ItineraryDay, PriceTier, HotelListItem, TourTranslations } from "@/lib/types";

const routeLegSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  distanceKm: z.number().optional(),
  duration: z.string().optional(),
  transport: z.string().optional(),
});

const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  breakfast: z.boolean().optional(),
  lunch: z.boolean().optional(),
  dinner: z.boolean().optional(),
  accommodation: z.string().optional(),
  photos: z.array(z.string()).optional(),
  route: z.array(routeLegSchema).optional(),
});

const priceTierSchema = z.object({
  groupSize: z.number().int().min(1),
  pricePerPerson: z.number().min(0),
});

const hotelListItemSchema = z.object({
  days: z.string(),
  city: z.string(),
  name: z.string(),
  stars: z.number().min(0).max(5),
  image: z.string(),
});

const tourSchema = z.object({
  title: z.string().min(3, "กรุณากรอกชื่อทัวร์"),
  slug: z.string().optional(),
  tour_code: z.string().optional(),
  category: z.string().min(2, "กรุณากรอกหมวดหมู่"),
  province: z.string().min(2, "กรุณากรอกจังหวัด"),
  duration_days: z.coerce.number().int().min(1),
  price: z.coerce.number().int().min(0),
  currency: z.string().min(1).default("THB"),
  max_group_size: z.coerce.number().int().min(1),
  difficulty: z.string().min(1),
  difficulty_rating: z.coerce.number().int().min(1).max(5).default(2),
  comfort_rating: z.coerce.number().int().min(1).max(5).default(4),
  rating_score: z.string().optional(),
  rating_count: z.string().optional(),
  rating_source: z.string().optional(),
  cover_image_url: z
    .string()
    .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/api/uploads/"), "ต้องเป็น URL รูปภาพที่ถูกต้อง"),
  gallery_text: z.string().optional(),
  video_url: z.string().optional(),
  map_embed_url: z.string().optional(),
  summary: z.string().min(3, "กรุณากรอกคำโปรยสั้นๆ"),
  description: z.string().min(3, "กรุณากรอกรายละเอียด"),
  includes_text: z.string().optional(),
  excludes_text: z.string().optional(),
  highlights_text: z.string().optional(),
  itinerary_json: z.string().optional(),
  price_tiers_json: z.string().optional(),
  hotel_name: z.string().optional(),
  hotel_description: z.string().optional(),
  hotel_images_text: z.string().optional(),
  hotel_list_json: z.string().optional(),
  agent_name: z.string().optional(),
  agent_role: z.string().optional(),
  agent_photo_url: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.string().default("active"),
  translations_json: z.string().optional(),
  departure_dates_text: z.string().optional(),
});

function extractMapEmbedUrl(value?: string): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  // Common mistake: pasting the whole <iframe ...></iframe> snippet instead
  // of just the URL inside src="...". Extract it automatically rather than
  // silently saving an unusable value (the iframe's src would otherwise
  // literally be the text "<iframe src=...", which never loads anything).
  const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
  return iframeMatch ? iframeMatch[1] : raw;
}

function linesToArray(text?: string): string[] {
  return (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseDepartureDates(text?: string): string[] {
  return linesToArray(text)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)))
    .sort();
}

function parseJsonArray<T>(json: string | undefined, schema: z.ZodType<T>): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    const result = z.array(schema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function toStringArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseTranslations(json?: string): TourTranslations {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as TourTranslations) : {};
  } catch {
    return {};
  }
}

export type TourFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return canEditSection("tours");
}

function buildInput(data: z.infer<typeof tourSchema>): TourInput {
  return {
    slug: data.slug ? slugify(data.slug) : slugify(data.title),
    title: data.title,
    tour_code: data.tour_code || "",
    category: data.category,
    province: data.province,
    duration_days: data.duration_days,
    price: data.price,
    currency: data.currency,
    max_group_size: data.max_group_size,
    difficulty: data.difficulty,
    difficulty_rating: data.difficulty_rating,
    comfort_rating: data.comfort_rating,
    rating_score: data.rating_score ? Number(data.rating_score) : null,
    rating_count: data.rating_count ? Number(data.rating_count) : null,
    rating_source: data.rating_source || null,
    cover_image_url: data.cover_image_url,
    gallery: linesToArray(data.gallery_text),
    video_url: data.video_url || "",
    map_embed_url: data.map_embed_url || "",
    summary: data.summary,
    description: data.description,
    itinerary: parseJsonArray<ItineraryDay>(data.itinerary_json, itineraryDaySchema as any),
    includes: linesToArray(data.includes_text),
    excludes: linesToArray(data.excludes_text),
    highlights: linesToArray(data.highlights_text),
    status: data.status,
    price_tiers: parseJsonArray<PriceTier>(data.price_tiers_json, priceTierSchema),
    hotel_name: data.hotel_name || "",
    hotel_description: data.hotel_description || "",
    hotel_images: linesToArray(data.hotel_images_text),
    hotel_list: parseJsonArray<HotelListItem>(data.hotel_list_json, hotelListItemSchema),
    agent_name: data.agent_name || "",
    agent_role: data.agent_role || "",
    agent_photo_url: data.agent_photo_url || "",
    tags: toStringArray(data.tags),
    translations: parseTranslations(data.translations_json),
    departure_dates: parseDepartureDates(data.departure_dates_text),
  };
}

export async function createTourAction(_prev: TourFormState, formData: FormData): Promise<TourFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw: Record<string, any> = Object.fromEntries(formData.entries());
  raw.tags = formData.getAll("tags");
  const parsed = tourSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const input = buildInput(parsed.data);
  const id = await createTour(input);
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  redirect(`/admin/tours/${id}/edit?created=1`);
}

export async function updateTourAction(id: number, _prev: TourFormState, formData: FormData): Promise<TourFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw: Record<string, any> = Object.fromEntries(formData.entries());
  raw.tags = formData.getAll("tags");
  const parsed = tourSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const input = buildInput(parsed.data);
  await updateTour(id, input);
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath(`/tours/${input.slug}`);
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteTourAction(id: number, label: string) {
  if (!(await requireAdmin())) return;
  const result = await deleteWithApproval("tours", id, label, () => deleteTour(id));
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  revalidatePath("/admin/deletion-requests");
  return result;
}

export async function toggleTourStatusAction(id: number, nextStatus: "active" | "draft") {
  if (!(await requireAdmin())) return;
  await updateTourStatus(id, nextStatus);
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
}
