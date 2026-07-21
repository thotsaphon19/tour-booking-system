import ReviewForm from "@/components/admin/ReviewForm";
import { createReviewAction } from "@/lib/actions/reviews";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function NewReviewPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "reviews")) return <PermissionLocked sectionLabel="รีวิวลูกค้า" />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">เพิ่มรีวิวลูกค้า</h1>
      <div className="mt-8">
        <ReviewForm action={createReviewAction} submitLabel="เพิ่มรีวิว" />
      </div>
    </div>
  );
}
