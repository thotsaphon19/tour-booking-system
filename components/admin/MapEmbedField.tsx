"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, Code2 } from "lucide-react";

function isLikelyValidEmbed(url: string): boolean {
  if (!url.trim()) return true; // empty is fine, just means no map yet
  return /google\.com\/maps\/embed/.test(url) || /maps\.google\.com\/maps\?.*output=embed/.test(url);
}

function isLikelyBrokenShareLink(url: string): boolean {
  if (!url.trim()) return false;
  if (isLikelyValidEmbed(url)) return false;
  // Common "share" link shapes that Google blocks from being framed —
  // these look plausible but will render blank on the live site.
  return /google\.com\/maps\/place|goo\.gl\/maps|maps\.app\.goo\.gl/.test(url);
}

export default function MapEmbedField({ defaultValue }: { defaultValue: string }) {
  const [mode, setMode] = useState<"search" | "manual">(
    defaultValue && !/google\.com\/maps\/embed/.test(defaultValue) && /output=embed/.test(defaultValue) ? "search" : "manual"
  );
  const [placeQuery, setPlaceQuery] = useState(() => {
    const match = defaultValue.match(/[?&]q=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  });
  const [manualUrl, setManualUrl] = useState(defaultValue);

  const searchUrl = placeQuery.trim() ? `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery.trim())}&z=13&output=embed` : "";
  const finalValue = mode === "search" ? searchUrl : manualUrl;

  return (
    <div>
      <input type="hidden" name="map_embed_url" value={finalValue} />

      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("search")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            mode === "search" ? "bg-[var(--color-jade)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"
          }`}
        >
          <MapPin size={12} /> ค้นหาสถานที่ (ง่าย)
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            mode === "manual" ? "bg-[var(--color-jade)] text-white" : "border border-[var(--color-border)] text-[var(--color-ink-soft)]"
          }`}
        >
          <Code2 size={12} /> วางโค้ด Embed เอง
        </button>
      </div>

      {mode === "search" ? (
        <>
          <input
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            className="input"
            placeholder="เช่น อุทยานประวัติศาสตร์สุโขทัย หรือ Sukhothai Historical Park"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            พิมพ์ชื่อสถานที่หรือที่อยู่ ระบบจะสร้างแผนที่ให้อัตโนมัติ ไม่ต้องเปิด Google Maps เอง
          </p>
        </>
      ) : (
        <>
          <input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="input"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            วิธีหา: เปิด Google Maps → ค้นหาเส้นทาง/สถานที่ → กด &quot;แชร์&quot; → เลือกแท็บ &quot;ฝังแผนที่&quot; (Embed a map) → คัดลอกเฉพาะลิงก์ที่อยู่ใน{" "}
            <code>src=&quot;...&quot;</code> มาวางที่นี่ (ไม่ต้องใช้ API key ใดๆ)
          </p>
          {isLikelyBrokenShareLink(manualUrl) && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-[var(--color-clay)]/10 px-3 py-2 text-xs text-[var(--color-clay)]">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              ลิงก์นี้ดูเหมือนลิงก์ &quot;แชร์&quot; ปกติ ไม่ใช่ลิงก์ embed — Google จะไม่ยอมให้แสดงในหน้าเว็บ (ขึ้นเป็นช่องว่าง) กรุณาใช้โหมด
              &quot;ค้นหาสถานที่&quot; ด้านบนแทน หรือคัดลอกลิงก์จากแท็บ &quot;ฝังแผนที่&quot; ให้ถูกต้อง
            </p>
          )}
        </>
      )}

      {finalValue && !isLikelyBrokenShareLink(finalValue) && (
        <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)]">
          <p className="border-b border-[var(--color-border)] bg-[var(--color-sand)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            ตัวอย่างแผนที่ (แสดงจริงบนหน้าเว็บ)
          </p>
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe src={finalValue} className="h-48 w-full" style={{ border: 0 }} loading="lazy" />
        </div>
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
    </div>
  );
}
