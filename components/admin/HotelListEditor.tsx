"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Upload, Loader2, Images, CalendarDays, MapPin, Tag, Star } from "lucide-react";
import type { HotelListItem } from "@/lib/types";
import { uploadImageFile } from "@/lib/uploadClient";

function empty(): HotelListItem {
  return { days: "", city: "", name: "", stars: 3, image: "" };
}

function HotelImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImageFile(file));
    } catch {
      // Keep the existing value on failure — admin can retry or paste a URL.
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex-1">
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Images size={13} /> รูปที่พัก</span>
      <div className="flex items-center gap-1.5">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-8 w-8 flex-shrink-0 rounded object-cover" />
        )}
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mini-input" placeholder="https://..." />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-jade)] disabled:opacity-60"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      </div>

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

export default function HotelListEditor({ initialItems }: { initialItems: HotelListItem[] }) {
  const [items, setItems] = useState<HotelListItem[]>(initialItems.length > 0 ? initialItems : [empty()]);

  function update(index: number, patch: Partial<HotelListItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="hotel_list_json" value={JSON.stringify(items)} readOnly />
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-[var(--color-border)] bg-white p-3 sm:grid-cols-5">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><CalendarDays size={13} /> วันที่พัก</span>
            <input value={item.days} onChange={(e) => update(index, { days: e.target.value })} className="mini-input" placeholder="เช่น 1, 4" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><MapPin size={13} /> เมือง</span>
            <input value={item.city} onChange={(e) => update(index, { city: e.target.value })} className="mini-input" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Tag size={13} /> ชื่อที่พัก</span>
            <input value={item.name} onChange={(e) => update(index, { name: e.target.value })} className="mini-input" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Star size={13} /> ดาว (0-5)</span>
            <input
              type="number"
              min={0}
              max={5}
              value={item.stars}
              onChange={(e) => update(index, { stars: Number(e.target.value) || 0 })}
              className="mini-input"
            />
          </label>
          <div className="flex items-end gap-1">
            <HotelImageField value={item.image} onChange={(url) => update(index, { image: url })} />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              className="mb-0.5 flex-shrink-0 text-[var(--color-clay)]"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, empty()])}
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-jade)]"
      >
        <Plus size={13} /> เพิ่มที่พัก
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
