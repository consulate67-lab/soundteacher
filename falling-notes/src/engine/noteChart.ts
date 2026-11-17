export {
  NOTE,
  CHARTS,
  DEMO_CHART,
  getChartById,
  buildChart,
  catalogStats,
  chartHasBlackKeys,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  CATEGORY_ORDER,
  DIFFICULTY_ORDER,
} from "./catalog";

/** Turkish solfege for pitch classes (UI locale = TR). */
const SOLFEGE_TR = [
  "Do",
  "Do#",
  "Re",
  "Re#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
] as const;

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
] as const;

/**
 * Pedagogical octave for beginner labels:
 * scientific C4 (MIDI 60) → 1, C5 → 2 (matches product “C1 / C2” / Do1 / Do2).
 */
export function pedagogicalOctave(midi: number): number {
  return Math.floor(midi / 12) - 1 - 3;
}

/** Scientific pitch name, e.g. C4. */
export function midiToName(midi: number): string {
  const name = NOTE_NAMES_SHARP[((midi % 12) + 12) % 12]!;
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

/**
 * Visible drop / key label for Turkish UI: Do1, Re1, Do2, …
 * Keeps C1/C2-style octave distinction via pedagogical numbering.
 */
export function midiToDisplayLabel(midi: number): string {
  const sol = SOLFEGE_TR[((midi % 12) + 12) % 12]!;
  return `${sol}${pedagogicalOctave(midi)}`;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/** White-key MIDI range on the on-screen keyboard (C3–C5). */
export const KEYBOARD_START = 48; // C3 / Do0
export const KEYBOARD_END = 72; // C5 / Do2

export function isWhiteKey(midi: number): boolean {
  const pc = ((midi % 12) + 12) % 12;
  return [0, 2, 4, 5, 7, 9, 11].includes(pc);
}
