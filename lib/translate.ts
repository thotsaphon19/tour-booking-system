// Free machine-translation helper used only to pre-fill a draft for the admin
// to review — it is never the source of truth. Uses MyMemory
// (https://mymemory.translated.net), a free API with no API key required.
// It's rate-limited (roughly 5,000 words/day per IP for anonymous use) and
// machine-translation quality, not human — always meant to be checked/edited
// by an admin before saving, never shown to site visitors unreviewed.

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

// MyMemory rejects queries over ~500 bytes; split long text into
// sentence-ish chunks and translate each separately, then rejoin.
const MAX_CHUNK_LENGTH = 450;

function splitIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];
  const sentences = text.split(/(?<=[.!?ๆฯ])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > MAX_CHUNK_LENGTH && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = (current + " " + sentence).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(text: string, target: string, source: string): Promise<string> {
  const url = `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return "";
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  // MyMemory returns an English error sentence inside responseData when the
  // quota is exceeded instead of an HTTP error — treat anything suspicious
  // as "no translation" rather than surface garbage to the admin.
  if (!translated || /MYMEMORY WARNING|INVALID LANGUAGE/i.test(translated)) return "";
  return translated;
}

/** Translates a single piece of text. Returns "" (never throws) on any failure
 *  so the admin form can gracefully leave that field for manual entry.
 *  `sourceLocale` defaults to "autodetect" — the admin's base fields aren't
 *  guaranteed to be Thai (they might type the primary content in English or
 *  any other language), so guessing the source rather than hardcoding Thai
 *  is what makes translating *into* Thai work correctly too. */
export async function translateText(text: string, targetLocale: string, sourceLocale = "autodetect"): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return "";
  try {
    const chunks = splitIntoChunks(trimmed);
    const translated: string[] = [];
    for (const chunk of chunks) {
      translated.push(await translateChunk(chunk, targetLocale, sourceLocale));
    }
    return translated.join(" ").trim();
  } catch {
    return "";
  }
}
