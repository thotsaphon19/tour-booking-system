import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getConversationById, listMessages } from "@/lib/queries/whatsappChat";
import { formatDate } from "@/lib/format";
import WhatsAppReplyForm from "@/components/admin/WhatsAppReplyForm";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import PermissionLocked from "@/components/admin/PermissionLocked";

export default async function AdminWhatsAppThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversationById(Number(id));
  if (!conversation) notFound();

  const messages = await listMessages(conversation.id);
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "whatsapp");

  return (
    <div>
      <Link href="/admin/whatsapp" className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-jade)]">
        <ArrowLeft size={15} /> กลับไปกล่องข้อความ
      </Link>
      <h1 className="font-display text-2xl font-semibold text-[var(--color-jade-dark)]">
        {conversation.visitor_name || "ไม่ระบุชื่อ"} <span className="text-base font-normal text-[var(--color-muted)]">+{conversation.visitor_phone}</span>
      </h1>

      <div className="mt-6 flex h-[55vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        {messages.length === 0 && <p className="text-sm text-[var(--color-muted)]">ยังไม่มีข้อความในบทสนทนานี้</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                m.direction === "outbound"
                  ? "bg-[var(--color-jade)] text-white"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-ink-soft)]"
              }`}
            >
              <p>{m.body}</p>
              <p className={`mt-1 text-[10px] ${m.direction === "outbound" ? "text-white/70" : "text-[var(--color-muted)]"}`}>
                {formatDate(m.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {canEdit ? <WhatsAppReplyForm conversationId={conversation.id} /> : <PermissionLocked sectionLabel="แชท WhatsApp" />}
      </div>
    </div>
  );
}
