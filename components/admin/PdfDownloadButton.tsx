"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { PDF_LOCALES, type PdfLocale, PDF_LOCALE_LABELS } from "@/lib/pdf/pdfTranslations";

type PdfFontStyle = "sans" | "serif";

/** Download link for a generated PDF (tour brochure or proposal quotation)
 *  with a language selector (item #4) and a font-style selector (item #3),
 *  so both can be picked right where the person downloads the PDF instead
 *  of only being buried in site-wide Settings. Defaults to Thai / Sans. */
export default function PdfDownloadButton({ href, label = "ดาวน์โหลด PDF" }: { href: string; label?: string }) {
  const [lang, setLang] = useState<PdfLocale>("th");
  const [font, setFont] = useState<PdfFontStyle>("sans");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as PdfLocale)}
        className="rounded-full border border-[var(--color-jade)]/40 bg-white px-2 py-1.5 text-xs font-medium text-[var(--color-jade)] outline-none"
        aria-label="ภาษาของ PDF"
        title="ภาษาของ PDF"
      >
        {PDF_LOCALES.map((l) => (
          <option key={l} value={l}>
            {PDF_LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
      <select
        value={font}
        onChange={(e) => setFont(e.target.value as PdfFontStyle)}
        className="rounded-full border border-[var(--color-jade)]/40 bg-white px-2 py-1.5 text-xs font-medium text-[var(--color-jade)] outline-none"
        aria-label="ฟอนต์ของ PDF"
        title="ฟอนต์ของ PDF (Serif มีผลเฉพาะภาษาละติน — ไทย/ญี่ปุ่นยังใช้ฟอนต์เดิมเสมอ)"
      >
        <option value="sans">Sans-serif</option>
        <option value="serif">Serif</option>
      </select>
      <a
        href={`${href}?lang=${lang}&font=${font}`}
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-jade)] px-3 py-1.5 text-xs font-semibold text-[var(--color-jade)] hover:bg-[var(--color-jade)] hover:text-white"
      >
        <FileDown size={13} /> {label}
      </a>
    </div>
  );
}
