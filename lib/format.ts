export function formatMoney(amount: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(d);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Builds a Content-Disposition header value that works for any filename,
 * including Thai (or other non-Latin-1) text.
 *
 * The bug this fixes: HTTP header values must be ByteString (Latin-1,
 * codepoints 0–255) per the Fetch/Headers spec. A filename built from a
 * Thai tour title or client name — e.g. via slugify(), which keeps all
 * Unicode letters — contains codepoints far above 255, so setting
 * `Content-Disposition: attachment; filename="<thai text>.pdf"` directly
 * throws at request time ("Cannot convert argument to a ByteString...")
 * and the whole PDF download fails before any bytes are sent.
 *
 * The fix per RFC 5987/6266: send an ASCII-safe `filename` fallback (for
 * older clients) alongside a UTF-8 percent-encoded `filename*`, which every
 * modern browser uses to show the real, correctly-accented filename.
 */
export function contentDispositionAttachment(rawFilename: string): string {
  const asciiFallback = rawFilename.replace(/[^\x20-\x7E]/g, "").replace(/["\\]/g, "").trim() || "download.pdf";
  const encoded = encodeURIComponent(rawFilename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
