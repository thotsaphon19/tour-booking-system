import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TripRequestForm from "@/components/admin/TripRequestForm";
import { createTripRequestAction } from "@/lib/actions/tripRequests";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function NewTripRequestPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "trip_requests")) return <PermissionLocked sectionLabel="ทัวร์ตามสั่ง" />;

  return (
    <div>
      <Link href="/admin/trip-requests" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายการคำขอ
      </Link>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">เพิ่มคำขอทัวร์ตามสั่ง</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">สำหรับบันทึกคำขอที่ลูกค้าติดต่อมาทางโทรศัพท์/อีเมลโดยตรง</p>
      <div className="mt-6">
        <TripRequestForm action={createTripRequestAction} submitLabel="เพิ่มคำขอ" />
      </div>
    </div>
  );
}
