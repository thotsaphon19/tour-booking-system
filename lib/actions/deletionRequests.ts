"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { getDeletionRequestById, resolveDeletionRequest } from "@/lib/queries/deletionRequests";
import { deleteTour } from "@/lib/queries/tours";
import { deleteNews } from "@/lib/queries/news";
import { deleteReview } from "@/lib/queries/reviews";
import { deleteCustomer } from "@/lib/queries/bookings";
import { deleteTripRequest } from "@/lib/queries/tripRequests";
import { deletePartnerEmbed } from "@/lib/queries/partnerEmbeds";
import { deleteTourProposal } from "@/lib/queries/tourProposals";

const DELETE_EXECUTORS: Record<string, (id: number) => Promise<void>> = {
  tours: deleteTour,
  news: deleteNews,
  reviews: deleteReview,
  customers: deleteCustomer,
  trip_requests: deleteTripRequest,
  partner_embeds: deletePartnerEmbed,
  tour_proposals: deleteTourProposal,
};

async function requireSuperAdmin() {
  const admin = await getCurrentAdmin();
  if (!isSuperAdmin(admin)) redirect("/admin");
  return admin!;
}

export async function approveDeletionRequestAction(id: number) {
  const admin = await requireSuperAdmin();
  const req = await getDeletionRequestById(id);
  if (!req || req.status !== "pending") return;

  const executor = DELETE_EXECUTORS[req.entity_type];
  if (executor) {
    try {
      await executor(req.entity_id);
    } catch {
      // Row may already be gone (e.g. deleted another way since the
      // request was filed) — still mark the request resolved either way.
    }
  }

  await resolveDeletionRequest(id, "approved", admin.id);
  revalidatePath("/admin/deletion-requests");
  revalidatePath(`/admin/${req.entity_type.replace(/_/g, "-")}`);
}

export async function rejectDeletionRequestAction(id: number) {
  const admin = await requireSuperAdmin();
  await resolveDeletionRequest(id, "rejected", admin.id);
  revalidatePath("/admin/deletion-requests");
}
