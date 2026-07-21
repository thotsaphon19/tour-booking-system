"use client";

import { useActionState, useState } from "react";
import { Loader2, Images, PenLine } from "lucide-react";
import { locales, localeLabels, localeImages, type Locale } from "@/i18n/routing";
import { updateLanguagePageAction, type LanguagePageFormState } from "@/lib/actions/languagePage";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";

const DEFAULT_TAGLINES: Partial<Record<Locale, string>> = {
  th: "ทัวร์ในประเทศไทย โดยไกด์ท้องถิ่น",
  en: "Thailand tours, guided by locals",
  fr: "Circuits en Thaïlande, guidés par des locaux",
  de: "Thailand-Reisen mit einheimischen Guides",
  ja: "地元ガイドが案内するタイ国内の旅",
  es: "Tours por Tailandia, guiados por locales",
};

interface LanguagePageOverride {
  image?: string;
  tagline?: string;
}

const initialState: LanguagePageFormState = { ok: false };

export default function LanguagePageForm({ languagePageJson }: { languagePageJson: string }) {
  const [state, formAction, pending] = useActionState(updateLanguagePageAction, initialState);
  const [overrides, setOverrides] = useState<Partial<Record<Locale, LanguagePageOverride>>>(() => {
    try {
      return JSON.parse(languagePageJson || "{}");
    } catch {
      return {};
    }
  });

  function patch(locale: Locale, fields: LanguagePageOverride) {
    setOverrides((prev) => ({ ...prev, [locale]: { ...prev[locale], ...fields } }));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"
          }`}
        >
          {state.message}
        </p>
      )}
      <input type="hidden" name="language_page_json" value={JSON.stringify(overrides)} readOnly />

      <AdminSection
        title="การ์ดเลือกภาษา"
        icon={Images}
        description="รูปภาพและคำโปรยของแต่ละภาษาในหน้าแรกสุดของเว็บไซต์ (หน้าให้ลูกค้าเลือกภาษาก่อนเข้าเว็บ) — ปล่อยว่างช่องไหนจะใช้ค่าเริ่มต้นของระบบแทน"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {locales.map((locale) => {
            const current = overrides[locale] || {};
            return (
              <div key={locale} className="rounded-xl border border-[var(--color-border)] bg-white p-4">
                <p className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-[var(--color-jade-dark)]">
                  <span className="rounded-md bg-[var(--color-jade)]/10 px-2 py-0.5 font-mono-data text-[11px] text-[var(--color-jade)]">
                    {locale.toUpperCase()}-01
                  </span>
                  {localeLabels[locale]}
                </p>
                <div className="space-y-3">
                  <AdminField label="รูปภาพการ์ด" icon={Images}>
                    <ImageUploadField
                      name={`image_${locale}`}
                      label=""
                      defaultValue={current.image || ""}
                      onChange={(url) => patch(locale, { image: url })}
                      full
                    />
                  </AdminField>
                  <AdminField label="คำโปรยใต้ชื่อภาษา" icon={PenLine} hint={`ค่าเริ่มต้น: "${DEFAULT_TAGLINES[locale] || ""}"`}>
                    <input
                      value={current.tagline || ""}
                      onChange={(e) => patch(locale, { tagline: e.target.value })}
                      className="input"
                      placeholder={DEFAULT_TAGLINES[locale] || ""}
                    />
                  </AdminField>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    รูปเริ่มต้นตอนนี้: <a href={localeImages[locale]} target="_blank" rel="noreferrer" className="underline">ดูรูป</a>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </AdminSection>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "กำลังบันทึก..." : "บันทึกหน้าเลือกภาษา"}
      </button>

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
