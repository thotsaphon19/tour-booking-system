"use client";

import { useActionState, useRef } from "react";
import {
  Loader2,
  Info,
  Tag,
  Link2,
  ToggleLeft,
  Tags,
  MapPin,
  CalendarDays,
  Users,
  Coins,
  Gauge,
  Smile,
  Hash,
  Video,
  Map,
  Images,
  Image as ImageIcon,
  Star,
  MessageSquare,
  Globe,
  FileText,
  PenLine,
  Sparkles,
  CheckCircle2,
  XCircle,
  BedDouble,
  UserRound,
  Briefcase,
  Languages,
  ListChecks,
} from "lucide-react";
import type { Tour } from "@/lib/types";
import type { TourFormState } from "@/lib/actions/tours";
import ItineraryEditor from "@/components/admin/ItineraryEditor";
import PriceTiersEditor from "@/components/admin/PriceTiersEditor";
import HotelListEditor from "@/components/admin/HotelListEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import MapEmbedField from "@/components/admin/MapEmbedField";
import TourTranslationsEditor from "@/components/admin/TourTranslationsEditor";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";
import { TOUR_TAGS } from "@/lib/types";
import { THAI_PROVINCES } from "@/lib/thaiProvinces";

const initialState: TourFormState = { ok: false };

export default function TourForm({
  action,
  tour,
  submitLabel = "บันทึกทัวร์",
  readOnly = false,
}: {
  action: (prev: TourFormState, formData: FormData) => Promise<TourFormState>;
  tour?: Tour;
  submitLabel?: string;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
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

      <AdminSection title="ข้อมูลพื้นฐาน" icon={Info}>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="ชื่อทัวร์" icon={Tag} error={state.fieldErrors?.title} full>
            <input name="title" defaultValue={tour?.title} required className="input" />
          </AdminField>
          <AdminField label="Slug" icon={Link2} hint="ปล่อยว่างให้สร้างอัตโนมัติจากชื่อทัวร์" error={state.fieldErrors?.slug}>
            <input name="slug" defaultValue={tour?.slug} className="input" placeholder="เช่น chiang-mai-trek" />
          </AdminField>
          <AdminField label="สถานะ" icon={ToggleLeft}>
            <select name="status" defaultValue={tour?.status || "active"} className="input">
              <option value="active">เผยแพร่ (active)</option>
              <option value="draft">แบบร่าง (draft)</option>
            </select>
          </AdminField>
          <AdminField label="หมวดหมู่" icon={Tags} error={state.fieldErrors?.category}>
            <input name="category" defaultValue={tour?.category} required className="input" placeholder="เช่น เทรคกิ้ง & ธรรมชาติ" />
          </AdminField>
          <AdminField label="จังหวัด" icon={MapPin} error={state.fieldErrors?.province}>
            <select name="province" defaultValue={tour?.province || ""} required className="input">
              <option value="" disabled>เลือกจังหวัด</option>
              {THAI_PROVINCES.map((p) => (
                <option key={p.th} value={p.th}>{p.th}</option>
              ))}
              {tour?.province && !THAI_PROVINCES.some((p) => p.th === tour.province) && (
                <option value={tour.province}>{tour.province} (ค่าเดิม ไม่อยู่ในรายชื่อจังหวัด)</option>
              )}
            </select>
          </AdminField>
          <AdminField
            label="จำนวนวัน"
            icon={CalendarDays}
            hint='ตัวเลขนี้คือ "X วัน Y คืน" ที่โชว์บนการ์ดทัวร์ — ควรตรงกับจำนวนวันในหัวข้อ "กำหนดการเดินทาง" ด้านล่าง'
            error={state.fieldErrors?.duration_days}
          >
            <input name="duration_days" type="number" min={1} defaultValue={tour?.duration_days || 3} required className="input" />
          </AdminField>
          <AdminField label="ขนาดกลุ่มสูงสุด" icon={Users}>
            <input name="max_group_size" type="number" min={1} defaultValue={tour?.max_group_size || 12} className="input" />
          </AdminField>
          <AdminField label="ราคาเริ่มต้น (บาท)" icon={Coins} error={state.fieldErrors?.price}>
            <input name="price" type="number" min={0} defaultValue={tour?.price || 0} required className="input" />
          </AdminField>
          <AdminField label="สกุลเงิน" icon={Coins}>
            <input name="currency" defaultValue={tour?.currency || "THB"} className="input" />
          </AdminField>
          <AdminField label="ระดับความยาก (ข้อความ)" icon={Gauge}>
            <input name="difficulty" defaultValue={tour?.difficulty || "ง่าย"} className="input" />
          </AdminField>
          <AdminField label="ความยาก (1-5)" icon={Gauge}>
            <input name="difficulty_rating" type="number" min={1} max={5} defaultValue={tour?.difficulty_rating ?? 2} className="input" />
          </AdminField>
          <AdminField label="ความสบาย (1-5)" icon={Smile}>
            <input name="comfort_rating" type="number" min={1} max={5} defaultValue={tour?.comfort_rating ?? 4} className="input" />
          </AdminField>
          <AdminField label="รหัสทัวร์" icon={Hash} hint="เช่น VNM14">
            <input name="tour_code" defaultValue={tour?.tour_code || ""} className="input" />
          </AdminField>
          <AdminField label="วิดีโอ YouTube (URL)" icon={Video}>
            <input name="video_url" defaultValue={tour?.video_url || ""} className="input" placeholder="https://youtube.com/..." />
          </AdminField>
          <AdminField label="แผนที่เส้นทาง (Google Maps)" icon={Map} full>
            <MapEmbedField defaultValue={tour?.map_embed_url || ""} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection
        title="รูปภาพทัวร์"
        icon={Images}
        description="รูปหน้าปกคือรูปแรกที่เห็นตอนเปิดหน้าทัวร์ ส่วนรูปเพิ่มเติมจะแสดงเป็นสไลด์ให้เลื่อนดูได้ในหน้าเดียวกัน"
      >
        <div className="space-y-4">
          <AdminField label="รูปภาพหน้าปก" icon={ImageIcon}>
            <ImageUploadField name="cover_image_url" label="" defaultValue={tour?.cover_image_url || ""} full />
          </AdminField>
          <AdminField label="รูปภาพเพิ่มเติม (แสดงเป็นสไลด์ต่อจากรูปหน้าปก)" icon={Images}>
            <MultiImageUploadField name="gallery_text" label="" defaultValue={(tour?.gallery || []).join("\n")} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection
        title="วันออกเดินทางแบบกรุ๊ป"
        icon={CalendarDays}
        description={
          'ถ้าทัวร์นี้เป็นทัวร์กรุ๊ปที่มีวันออกเดินทางตายตัว (ไม่ใช่จองวันไหนก็ได้) ใส่วันที่ไว้ที่นี่ ทัวร์จะขึ้นในตัวกรอง "แสดงเฉพาะทัวร์ที่มีวันออกเดินทาง" หน้าเว็บให้อัตโนมัติ — ถ้าปล่อยว่างไว้ ทัวร์นี้จะถือว่าจองวันไหนก็ได้ตามปกติ'
        }
      >
        <AdminField label="วันออกเดินทาง" icon={CalendarDays} hint="หนึ่งวันต่อหนึ่งบรรทัด รูปแบบ YYYY-MM-DD ปี ค.ศ.">
          <textarea
            name="departure_dates_text"
            rows={4}
            defaultValue={tour?.departure_dates?.join("\n")}
            className="input resize-none font-mono-data"
            placeholder={"2026-08-15\n2026-09-12\n2026-10-10"}
          />
        </AdminField>
      </AdminSection>

      <AdminSection title="เหมาะสำหรับ" icon={Users} description="แสดงเป็นตัวกรองในหน้ารายการทัวร์">
        <div className="flex flex-wrap gap-4">
          {TOUR_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <input type="checkbox" name="tags" value={tag} defaultChecked={tour?.tags?.includes(tag)} className="h-4 w-4 rounded" />
              {tag}
            </label>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="รีวิว/คะแนน" icon={Star}>
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminField label="คะแนน" icon={Star} hint="เช่น 4.8">
            <input name="rating_score" type="number" step="0.1" min={0} max={5} defaultValue={tour?.rating_score ?? ""} className="input" />
          </AdminField>
          <AdminField label="จำนวนรีวิว" icon={MessageSquare}>
            <input name="rating_count" type="number" min={0} defaultValue={tour?.rating_count ?? ""} className="input" />
          </AdminField>
          <AdminField label="แหล่งที่มา" icon={Globe} hint="เช่น TripAdvisor">
            <input name="rating_source" defaultValue={tour?.rating_source || ""} className="input" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="รายละเอียดทัวร์" icon={FileText}>
        <div className="space-y-3">
          <AdminField label="คำโปรยสั้นๆ" icon={PenLine} error={state.fieldErrors?.summary}>
            <textarea name="summary" rows={2} defaultValue={tour?.summary} required className="input resize-none" />
          </AdminField>
          <AdminField label="รายละเอียดทัวร์" icon={FileText} error={state.fieldErrors?.description}>
            <textarea name="description" rows={5} defaultValue={tour?.description} required className="input resize-none" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="จุดเด่น / รายการราคา" icon={ListChecks}>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="จุดเด่น" icon={Sparkles} hint="หนึ่งบรรทัดต่อหนึ่งข้อ">
            <textarea
              name="highlights_text"
              rows={4}
              defaultValue={tour?.highlights.join("\n")}
              className="input resize-none"
              placeholder={"โฮมสเตย์ชาวเขาแท้ๆ\nเดินป่าวิวหลักล้าน"}
            />
          </AdminField>
          <AdminField label="ราคารวม" icon={CheckCircle2} hint="หนึ่งบรรทัดต่อหนึ่งข้อ">
            <textarea name="includes_text" rows={4} defaultValue={tour?.includes.join("\n")} className="input resize-none" />
          </AdminField>
          <AdminField label="ราคาไม่รวม" icon={XCircle} hint="หนึ่งบรรทัดต่อหนึ่งข้อ">
            <textarea name="excludes_text" rows={4} defaultValue={tour?.excludes.join("\n")} className="input resize-none" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="ราคาตามขนาดกลุ่ม" icon={Coins}>
        <PriceTiersEditor initialTiers={tour?.price_tiers || []} />
      </AdminSection>

      <AdminSection title="กำหนดการเดินทาง" icon={CalendarDays} description="แต่ละวันใส่รูปภาพได้เองว่าวันนั้นไปที่ไหนบ้าง">
        <ItineraryEditor initialDays={tour?.itinerary || []} />
      </AdminSection>

      <AdminSection title="ที่พัก" icon={BedDouble}>
        <div className="space-y-4">
          <AdminField label="รายละเอียดที่พักโดยรวม" icon={BedDouble} hint="แสดงเป็นคำโปรยในแท็บที่พัก">
            <textarea name="hotel_description" rows={3} defaultValue={tour?.hotel_description || ""} className="input resize-none" />
          </AdminField>
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
            <BedDouble size={13} /> รายการที่พักแต่ละคืน
          </p>
          <HotelListEditor initialItems={tour?.hotel_list || []} />
        </div>
      </AdminSection>

      <AdminSection title="เอเจนต์ผู้ดูแลทริป" icon={UserRound}>
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminField label="ชื่อเอเจนต์" icon={UserRound}>
            <input name="agent_name" defaultValue={tour?.agent_name || ""} className="input" />
          </AdminField>
          <AdminField label="ตำแหน่ง/ความเชี่ยวชาญ" icon={Briefcase}>
            <input name="agent_role" defaultValue={tour?.agent_role || ""} className="input" />
          </AdminField>
          <AdminField label="รูปโปรไฟล์" icon={ImageIcon}>
            <ImageUploadField name="agent_photo_url" label="" defaultValue={tour?.agent_photo_url || ""} />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="คำแปลภาษาอื่น" icon={Languages} description="ไม่บังคับ — ช่องไหนไม่กรอกจะแสดงข้อมูลพื้นฐานด้านบนแทนอัตโนมัติ">
        <TourTranslationsEditor
          formRef={formRef}
          initialTranslations={tour?.translations || {}}
          initialItineraryDays={tour?.itinerary || []}
          initialHotelList={tour?.hotel_list || []}
        />
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
          border-radius: 0.65rem;
          padding: 0.55rem 0.8rem;
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
