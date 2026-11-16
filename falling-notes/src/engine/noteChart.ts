import type { Chart } from "./types";

const NOTE = {
  C4: 60,
  D4: 62,
  E4: 64,
  F4: 65,
  G4: 67,
  A4: 69,
  B4: 71,
  C5: 72,
} as const;

/**
 * Original beginner demo — “Do–Re–Mi Egzersizi”.
 * Hardcoded chart (not a copyrighted song). Quarter = 1 beat at 80 BPM.
 */
export const DEMO_CHART: Chart = {
  id: "do-re-mi-egzersizi",
  title: "Do–Re–Mi Egzersizi",
  bpm: 80,
  notes: (() => {
    const beat = 60 / 80; // 0.75 s
    const seq: { midi: number; beats: number }[] = [
      { midi: NOTE.C4, beats: 1 },
      { midi: NOTE.D4, beats: 1 },
      { midi: NOTE.E4, beats: 1 },
      { midi: NOTE.C4, beats: 1 },
      { midi: NOTE.E4, beats: 1 },
      { midi: NOTE.D4, beats: 1 },
      { midi: NOTE.C4, beats: 2 },
      { midi: NOTE.G4, beats: 1 },
      { midi: NOTE.F4, beats: 1 },
      { midi: NOTE.E4, beats: 1 },
      { midi: NOTE.D4, beats: 1 },
      { midi: NOTE.C4, beats: 1 },
      { midi: NOTE.D4, beats: 1 },
      { midi: NOTE.E4, beats: 2 },
      { midi: NOTE.C4, beats: 1 },
      { midi: NOTE.E4, beats: 1 },
      { midi: NOTE.G4, beats: 1 },
      { midi: NOTE.E4, beats: 1 },
      { midi: NOTE.C5, beats: 2 },
      { midi: NOTE.C4, beats: 2 },
    ];
    let t = 1.0; // 1 s lead-in
    return seq.map((n, i) => {
      const duration = n.beats * beat;
      const event = {
        id: `n${i}`,
        time: t,
        duration,
        midi: n.midi,
      };
      t += duration;
      return event;
    });
  })(),
};

const NOTE_NAMES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function midiToName(midi: number): string {
  const name = NOTE_NAMES_SHARP[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/** White-key MIDI range shown on the on-screen keyboard (C3–B4). */
export const KEYBOARD_START = 48; // C3
export const KEYBOARD_END = 71; // B4

export function isWhiteKey(midi: number): boolean {
  const pc = ((midi % 12) + 12) % 12;
  return [0, 2, 4, 5, 7, 9, 11].includes(pc);
}
