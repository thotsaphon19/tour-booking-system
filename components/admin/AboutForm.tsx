"use client";

import { useActionState, useState } from "react";
import { Loader2, Languages, Quote, Heading, FileText, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/lib/queries/settings";
import { updateAboutAction, type AboutFormState } from "@/lib/actions/about";
import { suggestTranslations } from "@/lib/actions/translate";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
] as const;
type LocaleCode = (typeof LOCALES)[number]["code"];

interface AboutFields {
  kicker?: string;
  title?: string;
  intro?: string;
  value1Title?: string;
  value1Desc?: string;
  value2Title?: string;
  value2Desc?: string;
  value3Title?: string;
  value3Desc?: string;
}

const initialState: AboutFormState = { ok: false };

export default function AboutForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateAboutAction, initialState);
  const [translations, setTranslations] = useState<Partial<Record<LocaleCode, AboutFields>>>(() => {
    try {
      return JSON.parse(settings.about_translations_json || "{}");
    } catch {
      return {};
    }
  });
  const [active, setActive] = useState<LocaleCode>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = translations[active] || {};

  function patch(fields: AboutFields) {
    setTranslations((prev) => ({ ...prev, [active]: { ...prev[active], ...fields } }));
  }

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    try {
      const fields = {
        kicker: settings.about_kicker,
        title: settings.about_title,
        intro: settings.about_intro,
        value1Title: settings.about_value1_title,
        value1Desc: settings.about_value1_desc,
        value2Title: settings.about_value2_title,
        value2Desc: settings.about_value2_desc,
        value3Title: settings.about_value3_title,
        value3Desc: settings.about_value3_desc,
      };
      const result = await suggestTranslations({ targetLocale: active, fields });
      patch(result as AboutFields);
    } catch {
      setError("แปลอัตโนมัติไม่สำเร็จ (อาจถึงโควต้าฟรีต่อวันแล้ว) กรอกเองได้เลย");
    } finally {
      setLoading(false);
    }
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

      <AdminSection title="ข้อมูลพื้นฐาน (ภาษาไทย)" icon={Heading} description="เนื้อหานี้จะแสดงเป็นค่าเริ่มต้นในภาษาที่ยังไม่มีคำแปล">
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="คำนำเล็กๆ เหนือหัวข้อ" icon={Quote} hint='เช่น "เรื่องราวของเรา"'>
            <input name="about_kicker" defaultValue={settings.about_kicker} required className="input" />
          </AdminField>
          <AdminField label="หัวข้อหลัก" icon={Heading}>
            <input name="about_title" defaultValue={settings.about_title} required className="input" />
          </AdminField>
          <AdminField label="เนื้อหาแนะนำบริษัท" icon={FileText} full>
            <textarea name="about_intro" rows={5} defaultValue={settings.about_intro} required className="input resize-none" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="จุดเด่น 3 ข้อ" icon={Sparkles} description="แสดงเป็น 3 คอลัมน์พร้อมไอคอนใต้เนื้อหาแนะนำ">
        <div className="grid gap-3 sm:grid-cols-3">
          <AdminField label="หัวข้อที่ 1" icon={Sparkles}>
            <input name="about_value1_title" defaultValue={settings.about_value1_title} className="input" />
          </AdminField>
          <AdminField label="คำอธิบายที่ 1" icon={FileText} full>
            <input name="about_value1_desc" defaultValue={settings.about_value1_desc} className="input" />
          </AdminField>
          <AdminField label="หัวข้อที่ 2" icon={Sparkles}>
            <input name="about_value2_title" defaultValue={settings.about_value2_title} className="input" />
          </AdminField>
          <AdminField label="คำอธิบายที่ 2" icon={FileText} full>
            <input name="about_value2_desc" defaultValue={settings.about_value2_desc} className="input" />
          </AdminField>
          <AdminField label="หัวข้อที่ 3" icon={Sparkles}>
            <input name="about_value3_title" defaultValue={settings.about_value3_title} className="input" />
          </AdminField>
          <AdminField label="คำอธิบายที่ 3" icon={FileText} full>
            <input name="about_value3_desc" defaultValue={settings.about_value3_desc} className="input" />
          </AdminField>
        </div>
      </AdminSection>

      <AdminSection title="คำแปลภาษาอื่น" icon={Languages} description="ไม่บังคับ — ช่องไหนไม่กรอกจะแสดงข้อมูลพื้นฐาน (ภาษาไทย) แทนอัตโนมัติ">
        <input type="hidden" name="about_translations_json" value={JSON.stringify(translations)} readOnly />

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

        <div className="mb-4 flex flex-wrap items-center gap-3">
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

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="คำนำเล็กๆ เหนือหัวข้อ" icon={Quote}>
            <input value={current.kicker || ""} onChange={(e) => patch({ kicker: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="หัวข้อหลัก" icon={Heading}>
            <input value={current.title || ""} onChange={(e) => patch({ title: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="เนื้อหาแนะนำบริษัท" icon={FileText} full>
            <textarea
              rows={4}
              value={current.intro || ""}
              onChange={(e) => patch({ intro: e.target.value })}
              className="input resize-none"
            />
          </AdminField>
          <AdminField label="หัวข้อที่ 1" icon={Sparkles}>
            <input value={current.value1Title || ""} onChange={(e) => patch({ value1Title: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="คำอธิบายที่ 1" icon={FileText}>
            <input value={current.value1Desc || ""} onChange={(e) => patch({ value1Desc: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="หัวข้อที่ 2" icon={Sparkles}>
            <input value={current.value2Title || ""} onChange={(e) => patch({ value2Title: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="คำอธิบายที่ 2" icon={FileText}>
            <input value={current.value2Desc || ""} onChange={(e) => patch({ value2Desc: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="หัวข้อที่ 3" icon={Sparkles}>
            <input value={current.value3Title || ""} onChange={(e) => patch({ value3Title: e.target.value })} className="input" />
          </AdminField>
          <AdminField label="คำอธิบายที่ 3" icon={FileText}>
            <input value={current.value3Desc || ""} onChange={(e) => patch({ value3Desc: e.target.value })} className="input" />
          </AdminField>
        </div>
      </AdminSection>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "กำลังบันทึก..." : "บันทึกหน้าเกี่ยวกับเรา"}
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
