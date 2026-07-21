import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentAdmin, getAdminById } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { updateAdminAction } from "@/lib/actions/admins";
import AdminUserForm from "@/components/admin/AdminUserForm";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentAdmin();
  if (!isSuperAdmin(current)) {
    return <PermissionLocked sectionLabel="จัดการผู้ดูแลระบบ (Super Admin เท่านั้น)" />;
  }

  const { id } = await params;
  const admin = await getAdminById(Number(id));
  if (!admin) notFound();

  const action = updateAdminAction.bind(null, admin.id);

  return (
    <div>
      <Link href="/admin/admins" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายชื่อผู้ดูแลระบบ
      </Link>
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขผู้ดูแลระบบ</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{admin.name}</p>
      <div className="mt-6">
        <AdminUserForm action={action} admin={admin} submitLabel="บันทึกการเปลี่ยนแปลง" isEditingSelf={current!.id === admin.id} />
      </div>
    </div>
  );
}
