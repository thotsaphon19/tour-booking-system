"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createTourProposal,
  updateTourProposal,
  deleteTourProposal,
  type TourProposalInput,
} from "@/lib/queries/tourProposals";
import { getSession, canEditSection, getCurrentAdmin, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import type { ProposalItineraryDay, HotelListItem } from "@/lib/types";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return canEditSection("tour_proposals");
}

const schema = z.object({
  based_on_tour_id: z.string().optional(),
  client_name: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  client_email: z.string().optional(),
  client_phone: z.string().optional(),
  travel_start_date: z.string().optional(),
  travel_end_date: z.string().optional(),
  title: z.string().min(1, "กรุณากรอกชื่อโปรแกรมทัวร์"),
  cover_image_url: z.string().optional(),
  summary: z.string().optional(),
  duration_days: z.coerce.number().int().min(1),
  itinerary_json: z.string().optional(),
  hotel_list_json: z.string().optional(),
  includes_text: z.string().optional(),
  excludes_text: z.string().optional(),
  highlights_text: z.string().optional(),
  price_amount: z.coerce.number().min(0).default(0),
  currency: z.string().default("THB"),
  group_size: z.string().optional(),
  booking_policy: z.string().optional(),
  payment_policy: z.string().optional(),
  cancellation_policy: z.string().optional(),
  insurance_policy: z.string().optional(),
  visa_policy: z.string().optional(),
  agent_name: z.string().optional(),
  agent_role: z.string().optional(),
  agent_photo_url: z.string().optional(),
  proposal_code: z.string().optional(),
  status: z.string().default("draft"),
});

export type TourProposalFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string>; id?: number };

function linesToArray(text?: string): string[] {
  return (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseJsonArray<T>(json?: string): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function buildInput(data: z.infer<typeof schema>): Promise<TourProposalInput> {
  const admin = await getCurrentAdmin();
  return {
    based_on_tour_id: data.based_on_tour_id ? Number(data.based_on_tour_id) : null,
    client_name: data.client_name,
    client_email: data.client_email || "",
    client_phone: data.client_phone || "",
    travel_start_date: data.travel_start_date || "",
    travel_end_date: data.travel_end_date || "",
    title: data.title,
    cover_image_url: data.cover_image_url || "",
    summary: data.summary || "",
    duration_days: data.duration_days,
    itinerary: parseJsonArray<ProposalItineraryDay>(data.itinerary_json),
    hotel_list: parseJsonArray<HotelListItem>(data.hotel_list_json),
    includes: linesToArray(data.includes_text),
    excludes: linesToArray(data.excludes_text),
    highlights: linesToArray(data.highlights_text),
    price_amount: data.price_amount,
    currency: data.currency,
    group_size: data.group_size || "",
    booking_policy: data.booking_policy || "",
    payment_policy: data.payment_policy || "",
    cancellation_policy: data.cancellation_policy || "",
    insurance_policy: data.insurance_policy || "",
    visa_policy: data.visa_policy || "",
    agent_name: data.agent_name || "",
    agent_role: data.agent_role || "",
    agent_photo_url: data.agent_photo_url || "",
    proposal_code: data.proposal_code || "",
    status: data.status,
    created_by: admin?.id,
  };
}

export async function createTourProposalAction(_prev: TourProposalFormState, formData: FormData): Promise<TourProposalFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const id = await createTourProposal(await buildInput(parsed.data));
  revalidatePath("/admin/tour-proposals");
  redirect(`/admin/tour-proposals/${id}/edit?created=1`);
}

export async function updateTourProposalAction(
  id: number,
  _prev: TourProposalFormState,
  formData: FormData
): Promise<TourProposalFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  await updateTourProposal(id, await buildInput(parsed.data));
  revalidatePath("/admin/tour-proposals");
  revalidatePath(`/admin/tour-proposals/${id}/edit`);
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteTourProposalAction(id: number, label: string) {
  if (!(await requireAdmin())) return;
  const result = await deleteWithApproval("tour_proposals", id, label, () => deleteTourProposal(id));
  revalidatePath("/admin/tour-proposals");
  revalidatePath("/admin/deletion-requests");
  return result;
}
