import TourForm from "@/components/admin/TourForm";
import { createTourAction } from "@/lib/actions/tours";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function NewTourPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "tours")) return <PermissionLocked sectionLabel="จัดการทัวร์" />;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">เพิ่มทัวร์ใหม่</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">กรอกรายละเอียดทัวร์เพื่อเผยแพร่บนหน้าเว็บไซต์</p>
      <div className="mt-8">
        <TourForm action={createTourAction} submitLabel="สร้างทัวร์" />
      </div>
    </div>
  );
}
