// -----------------------------------------------------------------------------
// Thai-safe line wrapping for react-pdf
// -----------------------------------------------------------------------------
// react-pdf (via pdfkit) has no real text-shaping engine — it just measures
// and places one Unicode code point at a time. Thai script has no spaces
// between words, so react-pdf's normal word-based wrapping sees an entire
// Thai sentence as a single unbreakable "word." When that "word" is wider
// than the page, react-pdf falls back to force-breaking it one code point
// at a time to avoid overflowing forever — and that fallback doesn't know
// that Thai tone marks and vowel signs (ั ิ ี ึ ื ุ ู ่ ้ ๊ ๋ ์ ํ ำ etc.) must
// stay attached to the consonant right before them. A break landing between
// a consonant and its mark orphans the mark onto the next line, so it gets
// drawn out of order — e.g. "สำราญ" corrupting into something like "สำาราญ"
// or the mark appearing much later in the line than it should.
//
// The fix: give react-pdf a real set of safe break points instead of one
// giant unbreakable word. `Font.registerHyphenationCallback` expects a
// function that splits a "word" into pieces that may be wrapped between —
// so here each piece is one Thai grapheme cluster (a base character plus
// any combining marks glued to it). react-pdf can then wrap between any two
// clusters, but never inside one, so lines wrap normally without ever
// splitting a mark away from its base character.
const THAI_COMBINING_MARK = /[\u0E31\u0E33-\u0E3A\u0E47-\u0E4E]/;

export function thaiSafeHyphenation(word: string): string[] {
  const clusters: string[] = [];
  for (const ch of word) {
    if (clusters.length > 0 && THAI_COMBINING_MARK.test(ch)) {
      clusters[clusters.length - 1] += ch;
    } else {
      clusters.push(ch);
    }
  }
  return clusters;
}
