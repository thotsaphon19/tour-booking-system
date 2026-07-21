"use server";

import { z } from "zod";
import { createTripRequest } from "@/lib/queries/tripRequests";
import { sendPersonalizeRequestEmails } from "@/lib/email";
import { getSettings, parseNotificationEmails } from "@/lib/queries/settings";

const schema = z.object({
  flight_ack: z.enum(["ok", "no"], { message: "กรุณายืนยันเงื่อนไขเรื่องตั๋วเครื่องบิน" }),
  first_name: z.string().min(1, "กรุณากรอกชื่อจริง"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  nationality: z.string().min(1, "กรุณากรอกประเทศที่คุณมาจาก"),
  whatsapp: z.string().min(1, "กรุณากรอกเบอร์โทร/WhatsApp"),
  trip_length_days: z.coerce.number().int().min(1, "กรุณากรอกจำนวนวัน"),
  arrival_date: z.string().min(1, "กรุณาเลือกวันที่เดินทางมาถึง"),
  departure_date: z.string().min(1, "กรุณาเลือกวันเดินทางกลับ"),
  traveler_count: z.coerce.number().int().min(1, "กรุณากรอกจำนวนผู้เดินทาง"),
  traveler_type: z.string().min(1, "กรุณาเลือกประเภทผู้เดินทาง"),
  guide_preference: z.enum(["private_guide", "no_guide", "car_with_driver"], { message: "กรุณาเลือกตัวเลือกไกด์" }),
  guide_language: z.string().optional(),
  hotel_level: z.string().min(1, "กรุณาเลือกระดับที่พัก"),
  currency: z.string().min(1, "กรุณาเลือกสกุลเงิน"),
  budget_per_person: z.string().min(1, "กรุณากรอกงบประมาณต่อคน"),
  places_of_interest: z.string().optional(),
  tour_slug: z.string().optional(),
});

export type PersonalizeFormState = { ok: boolean; message?: string; fieldErrors?: Record<string, string> };

export async function submitPersonalizeRequest(_prev: PersonalizeFormState, formData: FormData): Promise<PersonalizeFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const data = parsed.data;
  const name = `${data.first_name} ${data.last_name}`.trim();

  const id = await createTripRequest({
    name,
    email: data.email,
    whatsapp: data.whatsapp,
    nationality: data.nationality,
    special_requests: data.places_of_interest,
    tour_slug: data.tour_slug,
    flight_ack: data.flight_ack,
    trip_length_days: data.trip_length_days,
    arrival_date: data.arrival_date,
    departure_date: data.departure_date,
    traveler_count: data.traveler_count,
    traveler_type: data.traveler_type,
    guide_preference: data.guide_preference,
    guide_language: data.guide_language,
    hotel_level: data.hotel_level,
    currency: data.currency,
    budget_per_person: data.budget_per_person,
    places_of_interest: data.places_of_interest,
  });

  await sendPersonalizeRequestEmails({
    requestId: id,
    name,
    email: data.email,
    travelWhen: `${data.arrival_date} - ${data.departure_date} (${data.trip_length_days} วัน)`,
    travelerSummary: `${data.traveler_count} คน (${data.traveler_type})`,
    guideSummary:
      data.guide_preference === "private_guide"
        ? `ต้องการไกด์ส่วนตัว${data.guide_language ? ` (พูด${data.guide_language})` : ""}`
        : data.guide_preference === "car_with_driver"
          ? "ต้องการเฉพาะรถพร้อมคนขับ"
          : "ไม่ต้องการไกด์ส่วนตัว",
    hotelLevel: data.hotel_level,
    budget: `${data.budget_per_person} ${data.currency}/คน`,
    placesOfInterest: data.places_of_interest,
    adminEmails: parseNotificationEmails((await getSettings()).notification_emails),
  });

  return { ok: true, message: "ส่งคำขอสำเร็จ! เราจะตอบกลับพร้อมใบเสนอราคาภายใน 24 ชั่วโมง" };
}
