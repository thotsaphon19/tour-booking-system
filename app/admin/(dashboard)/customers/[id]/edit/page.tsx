import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import CustomerForm from "@/components/admin/CustomerForm";
import { getCustomerById } from "@/lib/queries/bookings";
import { updateCustomerAction, deleteCustomerAction } from "@/lib/actions/customers";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(Number(id));
  if (!customer) notFound();

  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "customers");
  const action = updateCustomerAction.bind(null, customer.id);

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายชื่อลูกค้า
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขข้อมูลลูกค้า</h1>
        {canEdit && (
          <form
            action={async () => {
              "use server";
              await deleteCustomerAction(customer.id, customer.name);
            }}
          >
            <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
              <Trash2 size={14} /> ลบลูกค้านี้
            </button>
          </form>
        )}
      </div>
      {!canEdit && <ReadOnlyBanner sectionLabel="ลูกค้า" />}
      {canEdit && (
        <p className="mb-4 text-xs text-[var(--color-clay)]">
          คำเตือน: ลบลูกค้าแล้วจะลบประวัติการจองทั้งหมดของลูกค้ารายนี้ไปด้วย ลบไม่ได้ถ้าไม่ต้องการให้ประวัติการจองหาย
        </p>
      )}
      <CustomerForm action={action} customer={customer} submitLabel="บันทึกการเปลี่ยนแปลง" readOnly={!canEdit} />
    </div>
  );
}
