"use client";

import { useState } from "react";
import {
  Languages,
  Loader2,
  Tag,
  Tags,
  MapPin,
  Gauge,
  PenLine,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  BedDouble,
  UserRound,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import type { ItineraryDay, HotelListItem, TourTranslations, TranslatableLocale } from "@/lib/types";
import { suggestTranslations } from "@/lib/actions/translate";
import { AdminField } from "@/components/admin/AdminFormKit";

const LOCALES: { code: TranslatableLocale; label: string }[] = [
  { code: "th", label: "ไทย" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "es", label: "Español" },
];

export default function TourTranslationsEditor({
  formRef,
  initialTranslations,
  initialItineraryDays,
  initialHotelList,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  initialTranslations: TourTranslations;
  initialItineraryDays: ItineraryDay[];
  initialHotelList: HotelListItem[];
}) {
  const [translations, setTranslations] = useState<TourTranslations>(initialTranslations || {});
  const [active, setActive] = useState<TranslatableLocale>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = translations[active] || {};

  function patchCurrent(patch: Partial<NonNullable<TourTranslations[TranslatableLocale]>>) {
    setTranslations((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
  }

  function patchDay(dayNumber: number, patch: { title?: string; description?: string; accommodation?: string }) {
    setTranslations((prev) => {
      const loc = prev[active] || {};
      const existing = loc.itinerary || [];
      const idx = existing.findIndex((d) => d.day === dayNumber);
      const itinerary =
        idx >= 0
          ? existing.map((d, i) => (i === idx ? { ...d, ...patch } : d))
          : [...existing, { day: dayNumber, ...patch }];
      return { ...prev, [active]: { ...loc, itinerary } };
    });
  }

  function patchHotelItem(index: number, patch: { city?: string; name?: string }) {
    setTranslations((prev) => {
      const loc = prev[active] || {};
      const existing = loc.hotel_list || [];
      const next = [...existing];
      // Pad with empty entries so the array stays aligned by position with
      // the base hotel list, even if earlier items haven't been translated.
      while (next.length <= index) next.push({});
      next[index] = { ...next[index], ...patch };
      return { ...prev, [active]: { ...loc, hotel_list: next } };
    });
  }

  function readThaiBase() {
    const form = formRef.current;
    const fd = form ? new FormData(form) : null;
    const get = (name: string) => ((fd?.get(name) as string) || "").trim();
    const lines = (name: string) =>
      get(name)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    return {
      title: get("title"),
      category: get("category"),
      province: get("province"),
      difficulty: get("difficulty"),
      summary: get("summary"),
      description: get("description"),
      highlights: lines("highlights_text"),
      includes: lines("includes_text"),
      excludes: lines("excludes_text"),
      hotel_name: get("hotel_name"),
      hotel_description: get("hotel_description"),
      agent_name: get("agent_name"),
      agent_role: get("agent_role"),
    };
  }

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    try {
      const base = readThaiBase();
      const fields: Record<string, string> = {
        title: base.title,
        category: base.category,
        province: base.province,
        difficulty: base.difficulty,
        summary: base.summary,
        description: base.description,
        hotel_name: base.hotel_name,
        hotel_description: base.hotel_description,
        agent_name: base.agent_name,
        agent_role: base.agent_role,
      };
      base.highlights.forEach((v, i) => (fields[`highlight_${i}`] = v));
      base.includes.forEach((v, i) => (fields[`include_${i}`] = v));
      base.excludes.forEach((v, i) => (fields[`exclude_${i}`] = v));
      initialItineraryDays.forEach((d, i) => {
        fields[`itinerary_${i}_title`] = d.title || "";
        fields[`itinerary_${i}_description`] = d.description || "";
        fields[`itinerary_${i}_accommodation`] = d.accommodation || "";
      });
      initialHotelList.forEach((h, i) => {
        fields[`hotel_list_${i}_city`] = h.city || "";
        fields[`hotel_list_${i}_name`] = h.name || "";
      });

      const result = await suggestTranslations({ targetLocale: active, fields });

      patchCurrent({
        title: result.title || current.title,
        category: result.category || current.category,
        province: result.province || current.province,
        difficulty: result.difficulty || current.difficulty,
        summary: result.summary || current.summary,
        description: result.description || current.description,
        hotel_name: result.hotel_name || current.hotel_name,
        hotel_description: result.hotel_description || current.hotel_description,
        agent_name: result.agent_name || current.agent_name,
        agent_role: result.agent_role || current.agent_role,
        highlights: base.highlights.map((_, i) => result[`highlight_${i}`] || ""),
        includes: base.includes.map((_, i) => result[`include_${i}`] || ""),
        excludes: base.excludes.map((_, i) => result[`exclude_${i}`] || ""),
        itinerary: initialItineraryDays.map((d, i) => ({
          day: d.day,
          title: result[`itinerary_${i}_title`] || "",
          description: result[`itinerary_${i}_description`] || "",
          accommodation: result[`itinerary_${i}_accommodation`] || "",
        })),
        hotel_list: initialHotelList.map((_, i) => ({
          city: result[`hotel_list_${i}_city`] || "",
          name: result[`hotel_list_${i}_name`] || "",
        })),
      });
    } catch {
      setError("แปลอัตโนมัติไม่สำเร็จ (อาจถึงโควต้าฟรีต่อวันแล้ว) กรอกเองได้เลย");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-[var(--color-muted)]">
        ช่องไหนไม่กรอกคำแปล หน้าเว็บภาษานั้นจะแสดงข้อความจากช่อง &quot;ข้อมูลพื้นฐาน&quot; ด้านบนแทนให้อัตโนมัติ ไม่มีวันขึ้นเป็นช่องว่าง — ใส่คำแปลภาษาไทยที่นี่ได้ด้วย ถ้าช่องข้อมูลพื้นฐานพิมพ์เป็นภาษาอื่นไว้
      </p>
      <input type="hidden" name="translations_json" value={JSON.stringify(translations)} readOnly />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setActive(l.code)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active === l.code
                ? "bg-[var(--color-jade)] text-white"
                : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"
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
      <p className="mb-4 text-xs text-[var(--color-muted)]">
        เป็นแค่ร่างจากเครื่องแปลภาษาฟรี ควรตรวจทานและแก้คำให้ถูกต้องก่อนบันทึกเสมอ
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TField label="ชื่อทัวร์" icon={Tag} value={current.title} onChange={(v) => patchCurrent({ title: v })} />
        <TField label="หมวดหมู่" icon={Tags} value={current.category} onChange={(v) => patchCurrent({ category: v })} />
        <TField label="จังหวัด/สถานที่" icon={MapPin} value={current.province} onChange={(v) => patchCurrent({ province: v })} />
        <TField label="ระดับความยาก (ข้อความ)" icon={Gauge} value={current.difficulty} onChange={(v) => patchCurrent({ difficulty: v })} />
      </div>

      <TField label="คำโปรยสั้นๆ" icon={PenLine} value={current.summary} onChange={(v) => patchCurrent({ summary: v })} textarea rows={2} />
      <TField label="รายละเอียดทัวร์" icon={FileText} value={current.description} onChange={(v) => patchCurrent({ description: v })} textarea rows={4} />

      <div className="grid gap-4 sm:grid-cols-3">
        <TField
          label="จุดเด่น (หนึ่งบรรทัดต่อหนึ่งข้อ)"
          icon={Sparkles}
          value={(current.highlights || []).join("\n")}
          onChange={(v) => patchCurrent({ highlights: v.split("\n") })}
          textarea
          rows={4}
        />
        <TField
          label="ราคารวม (หนึ่งบรรทัดต่อหนึ่งข้อ)"
          icon={CheckCircle2}
          value={(current.includes || []).join("\n")}
          onChange={(v) => patchCurrent({ includes: v.split("\n") })}
          textarea
          rows={4}
        />
        <TField
          label="ราคาไม่รวม (หนึ่งบรรทัดต่อหนึ่งข้อ)"
          icon={XCircle}
          value={(current.excludes || []).join("\n")}
          onChange={(v) => patchCurrent({ excludes: v.split("\n") })}
          textarea
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TField label="ชื่อที่พัก" icon={BedDouble} value={current.hotel_name} onChange={(v) => patchCurrent({ hotel_name: v })} />
        <TField
          label="รายละเอียดที่พัก"
          icon={BedDouble}
          value={current.hotel_description}
          onChange={(v) => patchCurrent({ hotel_description: v })}
          textarea
          rows={2}
          full
        />
        <TField label="ชื่อเอเจนต์ (ทับศัพท์)" icon={UserRound} value={current.agent_name} onChange={(v) => patchCurrent({ agent_name: v })} />
        <TField label="ตำแหน่ง/ความเชี่ยวชาญเอเจนต์" icon={Briefcase} value={current.agent_role} onChange={(v) => patchCurrent({ agent_role: v })} />
      </div>

      {initialItineraryDays.length > 0 && (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
            <CalendarDays size={13} /> กำหนดการรายวัน
          </p>
          {initialItineraryDays.map((d) => {
            const dayTr: { title?: string; description?: string; accommodation?: string } =
              current.itinerary?.find((x) => x.day === d.day) || {};
            return (
              <div key={d.day} className="rounded-xl border border-[var(--color-border)] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  <CalendarDays size={13} /> วันที่ {d.day} <span className="font-normal normal-case">({d.title})</span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    placeholder="ชื่อหัวข้อวัน"
                    value={dayTr.title || ""}
                    onChange={(e) => patchDay(d.day, { title: e.target.value })}
                    className="t-input"
                  />
                  <input
                    placeholder="ที่พัก"
                    value={dayTr.accommodation || ""}
                    onChange={(e) => patchDay(d.day, { accommodation: e.target.value })}
                    className="t-input"
                  />
                </div>
                <textarea
                  placeholder="รายละเอียดของวัน"
                  rows={2}
                  value={dayTr.description || ""}
                  onChange={(e) => patchDay(d.day, { description: e.target.value })}
                  className="t-input mt-2 resize-none"
                />
              </div>
            );
          })}
        </div>
      )}

      {initialHotelList.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
            <BedDouble size={13} /> รายการที่พักแต่ละคืน
          </p>
          {initialHotelList.map((h, i) => {
            const itemTr = current.hotel_list?.[i] || {};
            return (
              <div key={i} className="rounded-xl border border-[var(--color-border)] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                  <BedDouble size={13} /> คืนที่ {h.days} <span className="font-normal normal-case">({h.city} — {h.name})</span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    placeholder="เมือง/จังหวัด"
                    value={itemTr.city || ""}
                    onChange={(e) => patchHotelItem(i, { city: e.target.value })}
                    className="t-input"
                  />
                  <input
                    placeholder="ชื่อที่พัก"
                    value={itemTr.name || ""}
                    onChange={(e) => patchHotelItem(i, { name: e.target.value })}
                    className="t-input"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .t-input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          background: white;
          margin-top: 0.35rem;
        }
        .t-input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

function TField({
  label,
  icon,
  value,
  onChange,
  textarea,
  rows,
  full,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  value?: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  rows?: number;
  full?: boolean;
}) {
  return (
    <AdminField label={label} icon={icon} full={full}>
      {textarea ? (
        <textarea rows={rows || 3} value={value || ""} onChange={(e) => onChange(e.target.value)} className="t-input resize-none" />
      ) : (
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="t-input" />
      )}
    </AdminField>
  );
}
