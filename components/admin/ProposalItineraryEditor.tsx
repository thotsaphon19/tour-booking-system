"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Upload, Loader2, X, Images, CalendarDays, PenLine, FileText, BedDouble } from "lucide-react";
import type { ProposalItineraryDay } from "@/lib/types";
import { uploadImageFile } from "@/lib/uploadClient";

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function emptyDay(day: number, date?: string): ProposalItineraryDay {
  return { day, date: date || "", title: "", description: "", breakfast: false, lunch: false, dinner: false, accommodation: "", photos: [] };
}

function DayPhotoField({ photos, onChange }: { photos: string[]; onChange: (photos: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      onChange([url]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const photo = photos[0];

  return (
    <div>
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Images size={13} /> รูปภาพประจำวัน</span>
      <div className="flex items-center gap-2">
        {photo && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className="h-16 w-16 rounded-lg border border-[var(--color-border)] object-cover" />
            <button
              type="button"
              onClick={() => onChange([])}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-clay)] text-white"
            >
              <X size={11} />
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-jade)] hover:text-[var(--color-jade)]"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export default function ProposalItineraryEditor({ initialDays }: { initialDays: ProposalItineraryDay[] }) {
  const [days, setDays] = useState<ProposalItineraryDay[]>(initialDays.length > 0 ? initialDays : [emptyDay(1)]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function addDay() {
    setDays((prev) => [...prev, emptyDay(prev.length + 1)]);
    setOpenIndex(days.length);
  }

  function removeDay(index: number) {
    setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  }

  function patchDay(index: number, patch: Partial<ProposalItineraryDay>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function move(index: number, dir: -1 | 1) {
    setDays((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((d, i) => ({ ...d, day: i + 1 }));
    });
  }

  return (
    <div>
      <input type="hidden" name="itinerary_json" value={JSON.stringify(days)} readOnly />
      <div className="space-y-3">
        {days.map((day, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex flex-1 items-center gap-2 text-left text-sm font-semibold text-[var(--color-jade-dark)]"
                >
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  วันที่ {day.day} {day.title && `— ${day.title}`} {day.date && <span className="font-normal text-[var(--color-muted)]">({day.date})</span>}
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)] disabled:opacity-30">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === days.length - 1} className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)] disabled:opacity-30">
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" onClick={() => removeDay(index)} className="rounded p-1 text-[var(--color-clay)] hover:bg-[var(--color-clay)]/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-3 border-t border-[var(--color-border)] p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><CalendarDays size={13} /> วันที่ (ปฏิทินจริง)</span>
                      <input type="date" value={day.date || ""} onChange={(e) => patchDay(index, { date: e.target.value })} className="t-input" />
                    </label>
                    <label className="block">
                      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><PenLine size={13} /> ชื่อหัวข้อวัน</span>
                      <input value={day.title} onChange={(e) => patchDay(index, { title: e.target.value })} className="t-input" placeholder="เช่น ถึงหลวงพระบาง - ตักบาตรยามเช้า" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><FileText size={13} /> รายละเอียดของวัน</span>
                    <textarea rows={3} value={day.description} onChange={(e) => patchDay(index, { description: e.target.value })} className="t-input resize-none" />
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                      <label key={meal} className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
                        <input type="checkbox" checked={!!day[meal]} onChange={(e) => patchDay(index, { [meal]: e.target.checked })} className="h-4 w-4 rounded" />
                        {meal === "breakfast" ? "เช้า" : meal === "lunch" ? "กลางวัน" : "เย็น"}
                      </label>
                    ))}
                  </div>
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><BedDouble size={13} /> ที่พักคืนนี้</span>
                    <input value={day.accommodation || ""} onChange={(e) => patchDay(index, { accommodation: e.target.value })} className="t-input" />
                  </label>
                  <DayPhotoField photos={toArray<string>(day.photos)} onChange={(photos) => patchDay(index, { photos })} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addDay}
        className="mt-3 flex items-center gap-2 rounded-full border border-[var(--color-jade)] px-4 py-2 text-xs font-semibold text-[var(--color-jade)] hover:bg-[var(--color-jade)] hover:text-white"
      >
        <Plus size={14} /> เพิ่มวัน
      </button>

      <style jsx>{`
        .t-input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.6rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.8125rem;
          background: white;
        }
      `}</style>
    </div>
  );
}
