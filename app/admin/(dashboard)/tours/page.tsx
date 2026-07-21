import Link from "next/link";
import { Plus } from "lucide-react";
import { listTours } from "@/lib/queries/tours";
import { deleteTourAction } from "@/lib/actions/tours";
import ToursTable from "@/components/admin/ToursTable";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LockedAddButton } from "@/components/admin/LockedControls";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function AdminToursPage() {
  const tours = await listTours();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "tours");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="จัดการทัวร์" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">จัดการทัวร์</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {tours.length} ทัวร์</p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/tours/new"
            className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
          >
            <Plus size={16} /> เพิ่มทัวร์ใหม่
          </Link>
        ) : (
          <LockedAddButton label="เพิ่มทัวร์ใหม่" />
        )}
      </div>

      <div className="mt-6">
        <ToursTable tours={tours} canEdit={canEdit} deleteAction={deleteTourAction} />
      </div>
    </div>
  );
}
