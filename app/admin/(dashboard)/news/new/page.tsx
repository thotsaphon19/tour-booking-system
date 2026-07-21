import NewsForm from "@/components/admin/NewsForm";
import { createNewsAction } from "@/lib/actions/news";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function NewNewsPage() {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin, "news")) return <PermissionLocked sectionLabel="บทความ" />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">เขียนบทความใหม่</h1>
      <div className="mt-8">
        <NewsForm action={createNewsAction} submitLabel="เผยแพร่บทความ" />
      </div>
    </div>
  );
}
