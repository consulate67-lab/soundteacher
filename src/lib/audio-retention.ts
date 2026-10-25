/**
 * Dilim H — Saklama A (MVP privacy default).
 *
 * Policy (dinleme-ve-ogretmen-konusmasi.md §C):
 * After analysis, discard raw audio. Persist only Attempt summary
 * (scoreSummary, errorSpans, validity). No long-lived blob storage.
 *
 * Alternatives (not MVP default):
 * - Saklama B: keep 24–72h for retry/appeal
 * - Saklama C: member-opt-in practice archive
 *
 * This module is the code-path stub for that lifecycle. Real S3 delete
 * will call the object store; mock clears in-memory references.
 */

import { log } from "./logger";

export const AUDIO_RETENTION_POLICY = "saklama-a" as const;

export type DiscardAudioInput = {
  audioObjectKey: string | null;
  attemptId?: string;
  lessonId?: string;
  userId?: string;
  /** Bytes held only for the analysis call — never persisted after discard. */
  byteLength?: number;
};

export type DiscardAudioResult = {
  policy: typeof AUDIO_RETENTION_POLICY;
  discarded: true;
  /** Always null after Saklama A — Attempt must not retain a live key. */
  audioObjectKey: null;
  formerKey: string | null;
};

/**
 * Discard / delete raw audio after analysis. Mock OK: no object store yet.
 * Callers must assign `audioObjectKey: null` on the persisted Attempt.
 */
export function discardAudioAfterAnalysis(input: DiscardAudioInput): DiscardAudioResult {
  const formerKey = input.audioObjectKey;
  // Future: await s3.deleteObject(formerKey) when S3_* is configured.
  log.info("audio.discard", {
    policy: AUDIO_RETENTION_POLICY,
    formerKey,
    attemptId: input.attemptId ?? null,
    lessonId: input.lessonId ?? null,
    userId: input.userId ?? null,
    byteLength: input.byteLength ?? null,
  });
  return {
    policy: AUDIO_RETENTION_POLICY,
    discarded: true,
    audioObjectKey: null,
    formerKey,
  };
}

/** Client hint: clear local chunks / revoke blob URLs after upload. */
export function clientDiscardHint(): string {
  return "saklama-a: clear local MediaRecorder chunks after analyze response";
}
