import { notFound } from "next/navigation";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { getTourById } from "@/lib/queries/tours";
import { updateTourAction } from "@/lib/actions/tours";
import TourForm from "@/components/admin/TourForm";
import PdfDownloadButton from "@/components/admin/PdfDownloadButton";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourById(Number(id));
  if (!tour) notFound();

  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "tours");
  const boundAction = updateTourAction.bind(null, tour.id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขทัวร์</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{tour.title}</p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          {canEdit && (
            <Link
              href={`/admin/tour-proposals/new?fromTour=${tour.id}`}
              className="flex items-center gap-1.5 rounded-full bg-[var(--color-gold)] px-4 py-2 text-xs font-semibold text-[var(--color-jade-dark)] transition hover:bg-[var(--color-gold-light)]"
            >
              <FilePlus2 size={14} /> สร้างใบเสนอราคาลูกค้าจากทัวร์นี้
            </Link>
          )}
          <PdfDownloadButton href={`/api/admin/tours/${tour.id}/pdf`} label="ดาวน์โหลด PDF" />
        </div>
      </div>
      <div className="mt-8">
        {!canEdit && <ReadOnlyBanner sectionLabel="จัดการทัวร์" />}
        {canEdit && (
          <p className="mb-4 text-xs text-[var(--color-muted)]">
            PDF จะสร้างจากข้อมูล/รูปภาพล่าสุดที่บันทึกไว้ — ถ้าเพิ่งแก้ไขข้อมูล กดบันทึกทัวร์ก่อน แล้วค่อยดาวน์โหลด PDF เพื่อให้ได้ข้อมูลล่าสุด
            ต้องการใส่ชื่อลูกค้า วันเดินทางจริง หรือปรับกำหนดการเป็นรายบุคคล ให้ใช้ปุ่ม &quot;สร้างใบเสนอราคาลูกค้า&quot; แทน (ไม่กระทบข้อมูลทัวร์ต้นฉบับ)
          </p>
        )}
        <TourForm action={boundAction} tour={tour} submitLabel="บันทึกการเปลี่ยนแปลง" readOnly={!canEdit} />
      </div>
    </div>
  );
}

