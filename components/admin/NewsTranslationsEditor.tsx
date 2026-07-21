"use client";

import { useState } from "react";
import { Languages, Loader2, Tag, PenLine, FileText } from "lucide-react";
import type { NewsTranslations, TranslatableLocale } from "@/lib/types";
import { suggestTranslations } from "@/lib/actions/translate";
import { AdminSection } from "@/components/admin/AdminFormKit";

const LOCALES: { code: TranslatableLocale; label: string }[] = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
];

export default function NewsTranslationsEditor({
  formRef,
  initialTranslations,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  initialTranslations: NewsTranslations;
}) {
  const [translations, setTranslations] = useState<NewsTranslations>(initialTranslations || {});
  const [active, setActive] = useState<TranslatableLocale>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = translations[active] || {};

  function patchCurrent(patch: Partial<NonNullable<NewsTranslations[TranslatableLocale]>>) {
    setTranslations((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
  }

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    try {
      const form = formRef.current;
      const fd = form ? new FormData(form) : null;
      const fields = {
        title: ((fd?.get("title") as string) || "").trim(),
        excerpt: ((fd?.get("excerpt") as string) || "").trim(),
        content: ((fd?.get("content") as string) || "").trim(),
      };
      const result = await suggestTranslations({ targetLocale: active, fields });
      patchCurrent({
        title: result.title || current.title,
        excerpt: result.excerpt || current.excerpt,
        content: result.content || current.content,
      });
    } catch {
      setError("แปลอัตโนมัติไม่สำเร็จ (อาจถึงโควต้าฟรีต่อวันแล้ว) กรอกเองได้เลย");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminSection
      title="คำแปลภาษาอื่น (ไม่บังคับ)"
      icon={Languages}
      description="ช่องไหนไม่กรอกคำแปล หน้าเว็บภาษานั้นจะแสดงข้อความจากฟอร์มด้านบนแทนให้อัตโนมัติ — ใส่คำแปลภาษาไทยที่นี่ได้ด้วย ถ้าฟอร์มด้านบนพิมพ์เป็นภาษาอื่นไว้"
    >
      <input type="hidden" name="translations_json" value={JSON.stringify(translations)} readOnly />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setActive(l.code)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active === l.code ? "bg-[var(--color-jade)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mb-1 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleSuggest}
          className="flex items-center gap-2 rounded-full border border-[var(--color-jade)] px-4 py-2 text-xs font-semibold text-[var(--color-jade)] transition hover:bg-[var(--color-jade)] hover:text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
          {loading ? "กำลังแปล..." : `แปลร่างอัตโนมัติ (ฟรี) เป็น ${LOCALES.find((l) => l.code === active)?.label}`}
        </button>
        {error && <span className="text-xs text-[var(--color-clay)]">{error}</span>}
      </div>
      <p className="mb-4 text-xs text-[var(--color-muted)]">เป็นแค่ร่างจากเครื่องแปลภาษาฟรี ควรตรวจทานและแก้คำให้ถูกต้องก่อนบันทึกเสมอ</p>

      <label className="mb-3 block">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
          <Tag size={13} /> หัวข้อ
        </span>
        <input value={current.title || ""} onChange={(e) => patchCurrent({ title: e.target.value })} className="t-input" />
      </label>
      <label className="mb-3 block">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
          <PenLine size={13} /> คำโปรยสั้นๆ
        </span>
        <textarea rows={2} value={current.excerpt || ""} onChange={(e) => patchCurrent({ excerpt: e.target.value })} className="t-input resize-none" />
      </label>
      <label className="block">
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
          <FileText size={13} /> เนื้อหา
        </span>
        <textarea rows={6} value={current.content || ""} onChange={(e) => patchCurrent({ content: e.target.value })} className="t-input resize-none" />
      </label>

      <style jsx>{`
        .t-input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          background: white;
        }
        .t-input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </AdminSection>
  );
}
