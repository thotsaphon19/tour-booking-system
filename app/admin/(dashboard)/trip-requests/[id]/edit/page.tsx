import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import TripRequestForm from "@/components/admin/TripRequestForm";
import { getTripRequestById } from "@/lib/queries/tripRequests";
import { updateTripRequestAction, deleteTripRequestAction } from "@/lib/actions/tripRequests";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function EditTripRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await getTripRequestById(Number(id));
  if (!request) notFound();

  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "trip_requests");
  const action = updateTripRequestAction.bind(null, request.id);

  return (
    <div>
      <Link href="/admin/trip-requests" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายการคำขอ
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขคำขอทัวร์ตามสั่ง</h1>
        {canEdit && (
          <form
            action={async () => {
              "use server";
              await deleteTripRequestAction(request.id, request.name);
            }}
          >
            <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
              <Trash2 size={14} /> ลบคำขอนี้
            </button>
          </form>
        )}
      </div>
      {!canEdit && <ReadOnlyBanner sectionLabel="ทัวร์ตามสั่ง" />}
      <TripRequestForm action={action} request={request} submitLabel="บันทึกการเปลี่ยนแปลง" readOnly={!canEdit} />
    </div>
  );
}
