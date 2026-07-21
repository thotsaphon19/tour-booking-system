import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import TourProposalForm from "@/components/admin/TourProposalForm";
import { getTourProposalById } from "@/lib/queries/tourProposals";
import { updateTourProposalAction, deleteTourProposalAction } from "@/lib/actions/tourProposals";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function EditTourProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await getTourProposalById(Number(id));
  if (!proposal) notFound();

  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "tour_proposals");
  const action = updateTourProposalAction.bind(null, proposal.id);

  return (
    <div>
      <Link href="/admin/tour-proposals" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปรายการใบเสนอราคา
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แก้ไขใบเสนอราคา</h1>
        {canEdit && (
          <form
            action={async () => {
              "use server";
              await deleteTourProposalAction(proposal.id, `ใบเสนอราคา: ${proposal.client_name} — ${proposal.title}`);
            }}
          >
            <button className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
              <Trash2 size={14} /> ลบใบเสนอราคานี้
            </button>
          </form>
        )}
      </div>
      {!canEdit && <ReadOnlyBanner sectionLabel="ใบเสนอราคาลูกค้า" />}
      <TourProposalForm action={action} proposal={proposal} submitLabel="บันทึกการเปลี่ยนแปลง" readOnly={!canEdit} />
    </div>
  );
}
