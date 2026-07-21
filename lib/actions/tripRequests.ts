"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createTripRequest,
  updateTripRequest,
  deleteTripRequest,
  updateTripRequestStatus,
  type TripRequestInput,
} from "@/lib/queries/tripRequests";
import { getSession, canEditSection, deleteWithApproval } from "@/lib/auth";
import { PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return canEditSection("trip_requests");
}

const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  whatsapp: z.string().optional(),
  nationality: z.string().optional(),
  flight_ack: z.string().optional(),
  trip_length_days: z.string().optional(),
  arrival_date: z.string().optional(),
  departure_date: z.string().optional(),
  traveler_count: z.string().optional(),
  traveler_type: z.string().optional(),
  guide_preference: z.string().optional(),
  guide_language: z.string().optional(),
  hotel_level: z.string().optional(),
  currency: z.string().optional(),
  budget_per_person: z.string().optional(),
  places_of_interest: z.string().optional(),
  tour_slug: z.string().optional(),
});

export type TripRequestFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

function buildInput(data: z.infer<typeof schema>): TripRequestInput {
  return {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp || "",
    nationality: data.nationality || "",
    special_requests: data.places_of_interest || "",
    tour_slug: data.tour_slug || "",
    flight_ack: data.flight_ack || "",
    trip_length_days: data.trip_length_days ? Number(data.trip_length_days) : undefined,
    arrival_date: data.arrival_date || "",
    departure_date: data.departure_date || "",
    traveler_count: data.traveler_count ? Number(data.traveler_count) : undefined,
    traveler_type: data.traveler_type || "",
    guide_preference: data.guide_preference || "",
    guide_language: data.guide_language || "",
    hotel_level: data.hotel_level || "",
    currency: data.currency || "",
    budget_per_person: data.budget_per_person || "",
    places_of_interest: data.places_of_interest || "",
  };
}

export async function createTripRequestAction(_prev: TripRequestFormState, formData: FormData): Promise<TripRequestFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  await createTripRequest(buildInput(parsed.data));
  revalidatePath("/admin/trip-requests");
  redirect("/admin/trip-requests?created=1");
}

export async function updateTripRequestAction(id: number, _prev: TripRequestFormState, formData: FormData): Promise<TripRequestFormState> {
  if (!(await requireAdmin())) return { ok: false, message: PERMISSION_DENIED_MESSAGE };
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }
  await updateTripRequest(id, buildInput(parsed.data));
  revalidatePath("/admin/trip-requests");
  return { ok: true, message: "บันทึกการเปลี่ยนแปลงแล้ว" };
}

export async function deleteTripRequestAction(id: number, label: string) {
  if (!(await requireAdmin())) return;
  const result = await deleteWithApproval("trip_requests", id, label, () => deleteTripRequest(id));
  revalidatePath("/admin/trip-requests");
  revalidatePath("/admin/deletion-requests");
  return result;
}

export async function updateTripRequestStatusAction(id: number, status: string) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("trip_requests"))) return;

  await updateTripRequestStatus(id, status);
  revalidatePath("/admin/trip-requests");
}
