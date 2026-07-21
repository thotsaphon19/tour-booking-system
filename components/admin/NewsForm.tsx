"use client";

import { useActionState, useRef } from "react";
import { Loader2, Tag, Link2, Images, PenLine, FileText } from "lucide-react";
import type { NewsPost } from "@/lib/types";
import type { NewsFormState } from "@/lib/actions/news";
import ImageUploadField from "@/components/admin/ImageUploadField";
import NewsTranslationsEditor from "@/components/admin/NewsTranslationsEditor";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";

const initialState: NewsFormState = { ok: false };

export default function NewsForm({
  action,
  post,
  submitLabel = "บันทึก",
  readOnly = false,
}: {
  action: (prev: NewsFormState, formData: FormData) => Promise<NewsFormState>;
  post?: NewsPost;
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

      <AdminSection title="เนื้อหาบทความ" icon={FileText}>
      <div className="space-y-3">
      <AdminField label="หัวข้อ" icon={Tag} error={state.fieldErrors?.title}>
        <input name="title" defaultValue={post?.title} required className="input" />
      </AdminField>
      <AdminField label="Slug (ปล่อยว่างให้สร้างอัตโนมัติ)" icon={Link2} error={state.fieldErrors?.slug}>
        <input name="slug" defaultValue={post?.slug} className="input" />
      </AdminField>
      <AdminField label="รูปภาพหน้าปก" icon={Images}>
        <ImageUploadField name="cover_image_url" label="" defaultValue={post?.cover_image_url || ""} />
      </AdminField>
      <AdminField label="คำโปรยสั้นๆ" icon={PenLine} error={state.fieldErrors?.excerpt}>
        <textarea name="excerpt" rows={2} defaultValue={post?.excerpt} required className="input resize-none" />
      </AdminField>
      <AdminField label="เนื้อหา" icon={FileText} error={state.fieldErrors?.content}>
        <textarea name="content" rows={8} defaultValue={post?.content} required className="input resize-none" />
      </AdminField>
      <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? true} className="h-4 w-4 rounded" />
        เผยแพร่บทความนี้
      </label>
      </div>
      </AdminSection>

      <NewsTranslationsEditor formRef={formRef} initialTranslations={post?.translations || {}} />
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
