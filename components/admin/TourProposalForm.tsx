"use client";

import { useActionState } from "react";
import {
  Loader2,
  UserRound,
  Mail,
  Phone,
  Hash,
  CalendarDays,
  FileText,
  Tag,
  Images,
  PenLine,
  Users,
  Coins,
  Route,
  BedDouble,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CreditCard,
  Ban,
  Plane,
  Briefcase,
  ToggleLeft,
} from "lucide-react";
import type { TourProposal } from "@/lib/types";
import type { TourProposalFormState } from "@/lib/actions/tourProposals";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ProposalItineraryEditor from "@/components/admin/ProposalItineraryEditor";
import HotelListEditor from "@/components/admin/HotelListEditor";
import PdfDownloadButton from "@/components/admin/PdfDownloadButton";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";
import { CURRENCIES } from "@/lib/currency";

const initialState: TourProposalFormState = { ok: false };

export default function TourProposalForm({
  action,
  proposal,
  submitLabel = "บันทึก",
  readOnly = false,
}: {
  action: (prev: TourProposalFormState, formData: FormData) => Promise<TourProposalFormState>;
  proposal?: Partial<TourProposal>;
  submitLabel?: string;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <fieldset disabled={readOnly} className="contents">
      {state.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"
          }`}
        >
          {state.message}
        </p>
      )}

      {proposal?.based_on_tour_id && (
        <input type="hidden" name="based_on_tour_id" value={proposal.based_on_tour_id} />
      )}

      <AdminSection
        title="ข้อมูลลูกค้า"
        icon={UserRound}
        action={
          proposal?.id ? <PdfDownloadButton href={`/api/admin/tour-proposals/${proposal.id}/pdf`} label="ดาวน์โหลด PDF" /> : undefined
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="ชื่อลูกค้า" icon={UserRound} error={state.fieldErrors?.client_name}>
            <input name="client_name" defaultValue={proposal?.client_name} required className="input" />
          </AdminField>
          <AdminField label="อีเมลลูกค้า" icon={Mail}>
            <input name="client_email" type="email" defaultValue={proposal?.client_email || ""} className="input" />
          </AdminField>
          <AdminField label="เบอร์โทร/WhatsApp ลูกค้า" icon={Phone}>
            <input name="client_phone" defaultValue={proposal?.client_phone || ""} className="input" />
          </AdminField>
          <AdminField label="รหัสใบเสนอราคา (ถ้ามี)" icon={Hash}>
            <input name="proposal_code" defaultValue={proposal?.proposal_code || ""} className="input" placeholder="เช่น NT-2026-014" />
          </AdminField>
          <AdminField label="วันที่เดินทาง (เริ่ม)" icon={CalendarDays}>
            <input name="travel_start_date" type="date" defaultValue={proposal?.travel_start_date || ""} className="input" />
          </AdminField>
          <AdminField label="วันที่เดินทาง (สิ้นสุด)" icon={CalendarDays}>
            <input name="travel_end_date" type="date" defaultValue={proposal?.travel_end_date || ""} className="input" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="ข้อมูลโปรแกรมทัวร์" icon={FileText}>
        <div className="space-y-3">
          <AdminField label="ชื่อโปรแกรมทัวร์" icon={Tag} error={state.fieldErrors?.title}>
            <input name="title" defaultValue={proposal?.title} required className="input" placeholder="เช่น หลวงพระบาง สโลว์ไลฟ์ 3 วัน 2 คืน" />
          </AdminField>
          <AdminField label="รูปภาพหน้าปก" icon={Images}>
            <ImageUploadField name="cover_image_url" label="" defaultValue={proposal?.cover_image_url || ""} full />
          </AdminField>
          <AdminField label="คำโปรยสั้นๆ" icon={PenLine}>
            <textarea name="summary" rows={2} defaultValue={proposal?.summary || ""} className="input resize-none" />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminField label="จำนวนวัน" icon={CalendarDays} error={state.fieldErrors?.duration_days}>
              <input name="duration_days" type="number" min={1} defaultValue={proposal?.duration_days || 3} required className="input" />
            </AdminField>
            <AdminField label="ขนาดกลุ่ม" icon={Users}>
              <input name="group_size" defaultValue={proposal?.group_size || ""} className="input" placeholder="เช่น 2 ท่าน" />
            </AdminField>
            <AdminField label="สกุลเงิน" icon={Coins}>
              <select name="currency" defaultValue={proposal?.currency || "THB"} className="input">
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </AdminField>
          </div>
          <AdminField label="ราคารวมทั้งโปรแกรม" icon={Coins}>
            <input name="price_amount" type="number" min={0} step="0.01" defaultValue={proposal?.price_amount || ""} className="input" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="กำหนดการเดินทาง" icon={Route} description="ปรับแต่ละวันได้ตามวันที่สถานที่เปิด-ปิดจริง">
        <ProposalItineraryEditor initialDays={proposal?.itinerary || []} />
      </AdminSection>

      <AdminSection title="ที่พัก" icon={BedDouble}>
        <HotelListEditor initialItems={proposal?.hotel_list || []} />
      </AdminSection>

      <AdminSection title="ราคารวม/ไม่รวม และจุดเด่น" icon={Sparkles}>
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminField label="จุดเด่น (บรรทัดละ 1 ข้อ)" icon={Sparkles}>
            <textarea name="highlights_text" rows={4} defaultValue={proposal?.highlights?.join("\n")} className="input resize-none" />
          </AdminField>
          <AdminField label="ราคารวม (บรรทัดละ 1 ข้อ)" icon={CheckCircle2}>
            <textarea name="includes_text" rows={4} defaultValue={proposal?.includes?.join("\n")} className="input resize-none" />
          </AdminField>
          <AdminField label="ราคาไม่รวม (บรรทัดละ 1 ข้อ)" icon={XCircle}>
            <textarea name="excludes_text" rows={4} defaultValue={proposal?.excludes?.join("\n")} className="input resize-none" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="นโยบายและเงื่อนไข" icon={ShieldCheck} description="แสดงในเอกสาร PDF ท้ายใบเสนอราคา ปล่อยว่างช่องไหนได้ถ้าไม่เกี่ยวข้อง">
        <div className="space-y-3">
          <AdminField label="นโยบายการจอง" icon={ShieldCheck}>
            <textarea name="booking_policy" rows={2} defaultValue={proposal?.booking_policy || ""} className="input resize-none" />
          </AdminField>
          <AdminField label="นโยบายการชำระเงิน" icon={CreditCard}>
            <textarea name="payment_policy" rows={2} defaultValue={proposal?.payment_policy || ""} className="input resize-none" />
          </AdminField>
          <AdminField label="นโยบายการยกเลิก" icon={Ban}>
            <textarea name="cancellation_policy" rows={2} defaultValue={proposal?.cancellation_policy || ""} className="input resize-none" />
          </AdminField>
          <AdminField label="เงื่อนไขประกันภัยและประกันชีวิต" icon={ShieldCheck}>
            <textarea name="insurance_policy" rows={2} defaultValue={proposal?.insurance_policy || ""} className="input resize-none" />
          </AdminField>
          <AdminField label="นโยบายวีซ่า" icon={Plane}>
            <textarea name="visa_policy" rows={2} defaultValue={proposal?.visa_policy || ""} className="input resize-none" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="ผู้ดูแลลูกค้า" icon={UserRound}>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="รูปโปรไฟล์" icon={Images}>
            <ImageUploadField name="agent_photo_url" label="" defaultValue={proposal?.agent_photo_url || ""} />
          </AdminField>
          <AdminField label="ชื่อผู้ดูแล" icon={UserRound}>
            <input name="agent_name" defaultValue={proposal?.agent_name || ""} className="input" />
          </AdminField>
          <AdminField label="ตำแหน่ง" icon={Briefcase}>
            <input name="agent_role" defaultValue={proposal?.agent_role || ""} className="input" />
          </AdminField>
          <AdminField label="สถานะเอกสาร" icon={ToggleLeft}>
            <select name="status" defaultValue={proposal?.status || "draft"} className="input">
              <option value="draft">ฉบับร่าง</option>
              <option value="sent">ส่งให้ลูกค้าแล้ว</option>
            </select>
          </AdminField>
        </div>
      </AdminSection>

      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "กำลังบันทึก..." : submitLabel}
        </button>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}
