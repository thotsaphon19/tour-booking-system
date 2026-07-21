"use client";

import { useActionState } from "react";
import {
  Loader2,
  UserRound,
  Mail,
  Phone,
  Globe,
  CalendarDays,
  Users,
  Tag,
  BedDouble,
  Compass,
  Languages,
  Plane,
  Coins,
  PenLine,
  Link2,
} from "lucide-react";
import type { TripRequest } from "@/lib/queries/tripRequests";
import type { TripRequestFormState } from "@/lib/actions/tripRequests";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";
import { CURRENCIES } from "@/lib/currency";

const initialState: TripRequestFormState = { ok: false };

export default function TripRequestForm({
  action,
  request,
  submitLabel = "บันทึก",
  readOnly = false,
}: {
  action: (prev: TripRequestFormState, formData: FormData) => Promise<TripRequestFormState>;
  request?: TripRequest;
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

      <AdminSection title="ข้อมูลติดต่อ" icon={UserRound}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="ชื่อ-นามสกุล" icon={UserRound} error={state.fieldErrors?.name}>
          <input name="name" defaultValue={request?.name} required className="input" />
        </AdminField>
        <AdminField label="อีเมล" icon={Mail} error={state.fieldErrors?.email}>
          <input name="email" type="email" defaultValue={request?.email} required className="input" />
        </AdminField>
        <AdminField label="เบอร์/WhatsApp" icon={Phone}>
          <input name="whatsapp" defaultValue={request?.whatsapp || ""} className="input" />
        </AdminField>
        <AdminField label="ประเทศที่มาจาก" icon={Globe}>
          <input name="nationality" defaultValue={request?.nationality || ""} className="input" />
        </AdminField>
      </div>
      </AdminSection>

      <AdminSection title="รายละเอียดการเดินทาง" icon={CalendarDays}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="วันที่มาถึง" icon={CalendarDays}>
          <input name="arrival_date" type="date" defaultValue={request?.arrival_date || ""} className="input" />
        </AdminField>
        <AdminField label="วันเดินทางกลับ" icon={CalendarDays}>
          <input name="departure_date" type="date" defaultValue={request?.departure_date || ""} className="input" />
        </AdminField>
        <AdminField label="จำนวนวัน" icon={CalendarDays}>
          <input name="trip_length_days" type="number" min={1} defaultValue={request?.trip_length_days ?? ""} className="input" />
        </AdminField>
        <AdminField label="จำนวนผู้เดินทาง" icon={Users}>
          <input name="traveler_count" type="number" min={1} defaultValue={request?.traveler_count ?? ""} className="input" />
        </AdminField>
        <AdminField label="ประเภทผู้เดินทาง" icon={Tag}>
          <input name="traveler_type" defaultValue={request?.traveler_type || ""} className="input" placeholder="เช่น ครอบครัว" />
        </AdminField>
        <AdminField label="ระดับที่พัก" icon={BedDouble}>
          <input name="hotel_level" defaultValue={request?.hotel_level || ""} className="input" placeholder="เช่น โรงแรม 4 ดาว" />
        </AdminField>
      </div>
      </AdminSection>

      <AdminSection title="ความต้องการไกด์และเที่ยวบิน" icon={Compass}>
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminField label="ตัวเลือกไกด์" icon={Compass}>
          <select name="guide_preference" defaultValue={request?.guide_preference || ""} className="input">
            <option value="">— ไม่ระบุ —</option>
            <option value="private_guide">ต้องการไกด์ส่วนตัว</option>
            <option value="no_guide">ไม่ต้องการไกด์</option>
            <option value="car_with_driver">รถพร้อมคนขับเท่านั้น</option>
          </select>
        </AdminField>
        <AdminField label="ภาษาไกด์ (ถ้าต้องการ)" icon={Languages}>
          <input name="guide_language" defaultValue={request?.guide_language || ""} className="input" />
        </AdminField>
        <AdminField label="สถานะการยืนยันตั๋วเครื่องบิน" icon={Plane}>
          <select name="flight_ack" defaultValue={request?.flight_ack || ""} className="input">
            <option value="">— ไม่ระบุ —</option>
            <option value="ok">รับทราบ (ไม่รวมตั๋ว)</option>
            <option value="no">ต้องการให้ช่วยเรื่องตั๋วด้วย</option>
          </select>
        </AdminField>
      </div>
      </AdminSection>

      <AdminSection title="งบประมาณ" icon={Coins}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="สกุลเงินงบประมาณ" icon={Coins}>
          <select name="currency" defaultValue={request?.currency || ""} className="input">
            <option value="">— ไม่ระบุ —</option>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="งบประมาณต่อคน" icon={Coins}>
          <input name="budget_per_person" defaultValue={request?.budget_per_person || ""} className="input" />
        </AdminField>
      </div>
      </AdminSection>

      <AdminSection title="ความต้องการเพิ่มเติม" icon={PenLine}>
      <div className="space-y-3">
      <AdminField label="สถานที่/กิจกรรมที่สนใจ / ความต้องการพิเศษ" icon={PenLine}>
        <textarea name="places_of_interest" rows={3} defaultValue={request?.places_of_interest || ""} className="input resize-none" />
      </AdminField>

      <AdminField label="Slug ทัวร์ที่เกี่ยวข้อง (ถ้ามี)" icon={Link2}>
        <input name="tour_slug" defaultValue={request?.tour_slug || ""} className="input" />
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
