"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/lib/queries/bookings";
import { getSession, canEditSection } from "@/lib/auth";
import type { BookingStatus } from "@/lib/types";

export async function updateBookingStatusAction(id: number, status: BookingStatus) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!(await canEditSection("bookings"))) return;

  await updateBookingStatus(id, status);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}
