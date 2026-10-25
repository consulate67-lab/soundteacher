import { estimateEnergyFromBytes } from "./demo-energy";
import type { AnalyzeAudioInput, AnalyzeAudioResult, AudioAnalyzer } from "./types";
import type { ErrorSpan } from "@/lib/attempt";

/**
 * Server-side demo analyzer — no paid APIs, no ML.
 * Uses duration + byte energy heuristics + attempt index for deterministic variety.
 * Always returns a clear valid/invalid outcome (never empty no-op).
 */
export class StubAudioAnalyzer implements AudioAnalyzer {
  readonly name = "demo-energy-v1";

  async analyze(input: AnalyzeAudioInput): Promise<AnalyzeAudioResult> {
    const { durationMs, byteLength, attemptIndex, lessonId, method, audioBuffer } =
      input;
    const objectKey = `temp/${lessonId}/${Date.now()}.webm`;
    const energy = estimateEnergyFromBytes(audioBuffer, durationMs);

    if (durationMs < 700) {
      return invalid("too_short", objectKey);
    }

    if (!energy.hasSignal || byteLength < 500) {
      return invalid("silence", objectKey);
    }

    if (energy.rms < 0.03 && byteLength < 2_000) {
      return invalid("too_quiet", objectKey);
    }

    // High payload + very short → treat as noise burst
    if (durationMs < 1800 && byteLength > 120_000 && energy.peak > 0.85) {
      return invalid("noise", objectKey);
    }

    const mode = (attemptIndex + Math.floor(energy.energyNorm * 10)) % 3;
    const notesBase = method === "2" ? 18 : 5;
    const notesDetected = notesBase + Math.round(energy.energyNorm * 6);

    if (method === "2") {
      return method2Result(mode, objectKey, notesDetected);
    }

    if (mode === 0) {
      return {
        valid: true,
        invalidReason: null,
        scoreSummary: {
          bandLabel: "pass",
          pitchOk: true,
          timingOk: true,
          notesDetected,
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
          notesDetected,
        },
        errorSpans: [
          span(2, "Re", "timing", "low", "grid", "erken"),
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
        notesDetected,
      },
      errorSpans: [span(2, "Re", "pitch", "high", "Re", "Mi")],
      audioObjectKey: objectKey,
    };
  }
}

function invalid(
  reason: NonNullable<AnalyzeAudioResult["invalidReason"]>,
  objectKey: string,
): AnalyzeAudioResult {
  return {
    valid: false,
    invalidReason: reason,
    scoreSummary: null,
    errorSpans: [],
    audioObjectKey: objectKey,
  };
}

function span(
  measure: number,
  note: string,
  type: ErrorSpan["type"],
  severity: ErrorSpan["severity"],
  expected: string,
  heard: string,
): ErrorSpan {
  return { measure, note, type, severity, expected, heard };
}

function method2Result(
  mode: number,
  objectKey: string,
  notesDetected: number,
): AnalyzeAudioResult {
  if (mode === 0) {
    return {
      valid: true,
      invalidReason: null,
      scoreSummary: {
        bandLabel: "pass",
        pitchOk: true,
        timingOk: true,
        notesDetected,
      },
      errorSpans: [span(3, "Mi", "timing", "low", "grid", "geç")],
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
        notesDetected,
      },
      errorSpans: [
        span(2, "Re", "pitch", "low", "Re", "şüpheli"),
        span(4, "Sol", "timing", "low", "grid", "erken"),
        span(5, "Fa", "timing", "low", "grid", "geç"),
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
      notesDetected,
    },
    errorSpans: [
      span(2, "Re", "pitch", "high", "Re", "Mi"),
      span(3, "Mi", "pitch", "high", "Mi", "Fa"),
      span(4, "Sol", "timing", "low", "grid", "erken"),
    ],
    audioObjectKey: objectKey,
  };
}
