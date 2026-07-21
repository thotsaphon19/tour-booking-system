import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { createAdminAction } from "@/lib/actions/admins";
import AdminUserForm from "@/components/admin/AdminUserForm";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function NewAdminPage() {
  const current = await getCurrentAdmin();
  if (!isSuperAdmin(current)) {
    return <PermissionLocked sectionLabel="จัดการผู้ดูแลระบบ (Super Admin เท่านั้น)" />;
  }

  return (
    <div>
      <Link href="/admin/admins" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายชื่อผู้ดูแลระบบ
      </Link>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">เพิ่มผู้ดูแลระบบ</h1>
      <div className="mt-6">
        <AdminUserForm action={createAdminAction} submitLabel="เพิ่มผู้ดูแลระบบ" />
      </div>
    </div>
  );
}
