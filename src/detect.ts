/** Detect whether Markdown text is RTL-dominant (FA/AR/HE vs Latin). */

const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`]+`/g;
const RTL_CHAR =
  /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_CHAR = /[A-Za-z]/g;

/** Strip fenced and inline code so code-heavy docs do not skew toward LTR falsely. */
export function stripCode(text: string): string {
  return text.replace(CODE_FENCE, " ").replace(INLINE_CODE, " ");
}

export type DetectResult = {
  rtl: boolean;
  rtlCount: number;
  ltrCount: number;
  ratio: number;
};

/**
 * Returns rtl=true when RTL letters outnumber Latin enough to treat the doc as RTL-first.
 * Empty / no letters → false (leave preview default LTR).
 */
export function detectRtlDominant(text: string, threshold = 0.35): DetectResult {
  const sample = stripCode(text);
  const rtlCount = (sample.match(RTL_CHAR) ?? []).length;
  const ltrCount = (sample.match(LATIN_CHAR) ?? []).length;
  const total = rtlCount + ltrCount;
  if (total === 0) {
    return { rtl: false, rtlCount, ltrCount, ratio: 0 };
  }
  const ratio = rtlCount / total;
  return { rtl: ratio >= threshold, rtlCount, ltrCount, ratio };
}
