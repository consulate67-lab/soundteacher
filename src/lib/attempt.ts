/** Attempt + GateResult product types (mimari §4.5–4.6). */

export type ListeningMethod = "1" | "2" | "3";

export type InvalidReason =
  "silence" | "noise" | "abandoned" | "denied_mic" | "too_quiet" | "too_short";

export type ErrorSpan = {
  measure: number;
  note?: string;
  type: "pitch" | "timing";
  severity: "low" | "high";
  expected?: string;
  heard?: string;
};

export type ScoreSummary = {
  bandLabel: "pass" | "soft" | "fail";
  pitchOk: boolean;
  timingOk: boolean;
  notesDetected: number;
};

export type AttemptRecord = {
  id: string;
  userId: string;
  lessonId: string;
  method: ListeningMethod;
  startedAt: string;
  endedAt: string;
  valid: boolean;
  invalidReason: InvalidReason | null;
  scoreSummary: ScoreSummary | null;
  errorSpans: ErrorSpan[];
  audioObjectKey: string | null;
  byteLength: number;
  durationMs: number;
  quotaConsumed: boolean;
};

export type GateResultRecord = {
  id: string;
  attemptId: string;
  lessonId: string;
  userId: string;
  result: "pass" | "fail";
  tolerances: {
    pitchErrorsHigh: number;
    timingErrorsHigh: number;
  };
  createdAt: string;
};

export function primaryError(spans: ErrorSpan[]): ErrorSpan | null {
  if (spans.length === 0) return null;
  const high = spans.find((s) => s.severity === "high");
  return high ?? spans[0];
}
