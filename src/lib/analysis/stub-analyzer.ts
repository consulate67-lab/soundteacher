import type { AnalyzeAudioInput, AnalyzeAudioResult, AudioAnalyzer } from "./types";

/**
 * Server-side analysis stub — no paid APIs, no ML.
 * Uses duration / size heuristics + attempt index for deterministic variety.
 * Method 2 returns a longer ordered error list (end-of-piece report).
 */
export class StubAudioAnalyzer implements AudioAnalyzer {
  readonly name = "stub-v1";

  async analyze(input: AnalyzeAudioInput): Promise<AnalyzeAudioResult> {
    const { durationMs, byteLength, attemptIndex, lessonId, method } = input;
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

    // S43 — “noise” heuristic
    if (durationMs < 2500 && byteLength > 80_000) {
      return {
        valid: false,
        invalidReason: "noise",
        scoreSummary: null,
        errorSpans: [],
        audioObjectKey: objectKey,
      };
    }

    const mode = attemptIndex % 3;

    if (method === "2") {
      return method2Result(mode, objectKey);
    }

    if (mode === 0) {
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

function method2Result(mode: number, objectKey: string): AnalyzeAudioResult {
  if (mode === 0) {
    return {
      valid: true,
      invalidReason: null,
      scoreSummary: {
        bandLabel: "pass",
        pitchOk: true,
        timingOk: true,
        notesDetected: 24,
      },
      // Ordered: pitch first, then timing (product rule)
      errorSpans: [
        {
          measure: 3,
          note: "Mi",
          type: "timing",
          severity: "low",
          expected: "grid",
          heard: "geç",
        },
      ],
      audioObjectKey: objectKey,
    };
  }

  if (mode === 1) {
    return {
      valid: true,
      invalidReason: null,
      scoreSummary: {
        bandLabel: "soft",
        pitchOk: false,
        timingOk: false,
        notesDetected: 22,
      },
      errorSpans: [
        {
          measure: 2,
          note: "Re",
          type: "pitch",
          severity: "low",
          expected: "Re",
          heard: "şüpheli",
        },
        {
          measure: 4,
          note: "Sol",
          type: "timing",
          severity: "low",
          expected: "grid",
          heard: "erken",
        },
        {
          measure: 5,
          note: "Fa",
          type: "timing",
          severity: "low",
          expected: "grid",
          heard: "geç",
        },
      ],
      audioObjectKey: objectKey,
    };
  }

  return {
    valid: true,
    invalidReason: null,
    scoreSummary: {
      bandLabel: "fail",
      pitchOk: false,
      timingOk: false,
      notesDetected: 20,
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
      {
        measure: 3,
        note: "Mi",
        type: "pitch",
        severity: "high",
        expected: "Mi",
        heard: "Fa",
      },
      {
        measure: 4,
        note: "Sol",
        type: "timing",
        severity: "low",
        expected: "grid",
        heard: "erken",
      },
    ],
    audioObjectKey: objectKey,
  };
}
