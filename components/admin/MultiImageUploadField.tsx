"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, Plus } from "lucide-react";

export default function MultiImageUploadField({
  name,
  label,
  icon: Icon,
  defaultValue = "",
}: {
  name: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  defaultValue?: string;
}) {
  const [urls, setUrls] = useState<string[]>(
    defaultValue
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
        uploaded.push(data.url);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function addUrlManually() {
    const url = window.prompt("วางลิงก์รูปภาพ (URL)");
    if (url && url.trim()) setUrls((prev) => [...prev, url.trim()]);
  }

  return (
    <div>
      {label && (
        <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
          {Icon && <Icon size={13} className="flex-shrink-0" />} {label}
        </span>
      )}
      <input type="hidden" name={name} value={urls.join("\n")} readOnly />

      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-20 w-20 rounded-lg border border-[var(--color-border)] object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
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
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--color-border)] text-[var(--color-jade)] hover:bg-[var(--color-jade)]/5 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          <span className="text-[10px]">{uploading ? "กำลังอัปโหลด" : "อัปโหลด"}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <button type="button" onClick={addUrlManually} className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--color-jade)]">
        <Plus size={12} /> หรือวางลิงก์รูปภาพเอง
      </button>
      {error && <p className="mt-1 text-xs text-[var(--color-clay)]">{error}</p>}
    </div>
  );
}
