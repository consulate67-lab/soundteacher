/**
 * Dilim H — optional client TTS via Web Speech API (no paid keys).
 * Pause markers `…` / `[kısa durak]` / `[nefes]` become chunk gaps.
 * Unsupported browsers → silent no-op (text bubble still shows).
 */

export type SpeakOptions = {
  /** child slightly slower; teen/adult neutral */
  rate?: number;
  lang?: string;
  onEnd?: () => void;
};

const PAUSE_RE = /(\[nefes\]|\[kısa durak\]|\.\.\.|…)/g;

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Split teacher copy into speakable chunks + pause ms. */
export function chunkTeacherSpeech(text: string): { text: string; pauseMs: number }[] {
  const parts: { text: string; pauseMs: number }[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(PAUSE_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    const slice = text.slice(last, match.index).trim();
    const pauseMs =
      match[0] === "[nefes]" ? 650 : match[0] === "[kısa durak]" ? 320 : 280;
    if (slice) parts.push({ text: slice, pauseMs });
    else if (parts.length > 0) {
      parts[parts.length - 1].pauseMs = Math.max(
        parts[parts.length - 1].pauseMs,
        pauseMs,
      );
    }
    last = match.index + match[0].length;
  }
  const tail = text.slice(last).trim();
  if (tail) parts.push({ text: tail, pauseMs: 0 });
  return parts;
}

let speakingGeneration = 0;

export function cancelSpeech() {
  speakingGeneration += 1;
  if (speechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak teacher text with intentional pauses. Returns false if unsupported.
 */
export function speakTeacherText(text: string, opts: SpeakOptions = {}): boolean {
  if (!speechSupported()) return false;

  cancelSpeech();
  const gen = speakingGeneration;
  const chunks = chunkTeacherSpeech(text);
  if (chunks.length === 0) return true;

  const rate = opts.rate ?? 0.95;
  const lang = opts.lang ?? "tr-TR";

  const speakAt = (index: number) => {
    if (gen !== speakingGeneration) return;
    if (index >= chunks.length) {
      opts.onEnd?.();
      return;
    }
    const chunk = chunks[index];
    const utter = new SpeechSynthesisUtterance(chunk.text);
    utter.rate = rate;
    utter.lang = lang;
    utter.onend = () => {
      if (gen !== speakingGeneration) return;
      if (chunk.pauseMs > 0) {
        window.setTimeout(() => speakAt(index + 1), chunk.pauseMs);
      } else {
        speakAt(index + 1);
      }
    };
    utter.onerror = () => {
      /* graceful: stop chain, keep UI text */
      opts.onEnd?.();
    };
    window.speechSynthesis.speak(utter);
  };

  speakAt(0);
  return true;
}

export function rateForBand(band: "child" | "teen" | "adult"): number {
  if (band === "child") return 0.88;
  if (band === "teen") return 0.95;
  return 1.0;
}
