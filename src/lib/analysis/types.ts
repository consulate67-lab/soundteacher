import type { ErrorSpan, InvalidReason, ScoreSummary } from "@/lib/attempt";

/**
 * Pluggable audio analyzer (Dilim E).
 * Stub today; swap for Python worker / WASM pitch later without changing UI.
 */
export type AnalyzeAudioInput = {
  lessonId: string;
  userId: string;
  method: "1" | "2";
  durationMs: number;
  byteLength: number;
  /** Raw audio bytes available for future real models — stub ignores content. */
  audioBuffer?: ArrayBuffer;
  attemptIndex: number;
};

export type AnalyzeAudioResult = {
  valid: boolean;
  invalidReason: InvalidReason | null;
  scoreSummary: ScoreSummary | null;
  errorSpans: ErrorSpan[];
  /** Object key placeholder after “upload” (Saklama A: not retained). */
  audioObjectKey: string | null;
};

export interface AudioAnalyzer {
  readonly name: string;
  analyze(input: AnalyzeAudioInput): Promise<AnalyzeAudioResult>;
}
