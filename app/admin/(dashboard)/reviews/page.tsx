import Link from "next/link";
import { Plus, Pencil, Trash2, Star, Check, X, Mail, MapPin as MapPinIcon } from "lucide-react";
import { listReviewsForAdmin } from "@/lib/queries/reviews";
import { deleteReviewAction, moderateReviewAction } from "@/lib/actions/reviews";
import StatusBadge from "@/components/admin/StatusBadge";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { LockedAddButton, LockedIconButton } from "@/components/admin/LockedControls";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function AdminReviewsPage() {
  const reviews = await listReviewsForAdmin();
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "reviews");

  const pending = reviews.filter((r) => r.status === "pending");
  const others = reviews.filter((r) => r.status !== "pending");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="รีวิวลูกค้า" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">รีวิวลูกค้า</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {reviews.length} รีวิว</p>
        </div>
        {canEdit ? (
          <Link
            href="/admin/reviews/new"
            className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-jade-light)]"
          >
            <Plus size={16} /> เพิ่มรีวิว
          </Link>
        ) : (
          <LockedAddButton label="เพิ่มรีวิว" />
        )}
      </div>

      {pending.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-[var(--color-clay)]">
            รอตรวจสอบ
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-clay)] px-1.5 text-[11px] font-bold text-white">
              {pending.length}
            </span>
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">รีวิวที่ลูกค้าส่งเข้ามาเองจากหน้าเว็บ — ต้องอนุมัติก่อนจะแสดงบนเว็บไซต์จริง</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {pending.map((r) => (
              <div key={r.id} className="rounded-2xl border-2 border-[var(--color-clay)]/40 bg-[var(--color-clay)]/5 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[var(--color-jade-dark)]">{r.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {r.customer_name}
                      {r.customer_country ? ` · ${r.customer_country}` : ""}
                      {r.tour_title ? ` · ${r.tour_title}` : ""}
                    </p>
                    {r.customer_email && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                        <Mail size={11} /> {r.customer_email}
                      </p>
                    )}
                  </div>
                  <div className="flex text-[var(--color-gold)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{r.quote}</p>
                {r.travel_dates && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-muted)]">
                    <MapPinIcon size={11} /> {r.travel_dates}
                  </p>
                )}
                {canEdit && (
                  <div className="mt-4 flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await moderateReviewAction(r.id, "approved");
                      }}
                    >
                      <button className="flex items-center gap-1.5 rounded-full bg-[var(--color-jade)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-jade-light)]">
                        <Check size={13} /> อนุมัติ
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await moderateReviewAction(r.id, "rejected");
                      }}
                    >
                      <button className="flex items-center gap-1.5 rounded-full border border-[var(--color-clay)] px-4 py-1.5 text-xs font-semibold text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                        <X size={13} /> ปฏิเสธ
                      </button>
                    </form>
                    <Link
                      href={`/admin/reviews/${r.id}/edit`}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                    >
                      <Pencil size={13} /> แก้ไขก่อนอนุมัติ
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {pending.length > 0 && <h2 className="mb-3 font-display text-lg font-semibold text-[var(--color-jade-dark)]">รีวิวทั้งหมด</h2>}
        <div className="grid gap-4 sm:grid-cols-2">
          {others.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-jade-dark)]">{r.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {r.customer_name}
                    {r.customer_country ? ` · ${r.customer_country}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {r.status === "rejected" && <StatusBadge status="draft" label="ปฏิเสธแล้ว" />}
                  {r.status === "approved" && <StatusBadge status={r.featured ? "active" : "draft"} label={r.featured ? "แสดงเด่น" : "เผยแพร่"} />}
                </div>
              </div>
              <div className="mt-2 flex text-[var(--color-gold)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill={i < r.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                ))}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--color-ink-soft)]">{r.quote}</p>
              <div className="mt-4 flex gap-2">
                {canEdit ? (
                  <>
                    <Link
                      href={`/admin/reviews/${r.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
                    >
                      <Pencil size={14} />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteReviewAction(r.id, `${r.customer_name} — ${r.title}`);
                      }}
                    >
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <LockedIconButton />
                    <LockedIconButton />
                  </>
                )}
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="col-span-2 py-10 text-center text-[var(--color-muted)]">ยังไม่มีรีวิว กด &quot;เพิ่มรีวิว&quot; เพื่อเริ่มต้น</p>
          )}
        </div>
      </div>
    </div>
  );
}
