"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2, Loader2, X, Tag, Code2, ListOrdered } from "lucide-react";
import type { PartnerEmbed } from "@/lib/queries/partnerEmbeds";
import { updatePartnerEmbedAction, deletePartnerEmbedAction, type PartnerEmbedFormState } from "@/lib/actions/partnerEmbeds";
import { LockedIconButton } from "@/components/admin/LockedControls";

const initialState: PartnerEmbedFormState = { ok: false };

export default function PartnerEmbedListItem({ embed, readOnly = false }: { embed: PartnerEmbed; readOnly?: boolean }) {
  const [editing, setEditing] = useState(false);
  const boundAction = updatePartnerEmbedAction.bind(null, embed.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (editing) {
    return (
      <form action={formAction} className="space-y-3 rounded-2xl border border-[var(--color-jade)]/40 bg-[var(--color-surface)] p-4">
        {state.message && (
          <p className={`rounded-lg px-3 py-2 text-xs ${state.ok ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"}`}>
            {state.message}
          </p>
        )}
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Tag size={13} /> ชื่อกำกับ</span>
          <input name="label" defaultValue={embed.label} className="mini-input" />
        </label>
        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Code2 size={13} /> โค้ด HTML ของวิดเจ็ต</span>
          <textarea name="html" rows={4} defaultValue={embed.html} required className="mini-input resize-none font-mono-data" />
          {state.fieldErrors?.html && <span className="mt-1 block text-xs text-[var(--color-clay)]">{state.fieldErrors.html}</span>}
        </label>
        <label className="block max-w-[160px]">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><ListOrdered size={13} /> ลำดับการแสดง</span>
          <input name="sort_order" type="number" defaultValue={embed.sort_order} className="mini-input" />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-jade)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-jade-light)] disabled:opacity-60"
          >
            {pending && <Loader2 size={13} className="animate-spin" />}
            บันทึก
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-ink-soft)]"
          >
            <X size={13} /> ยกเลิก
          </button>
        </div>
        <style jsx>{`
          .mini-input {
            width: 100%;
            border: 1px solid var(--color-border);
            border-radius: 0.6rem;
            padding: 0.5rem 0.7rem;
            font-size: 0.8125rem;
            background: white;
          }
        `}</style>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-jade-dark)]">{embed.label || `วิดเจ็ต #${embed.id}`}</p>
        <p className="mt-1 truncate font-mono-data text-xs text-[var(--color-muted)]">{embed.html}</p>
        <p className="mt-1 text-[10px] text-[var(--color-muted)]">ลำดับแสดง: {embed.sort_order}</p>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        {readOnly ? (
          <>
            <LockedIconButton />
            <LockedIconButton />
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/10"
            >
              <Pencil size={14} />
            </button>
            <form
              action={async () => {
                await deletePartnerEmbedAction(embed.id, embed.label || `วิดเจ็ต #${embed.id}`);
              }}
            >
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                <Trash2 size={14} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
