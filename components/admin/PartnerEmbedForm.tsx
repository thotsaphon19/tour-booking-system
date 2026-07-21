"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus, Tag, Code2, ListOrdered } from "lucide-react";
import { createPartnerEmbedAction, type PartnerEmbedFormState } from "@/lib/actions/partnerEmbeds";

const initialState: PartnerEmbedFormState = { ok: false };

export default function PartnerEmbedForm() {
  const [state, formAction, pending] = useActionState(createPartnerEmbedAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Without this, the form keeps whatever was just typed after a successful
  // add, which makes it look like clicking "Add" again does nothing (or
  // risks accidentally submitting a duplicate of the same widget).
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-jade)]/10 text-[var(--color-jade)]">
          <Plus size={15} />
        </span>
        <h2 className="font-display text-base font-bold text-[var(--color-jade-dark)] sm:text-lg">เพิ่มวิดเจ็ต/ลิงก์พันธมิตรใหม่</h2>
      </div>
      {state.message && (
        <p className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"}`}>
          {state.message}
        </p>
      )}
      <label className="block">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Tag size={13} /> ชื่อกำกับ (ไว้ดูในหลังบ้านเท่านั้น)</span>
        <input name="label" className="input" placeholder="เช่น GetYourGuide - November Trip" />
      </label>
      <label className="block">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Code2 size={13} /> โค้ด HTML ของวิดเจ็ต</span>
        <textarea
          name="html"
          rows={5}
          required
          className="input resize-none font-mono-data"
          placeholder='<a href="https://..."><img src="https://..." alt="..." /></a>'
        />
        {state.fieldErrors?.html && <span className="mt-1 block text-xs text-[var(--color-clay)]">{state.fieldErrors.html}</span>}
      </label>
      <label className="block max-w-[160px]">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><ListOrdered size={13} /> ลำดับการแสดง (เลขน้อยแสดงก่อน)</span>
        <input name="sort_order" type="number" defaultValue={0} className="input" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {pending ? "กำลังเพิ่ม..." : "เพิ่มวิดเจ็ต"}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.8125rem;
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
