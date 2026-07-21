import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TourProposalForm from "@/components/admin/TourProposalForm";
import { createTourProposalAction } from "@/lib/actions/tourProposals";
import { getTourById } from "@/lib/queries/tours";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";
import type { TourProposal } from "@/lib/types";

export default async function NewTourProposalPage({ searchParams }: { searchParams: Promise<{ fromTour?: string }> }) {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "tour_proposals")) return <PermissionLocked sectionLabel="ใบเสนอราคาลูกค้า" />;

  const { fromTour } = await searchParams;
  let initial: Partial<TourProposal> | undefined;

  if (fromTour) {
    const tour = await getTourById(Number(fromTour));
    if (tour) {
      initial = {
        based_on_tour_id: tour.id,
        title: tour.title,
        cover_image_url: tour.cover_image_url || "",
        summary: tour.summary,
        duration_days: tour.duration_days,
        price_amount: tour.price,
        currency: tour.currency,
        group_size: "",
        includes: tour.includes,
        excludes: tour.excludes,
        highlights: tour.highlights,
        hotel_list: tour.hotel_list,
        agent_name: tour.agent_name || "",
        agent_role: tour.agent_role || "",
        agent_photo_url: tour.agent_photo_url || "",
        itinerary: tour.itinerary.map((d) => ({
          day: d.day,
          date: "",
          title: d.title,
          description: d.description,
          breakfast: d.breakfast,
          lunch: d.lunch,
          dinner: d.dinner,
          accommodation: d.accommodation,
          photos: d.photos || [],
        })),
      };
    }
  }

  return (
    <div>
      <Link href="/admin/tour-proposals" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายการใบเสนอราคา
      </Link>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">สร้างใบเสนอราคาลูกค้า</h1>
      {initial ? (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          เริ่มจากทัวร์ &quot;{initial.title}&quot; — ปรับแก้ชื่อลูกค้า วันเดินทาง หรือรายละเอียดแต่ละวันได้อิสระ ไม่กระทบทัวร์ต้นฉบับ
        </p>
      ) : (
        <p className="mt-1 text-sm text-[var(--color-muted)]">สร้างโปรแกรมทัวร์เฉพาะบุคคลตั้งแต่ต้น</p>
      )}
      <div className="mt-8">
        <TourProposalForm action={createTourProposalAction} proposal={initial} submitLabel="สร้างใบเสนอราคา" />
      </div>
    </div>
  );
}
