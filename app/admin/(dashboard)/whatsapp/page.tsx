import Link from "next/link";
import { listConversations } from "@/lib/queries/whatsappChat";
import { getSettings } from "@/lib/queries/settings";
import { isWhatsAppApiConfigured } from "@/lib/whatsapp";
import { formatDate } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import ReadOnlyBanner from "@/components/admin/ReadOnlyBanner";

export default async function AdminWhatsAppPage() {
  const [conversations, settings] = await Promise.all([listConversations(), getSettings()]);
  const configured = isWhatsAppApiConfigured(settings);
  const admin = await getCurrentAdmin();
  const canEdit = hasPermission(admin, "whatsapp");

  return (
    <div>
      {!canEdit && <ReadOnlyBanner sectionLabel="แชท WhatsApp" />}
      <h1 className="font-display text-3xl font-semibold text-[var(--color-jade-dark)]">แชท WhatsApp</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">ทั้งหมด {conversations.length} บทสนทนา</p>

      {!configured && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--color-clay)]/30 bg-[var(--color-clay)]/5 p-4">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-[var(--color-clay)]" />
          <p className="text-sm text-[var(--color-ink-soft)]">
            ยังไม่ได้ตั้งค่า WhatsApp Business API — ระบบจะยังรับข้อความเข้าและแสดงในกล่องนี้ได้ (ถ้าตั้งค่า Webhook ไว้แล้ว)
            แต่จะ<strong>ตอบกลับจากหน้านี้ไม่ได้</strong>จนกว่าจะกรอก Phone Number ID และ Access Token ใน{" "}
            <Link href="/admin/settings" className="underline">
              หน้าตั้งค่า
            </Link>
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-5 py-3">ผู้ติดต่อ</th>
              <th className="px-5 py-3">เบอร์ WhatsApp</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3">อัปเดตล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-jade)]/5">
                <td className="px-5 py-3">
                  <Link href={`/admin/whatsapp/${c.id}`} className="font-medium text-[var(--color-jade-dark)] hover:underline">
                    {c.visitor_name || "ไม่ระบุชื่อ"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">+{c.visitor_phone}</td>
                <td className="px-5 py-3 text-[var(--color-ink-soft)]">{c.status === "open" ? "เปิดอยู่" : "ปิดแล้ว"}</td>
                <td className="px-5 py-3 text-[var(--color-muted)]">{formatDate(c.updated_at)}</td>
              </tr>
            ))}
            {conversations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[var(--color-muted)]">
                  ยังไม่มีบทสนทนา WhatsApp เข้ามา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
