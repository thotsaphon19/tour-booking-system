import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomerForm from "@/components/admin/CustomerForm";
import { createCustomerAction } from "@/lib/actions/customers";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function NewCustomerPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "customers")) return <PermissionLocked sectionLabel="ลูกค้า" />;

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายชื่อลูกค้า
      </Link>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">เพิ่มลูกค้า</h1>
      <div className="mt-6">
        <CustomerForm action={createCustomerAction} submitLabel="เพิ่มลูกค้า" />
      </div>
    </div>
  );
}
