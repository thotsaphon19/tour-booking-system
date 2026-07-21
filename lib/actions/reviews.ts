"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createReview,
  updateReview,
  deleteReview,
  setReviewStatus,
  createPublicReview,
  type ReviewInput,
} from "@/lib/queries/reviews";
import { getSession, canEditSection, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import type { ReviewTranslations } from "@/lib/types";

const reviewSchema = z.object({
  customer_name: z.string().min(2, "กรุณากรอกชื่อลูกค้า"),
  customer_country: z.string().optional(),
  customer_photo_url: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  title: z.string().min(2, "กรุณากรอกหัวข้อรีวิว"),
  quote: z.string().min(5, "กรุณากรอกข้อความรีวิว"),
  travel_dates: z.string().optional(),
  featured: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).default("approved"),
  translations_json: z.string().optional(),
});

export type ReviewFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return canEditSection("reviews");
}

function parseTranslations(json?: string): ReviewTranslations {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as ReviewTranslations) : {};
  } catch {
    return {};
  }
}

function buildInput(data: z.infer<typeof reviewSchema>): ReviewInput {
  return {
    customer_name: data.customer_name,
    customer_country: data.customer_country || "",
    customer_photo_url: data.customer_photo_url || "",
    rating: data.rating,
    title: data.title,
    quote: data.quote,
    travel_dates: data.travel_dates || "",
    featured: data.featured === "on",
    status: data.status,
    translations: parseTranslations(data.translations_json),
  };
}

export async function createReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  const id = await createReview(buildInput(parsed.data));
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  redirect(`/admin/reviews/${id}/edit?created=1`);
}

export async function updateReviewAction(id: number, _prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  await updateReview(id, buildInput(parsed.data));
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteReviewAction(id: number, label: string) {
  if (!(await requireAdmin())) return;
  const result = await deleteWithApproval("reviews", id, label, () => deleteReview(id));
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  revalidatePath("/admin/deletion-requests");
  return result;
}

export async function moderateReviewAction(id: number, status: "approved" | "rejected") {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  await setReviewStatus(id, status);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Public submission (item #6) — a customer writing their own review
// -----------------------------------------------------------------------------

const publicReviewSchema = z.object({
  customer_name: z.string().min(2, "กรุณากรอกชื่อ"),
  customer_email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  customer_country: z.string().optional(),
  tour_id: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  title: z.string().min(2, "กรุณากรอกหัวข้อรีวิว"),
  quote: z.string().min(10, "กรุณากรอกรายละเอียดอย่างน้อย 10 ตัวอักษร"),
  travel_dates: z.string().optional(),
  // Honeypot: a field real visitors never see or fill in (hidden via CSS in
  // the form), but simple spam bots that auto-fill every input often do.
  // Any value here silently drops the submission instead of erroring, so a
  // bot can't tell it was rejected.
  website: z.string().optional(),
});

export type PublicReviewFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

export async function submitPublicReviewAction(
  _prev: PublicReviewFormState,
  formData: FormData
): Promise<PublicReviewFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = publicReviewSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  if (parsed.data.website) {
    // Honeypot tripped — pretend it worked so the bot moves on.
    return { ok: true, message: "ส่งรีวิวสำเร็จ ขอบคุณค่ะ" };
  }

  await createPublicReview({
    customer_name: parsed.data.customer_name,
    customer_email: parsed.data.customer_email || "",
    customer_country: parsed.data.customer_country || "",
    tour_id: parsed.data.tour_id ? Number(parsed.data.tour_id) : null,
    rating: parsed.data.rating,
    title: parsed.data.title,
    quote: parsed.data.quote,
    travel_dates: parsed.data.travel_dates || "",
  });
  revalidatePath("/admin/reviews");

  return { ok: true, message: "ส่งรีวิวสำเร็จ! ทีมงานจะตรวจสอบก่อนเผยแพร่บนเว็บไซต์" };
}
