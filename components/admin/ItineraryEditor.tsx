"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Upload, Loader2, X, Images, PenLine, FileText, BedDouble, Route } from "lucide-react";
import type { ItineraryDay, RouteLeg } from "@/lib/types";
import { uploadImageFile } from "@/lib/uploadClient";

/** Some tours were saved before `route`/`photos` were always arrays (or the
 *  data was hand-edited at some point), so a truthy non-array value like a
 *  string can end up stored there. `Array.isArray` guards against that in a
 *  way `value || []` doesn't — `|| []` only kicks in when the value is
 *  falsy, so a stray string would still slip through and crash `.map()`. */
function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function DayPhotosField({ photos, onChange }: { photos: string[]; onChange: (photos: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) uploaded.push(await uploadImageFile(file));
      onChange([...photos, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
        <Images size={13} /> รูปภาพประจำวัน (รูปแรกจะใช้เป็นภาพปกของวัน)
      </span>
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={`${src}-${i}`} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-16 w-16 rounded-lg border border-[var(--color-border)] object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, pi) => pi !== i))}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-clay)] text-white"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/5 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          <span className="text-[9px]">{uploading ? "..." : "อัปโหลด"}</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="hidden" />
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-clay)]">{error}</p>}
    </div>
  );
}

function emptyDay(day: number): ItineraryDay {
  return { day, title: "", description: "", breakfast: false, lunch: false, dinner: false, accommodation: "", photos: [], route: [] };
}

function emptyLeg(): RouteLeg {
  return { from: "", to: "", duration: "", transport: "" };
}

export default function ItineraryEditor({ initialDays }: { initialDays: ItineraryDay[] }) {
  const [days, setDays] = useState<ItineraryDay[]>(initialDays.length > 0 ? initialDays : [emptyDay(1)]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function update(index: number, patch: Partial<ItineraryDay>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addLeg(dayIndex: number) {
    setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, route: [...toArray<RouteLeg>(d.route), emptyLeg()] } : d)));
  }

  function updateLeg(dayIndex: number, legIndex: number, patch: Partial<RouteLeg>) {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, route: toArray<RouteLeg>(d.route).map((leg, li) => (li === legIndex ? { ...leg, ...patch } : leg)) }
          : d
      )
    );
  }

  function removeLeg(dayIndex: number, legIndex: number) {
    setDays((prev) =>
      prev.map((d, i) => (i === dayIndex ? { ...d, route: toArray<RouteLeg>(d.route).filter((_, li) => li !== legIndex) } : d))
    );
  }

  function addDay() {
    setDays((prev) => [...prev, emptyDay(prev.length + 1)]);
    setOpenIndex(days.length);
  }

  function removeDay(index: number) {
    setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="itinerary_json" value={JSON.stringify(days)} readOnly />
      {days.map((day, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="rounded-xl border border-[var(--color-border)] bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-[var(--color-jade-dark)]">
                วันที่ {day.day}
                {day.title ? ` — ${day.title}` : ""}
              </span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-[var(--color-border)] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><PenLine size={13} /> หัวข้อของวัน</span>
                    <input value={day.title} onChange={(e) => update(index, { title: e.target.value })} className="mini-input" />
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><BedDouble size={13} /> ที่พักคืนนี้</span>
                    <input
                      value={day.accommodation || ""}
                      onChange={(e) => update(index, { accommodation: e.target.value })}
                      className="mini-input"
                      placeholder="เช่น โฮมสเตย์ริมน้ำ"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><FileText size={13} /> รายละเอียด</span>
                  <textarea
                    value={day.description}
                    onChange={(e) => update(index, { description: e.target.value })}
                    rows={2}
                    className="mini-input resize-none"
                  />
                </label>

                <div className="flex flex-wrap gap-4">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                    <label key={meal} className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                      <input
                        type="checkbox"
                        checked={!!day[meal]}
                        onChange={(e) => update(index, { [meal]: e.target.checked })}
                        className="h-4 w-4 rounded"
                      />
                      {meal === "breakfast" ? "อาหารเช้า" : meal === "lunch" ? "อาหารกลางวัน" : "อาหารเย็น"}
                    </label>
                  ))}
                </div>

                <DayPhotosField
                  photos={toArray<string>(day.photos)}
                  onChange={(photos) => update(index, { photos })}
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
                      <Route size={13} /> เส้นทางของวันนี้ (แสดงเป็นไทม์ไลน์ เช่น กรุงเทพฯ → บางปะอิน → อยุธยา)
                    </span>
                    <button
                      type="button"
                      onClick={() => addLeg(index)}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--color-jade)]"
                    >
                      <Plus size={12} /> เพิ่มช่วงเดินทาง
                    </button>
                  </div>
                  <div className="space-y-2">
                    {toArray<RouteLeg>(day.route).map((leg, legIndex) => (
                      <div key={legIndex} className="grid gap-2 rounded-lg bg-[var(--color-sand)] p-2 sm:grid-cols-5">
                        <input
                          value={leg.from || ""}
                          onChange={(e) => updateLeg(index, legIndex, { from: e.target.value })}
                          className="mini-input"
                          placeholder="จาก เช่น กรุงเทพฯ"
                        />
                        <input
                          value={leg.to || ""}
                          onChange={(e) => updateLeg(index, legIndex, { to: e.target.value })}
                          className="mini-input"
                          placeholder="ไปยัง เช่น บางปะอิน"
                        />
                        <input
                          value={leg.duration || ""}
                          onChange={(e) => updateLeg(index, legIndex, { duration: e.target.value })}
                          className="mini-input"
                          placeholder="เวลา เช่น 1 ชม."
                        />
                        <input
                          type="number"
                          value={leg.distanceKm ?? ""}
                          onChange={(e) => updateLeg(index, legIndex, { distanceKm: e.target.value ? Number(e.target.value) : undefined })}
                          className="mini-input"
                          placeholder="ระยะทาง (กม.)"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            value={leg.transport || ""}
                            onChange={(e) => updateLeg(index, legIndex, { transport: e.target.value })}
                            className="mini-input"
                            placeholder="พาหนะ เช่น รถตู้"
                          />
                          <button type="button" onClick={() => removeLeg(index, legIndex)} className="flex-shrink-0 text-[var(--color-clay)]">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {toArray<RouteLeg>(day.route).length === 0 && (
                      <p className="text-xs text-[var(--color-muted)]">ยังไม่มีช่วงเดินทาง — กด &quot;เพิ่มช่วงเดินทาง&quot; ด้านบน</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDay(index)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-clay)]"
                >
                  <Trash2 size={13} /> ลบวันนี้
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addDay}
        className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-jade)] hover:bg-[var(--color-jade)]/5"
      >
        <Plus size={15} /> เพิ่มวันเดินทาง
      </button>

      <style jsx>{`
        .mini-input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.6rem;
          padding: 0.5rem 0.7rem;
          font-size: 0.8125rem;
        }
        .mini-input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
