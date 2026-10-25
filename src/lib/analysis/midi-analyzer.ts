import type { ErrorSpan, ScoreSummary } from "@/lib/attempt";
import { expectedPatternForLesson } from "@/lib/midi/expected-pattern";
import { midiNoteLabel, midiPitchClass } from "@/lib/midi/note-names";
import type { MidiNoteEvent } from "@/lib/midi/types";
import type { AnalyzeAudioResult } from "./types";

export type AnalyzeMidiInput = {
  lessonId: string;
  userId: string;
  durationMs: number;
  events: MidiNoteEvent[];
  attemptIndex: number;
  deviceName?: string;
};

/**
 * Method 3 analyzer — structured MIDI is the signal (no mic blob).
 * Pluggable: swap for real score alignment later.
 */
export class MidiAnalyzer {
  readonly name = "midi-demo-v1";

  async analyze(input: AnalyzeMidiInput): Promise<AnalyzeAudioResult> {
    const { lessonId, durationMs, events, attemptIndex } = input;
    const objectKey = `midi://${lessonId}/${Date.now()}`;

    const noteOns = events
      .filter((e) => e.type === "on" && (e.velocity ?? 1) > 0)
      .sort((a, b) => a.t - b.t);

    if (durationMs < 600) {
      return invalid("too_short", objectKey);
    }
    if (noteOns.length < 2) {
      return invalid("silence", objectKey);
    }

    const expected = expectedPatternForLesson(lessonId);
    const errorSpans: ErrorSpan[] = [];
    let pitchOk = true;
    let timingOk = true;

    // Align sequential expected pitch classes to played notes (simple greedy)
    let ei = 0;
    for (let i = 0; i < noteOns.length && ei < expected.pitchClasses.length; i++) {
      const played = noteOns[i]!;
      const want = expected.pitchClasses[ei]!;
      const got = midiPitchClass(played.note);
      if (got !== want) {
        pitchOk = false;
        errorSpans.push({
          measure: Math.floor(i / 2) + 1,
          note: midiNoteLabel(played.note).split(" ")[0],
          type: "pitch",
          severity: "high",
          expected: pcName(want),
          heard: pcName(got),
        });
      }
      ei += 1;
    }

    // Timing: large IOI variance vs median → soft timing error
    if (noteOns.length >= 3) {
      const iois: number[] = [];
      for (let i = 1; i < noteOns.length; i++) {
        iois.push(noteOns[i]!.t - noteOns[i - 1]!.t);
      }
      const median = [...iois].sort((a, b) => a - b)[Math.floor(iois.length / 2)]!;
      const jitter = iois.filter((x) => Math.abs(x - median) > median * 0.55).length;
      if (jitter >= 2 && median > 80) {
        timingOk = false;
        errorSpans.push({
          measure: 2,
          note: expected.label,
          type: "timing",
          severity: "low",
          expected: "düzenli nabız",
          heard: "düzensiz",
        });
      }
    }

    // Rotate soft pass when clean for variety on retries
    const mode = attemptIndex % 3;
    if (errorSpans.length === 0 && mode === 1) {
      timingOk = false;
      errorSpans.push({
        measure: 1,
        note: pcName(expected.pitchClasses[0] ?? 0),
        type: "timing",
        severity: "low",
        expected: "grid",
        heard: "acele",
      });
    }

    const highPitch = errorSpans.filter(
      (e) => e.type === "pitch" && e.severity === "high",
    ).length;

    let bandLabel: ScoreSummary["bandLabel"] = "pass";
    if (highPitch >= 2) bandLabel = "fail";
    else if (!pitchOk || !timingOk) bandLabel = "soft";

    return {
      valid: true,
      invalidReason: null,
      scoreSummary: {
        bandLabel,
        pitchOk,
        timingOk,
        notesDetected: noteOns.length,
      },
      errorSpans: errorSpans.slice(0, 6),
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

function pcName(pc: number): string {
  const names = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
  return names[((pc % 12) + 12) % 12]!;
}

export function getMidiAnalyzer(): MidiAnalyzer {
  return new MidiAnalyzer();
}
