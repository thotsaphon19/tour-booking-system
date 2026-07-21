import { notFound } from "next/navigation";
import { getReviewById } from "@/lib/queries/reviews";
import { updateReviewAction } from "@/lib/actions/reviews";
import ReviewForm from "@/components/admin/ReviewForm";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await getReviewById(Number(id));
  if (!review) notFound();

  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "reviews");
  const boundAction = updateReviewAction.bind(null, review.id);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขรีวิว</h1>
      <div className="mt-8">
        {!canEdit && <ReadOnlyBanner sectionLabel="รีวิวลูกค้า" />}
        <ReviewForm action={boundAction} review={review} submitLabel="บันทึกการเปลี่ยนแปลง" readOnly={!canEdit} />
      </div>
    </div>
  );
}
