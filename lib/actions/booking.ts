"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTourById } from "@/lib/queries/tours";
import { findOrCreateCustomer, createBooking, getBookingById } from "@/lib/queries/bookings";
import { sendBookingEmails } from "@/lib/email";
import { getSettings, parseNotificationEmails } from "@/lib/queries/settings";

const bookingSchema = z.object({
  tour_id: z.coerce.number().int().positive(),
  request_type: z.enum(["booking", "quote"]).default("booking"),
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().min(6, "กรุณากรอกเบอร์โทรศัพท์"),
  travel_date: z.string().min(1, "กรุณาเลือกวันเดินทาง"),
  num_travelers: z.coerce.number().int().min(1).max(50),
  notes: z.string().optional(),
});

export type BookingFormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  bookingId?: number;
  requestType?: "booking" | "quote";
};

function pricePerPersonFor(tour: Awaited<ReturnType<typeof getTourById>>, travelers: number): number {
  if (!tour) return 0;
  if (tour.price_tiers.length === 0) return tour.price;
  // Pick the tier whose groupSize is the closest match at-or-below the traveler count,
  // falling back to the smallest tier for solo/duo travelers.
  const sorted = [...tour.price_tiers].sort((a, b) => a.groupSize - b.groupSize);
  let match = sorted[0];
  for (const tier of sorted) {
    if (travelers >= tier.groupSize) match = tier;
  }
  return match.pricePerPerson;
}

export async function submitBooking(_prev: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, fieldErrors, message: "กรุณาตรวจสอบข้อมูลในฟอร์ม" };
  }

  const tour = await getTourById(parsed.data.tour_id);
  if (!tour) {
    return { ok: false, message: "ไม่พบทัวร์นี้ในระบบ" };
  }

  const customerId = await findOrCreateCustomer({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
  });

  const pricePerPerson = pricePerPersonFor(tour, parsed.data.num_travelers);
  const totalPrice = pricePerPerson * parsed.data.num_travelers;

  const bookingId = await createBooking({
    tour_id: tour.id,
    customer_id: customerId,
    travel_date: parsed.data.travel_date,
    num_travelers: parsed.data.num_travelers,
    total_price: totalPrice,
    notes: parsed.data.notes,
    request_type: parsed.data.request_type,
  });

  const booking = await getBookingById(bookingId);
  if (booking) {
    await sendBookingEmails({
      booking,
      tour,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      adminEmails: parseNotificationEmails((await getSettings()).notification_emails),
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");

  return {
    ok: true,
    bookingId,
    requestType: parsed.data.request_type,
    message:
      parsed.data.request_type === "quote"
        ? "ส่งคำขอใบเสนอราคาสำเร็จ! ทีมงานจะส่งราคาที่ปรับให้เหมาะกับคุณทางอีเมล"
        : "ส่งคำขอจองสำเร็จ! เราส่งอีเมลยืนยันให้คุณแล้ว",
  };
}
