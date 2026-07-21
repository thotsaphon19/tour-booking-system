"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createNews, updateNews, deleteNews, type NewsInput } from "@/lib/queries/news";
import { getSession, canEditSection, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import { slugify } from "@/lib/format";
import type { NewsTranslations } from "@/lib/types";

const newsSchema = z.object({
  title: z.string().min(3, "กรุณากรอกหัวข้อ"),
  slug: z.string().optional(),
  excerpt: z.string().min(3, "กรุณากรอกคำโปรยสั้นๆ"),
  content: z.string().min(3, "กรุณากรอกเนื้อหา"),
  cover_image_url: z
    .string()
    .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/api/uploads/"), "ต้องเป็น URL รูปภาพที่ถูกต้อง"),
  published: z.string().optional(),
  translations_json: z.string().optional(),
});

function parseTranslations(json?: string): NewsTranslations {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as NewsTranslations) : {};
  } catch {
    return {};
  }
}

export type NewsFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return canEditSection("news");
}

export async function createNewsAction(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = newsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const input: NewsInput = {
    slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title),
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    cover_image_url: parsed.data.cover_image_url,
    published: parsed.data.published === "on",
    translations: parseTranslations(parsed.data.translations_json),
  };

  const id = await createNews(input);
  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect(`/admin/news/${id}/edit?created=1`);
}

export async function updateNewsAction(id: number, _prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = newsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const input: NewsInput = {
    slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title),
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    cover_image_url: parsed.data.cover_image_url,
    published: parsed.data.published === "on",
    translations: parseTranslations(parsed.data.translations_json),
  };

  await updateNews(id, input);
  revalidatePath("/admin/news");
  revalidatePath("/news");
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteNewsAction(id: number, label: string) {
  if (!(await requireAdmin())) return;
  const result = await deleteWithApproval("news", id, label, () => deleteNews(id));
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/admin/deletion-requests");
  return result;
}
