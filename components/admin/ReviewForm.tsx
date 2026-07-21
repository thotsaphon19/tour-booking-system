"use client";

import { useActionState, useRef } from "react";
import { Loader2, UserRound, Globe, Star, CalendarDays, ToggleLeft, Images, PenLine, FileText } from "lucide-react";
import type { Review } from "@/lib/queries/reviews";
import type { ReviewFormState } from "@/lib/actions/reviews";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ReviewTranslationsEditor from "@/components/admin/ReviewTranslationsEditor";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";

const initialState: ReviewFormState = { ok: false };

export default function ReviewForm({
  action,
  review,
  submitLabel = "บันทึก",
  readOnly = false,
}: {
  action: (prev: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  review?: Review;
  submitLabel?: string;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
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

      <AdminSection title="ข้อมูลรีวิว" icon={Star}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="ชื่อลูกค้า" icon={UserRound} error={state.fieldErrors?.customer_name}>
          <input name="customer_name" defaultValue={review?.customer_name} required className="input" />
        </AdminField>
        <AdminField label="ประเทศ" icon={Globe}>
          <input name="customer_country" defaultValue={review?.customer_country || ""} className="input" />
        </AdminField>
        <AdminField label="รูปโปรไฟล์" icon={Images}>
          <ImageUploadField name="customer_photo_url" label="" defaultValue={review?.customer_photo_url || ""} />
        </AdminField>
        <AdminField label="คะแนน (1-5)" icon={Star}>
          <input name="rating" type="number" min={1} max={5} defaultValue={review?.rating || 5} className="input" />
        </AdminField>
        <AdminField label="ช่วงเวลาเดินทาง" icon={CalendarDays}>
          <input name="travel_dates" defaultValue={review?.travel_dates || ""} className="input" placeholder="เช่น มี.ค. 2569" />
        </AdminField>
        <AdminField label="สถานะการตรวจสอบ" icon={ToggleLeft}>
          <select name="status" defaultValue={review?.status || "approved"} className="input">
            <option value="pending">รอตรวจสอบ</option>
            <option value="approved">อนุมัติแล้ว (แสดงบนเว็บ)</option>
            <option value="rejected">ปฏิเสธ (ไม่แสดง)</option>
          </select>
        </AdminField>
      </div>
      {(review?.customer_email || review?.tour_id) && (
        <p className="mt-3 rounded-lg bg-[var(--color-jade)]/5 px-3 py-2 text-xs text-[var(--color-ink-soft)]">
          รีวิวนี้ลูกค้าส่งเข้ามาเองจากหน้าเว็บ
          {review?.customer_email ? ` · อีเมล: ${review.customer_email}` : ""}
        </p>
      )}
      <div className="mt-3 space-y-3">
      <AdminField label="หัวข้อรีวิว" icon={PenLine} error={state.fieldErrors?.title}>
        <input name="title" defaultValue={review?.title} required className="input" />
      </AdminField>
      <AdminField label="ข้อความรีวิว" icon={FileText} error={state.fieldErrors?.quote}>
        <textarea name="quote" rows={4} defaultValue={review?.quote} required className="input resize-none" />
      </AdminField>
      <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <input type="checkbox" name="featured" defaultChecked={review?.featured ?? true} className="h-4 w-4 rounded" />
        แสดงในหน้าแรกและหน้ารีวิว
      </label>
      </div>
      </AdminSection>

      <ReviewTranslationsEditor formRef={formRef} initialTranslations={review?.translations || {}} />

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
