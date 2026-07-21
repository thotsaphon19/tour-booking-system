"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

export default function ImageUploadField({
  name,
  label,
  icon: Icon,
  defaultValue = "",
  full,
  onChange,
}: {
  name: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  defaultValue?: string;
  full?: boolean;
  /** Optional — most callers just read the value from FormData on submit
   *  via `name`. Pass this when the parent also needs to track the value in
   *  its own React state (e.g. to serialize several images into one JSON
   *  field instead of one form field each). */
  onChange?: (value: string) => void;
}) {
  const [value, setValueState] = useState(defaultValue);
  const setValue = (v: string) => {
    setValueState(v);
    onChange?.(v);
  };
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
      setValue(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      {label && (
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
          {Icon && <Icon size={13} className="flex-shrink-0" />} {label}
        </span>
      )}
      <div className="flex items-start gap-3">
        {value && (
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-16 w-16 rounded-lg border border-[var(--color-border)] object-cover" />
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-clay)] text-white"
            >
              <X size={11} />
            </button>
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input"
            placeholder="https://... หรืออัปโหลดไฟล์ด้านล่าง"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-jade)] hover:bg-[var(--color-jade)]/5 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "กำลังอัปโหลด..." : "อัปโหลดไฟล์ (JPG/PNG)"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          </div>
          {error && <p className="text-xs text-[var(--color-clay)]">{error}</p>}
        </div>
      </div>

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
    </label>
  );
}
