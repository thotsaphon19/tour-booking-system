import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/queries/news";
import { updateNewsAction } from "@/lib/actions/news";
import NewsForm from "@/components/admin/NewsForm";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getNewsById(Number(id));
  if (!post) notFound();

  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "news");
  const boundAction = updateNewsAction.bind(null, post.id);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขบทความ</h1>
      <div className="mt-8">
        {!canEdit && <ReadOnlyBanner sectionLabel="บทความ" />}
        <NewsForm action={boundAction} post={post} submitLabel="บันทึกการเปลี่ยนแปลง" readOnly={!canEdit} />
      </div>
    </div>
  );
}
