import type { AnalyzeAudioInput, AnalyzeAudioResult, AudioAnalyzer } from "./types";

/**
 * Server-side analysis stub — no paid APIs, no ML.
 * Uses duration / size heuristics + attempt index for deterministic variety.
 * Replace with real pitch/align worker via getAudioAnalyzer().
 */
export class StubAudioAnalyzer implements AudioAnalyzer {
  readonly name = "stub-v1";

  async analyze(input: AnalyzeAudioInput): Promise<AnalyzeAudioResult> {
    const { durationMs, byteLength, attemptIndex, lessonId } = input;
    const objectKey = `temp/${lessonId}/${Date.now()}.webm`;

    // S42 — silence / too short
    if (durationMs < 800 || byteLength < 400) {
      return {
        valid: false,
        invalidReason: "silence",
        scoreSummary: null,
        errorSpans: [],
        audioObjectKey: objectKey,
      };
    }

    // S44 — very short / quiet proxy
    if (durationMs < 1600 && byteLength < 2500) {
      return {
        valid: false,
        invalidReason: "too_quiet",
        scoreSummary: null,
        errorSpans: [],
        audioObjectKey: objectKey,
      };
    }

    // S43 — “noise” heuristic: very large blob for short duration (speech-ish)
    if (durationMs < 2500 && byteLength > 80_000) {
      return {
        valid: false,
        invalidReason: "noise",
        scoreSummary: null,
        errorSpans: [],
        audioObjectKey: objectKey,
      };
    }

    // Valid attempt — rotate pass / soft / fail by attempt index
    const mode = attemptIndex % 3;

    if (mode === 0) {
      // Clean pass
      return {
        valid: true,
        invalidReason: null,
        scoreSummary: {
          bandLabel: "pass",
          pitchOk: true,
          timingOk: true,
          notesDetected: 6,
        },
        errorSpans: [],
        audioObjectKey: objectKey,
      };
    }

    if (mode === 1) {
      // Soft: one low timing error — still gate-passable
      return {
        valid: true,
        invalidReason: null,
        scoreSummary: {
          bandLabel: "soft",
          pitchOk: true,
          timingOk: false,
          notesDetected: 5,
        },
        errorSpans: [
          {
            measure: 2,
            note: "Re",
            type: "timing",
            severity: "low",
            expected: "grid",
            heard: "erken",
          },
        ],
        audioObjectKey: objectKey,
      };
    }

    // Fail candidate: high pitch error
    return {
      valid: true,
      invalidReason: null,
      scoreSummary: {
        bandLabel: "fail",
        pitchOk: false,
        timingOk: true,
        notesDetected: 5,
      },
      errorSpans: [
        {
          measure: 2,
          note: "Re",
          type: "pitch",
          severity: "high",
          expected: "Re",
          heard: "Mi",
        },
      ],
      audioObjectKey: objectKey,
    };
  }
}
