import type { Chart, NoteEvent } from "./types";

/** MIDI helpers for C-major beginner charts. */
export const NOTE = {
  C3: 48,
  D3: 50,
  E3: 52,
  F3: 53,
  G3: 55,
  A3: 57,
  B3: 59,
  C4: 60,
  D4: 62,
  E4: 64,
  F4: 65,
  G4: 67,
  A4: 69,
  B4: 71,
  C5: 72,
  D5: 74,
  E5: 76,
} as const;

type SeqNote = { midi: number; beats: number };

function buildChart(
  id: string,
  title: string,
  bpm: number,
  seq: SeqNote[],
  leadInBeats = 1,
): Chart {
  const beat = 60 / bpm;
  let t = leadInBeats * beat;
  const notes: NoteEvent[] = seq.map((n, i) => {
    const duration = n.beats * beat;
    const event: NoteEvent = {
      id: `${id}-n${i}`,
      time: t,
      duration,
      midi: n.midi,
    };
    t += duration;
    return event;
  });
  return { id, title, bpm, notes };
}

/**
 * Original beginner demo — “Do–Re–Mi Egzersizi”.
 * Hardcoded chart (not a copyrighted song).
 */
export const DEMO_CHART: Chart = buildChart(
  "do-re-mi-egzersizi",
  "Do–Re–Mi Egzersizi",
  80,
  [
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
  ],
);

/** Public-domain nursery motif — Twinkle Twinkle / Küçük Yıldız. */
export const TWINKLE_CHART: Chart = buildChart(
  "kucuk-yildiz",
  "Küçük Yıldız (Twinkle)",
  90,
  [
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.A4, beats: 1 },
    { midi: NOTE.A4, beats: 1 },
    { midi: NOTE.G4, beats: 2 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 2 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 2 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.A4, beats: 1 },
    { midi: NOTE.A4, beats: 1 },
    { midi: NOTE.G4, beats: 2 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
  ],
);

/** Public-domain — Mary Had a Little Lamb. */
export const MARY_CHART: Chart = buildChart("mary-kuzu", "Mary’nin Kuzusu", 92, [
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.C4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.E4, beats: 2 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.D4, beats: 2 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.G4, beats: 1 },
  { midi: NOTE.G4, beats: 2 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.C4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.E4, beats: 1 },
  { midi: NOTE.D4, beats: 1 },
  { midi: NOTE.C4, beats: 2 },
]);

/** Public-domain — Hot Cross Buns. */
export const HOT_CROSS_BUNS_CHART: Chart = buildChart(
  "sicak-corekler",
  "Sıcak Çörekler (Hot Cross Buns)",
  88,
  [
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
    { midi: NOTE.C4, beats: 0.5 },
    { midi: NOTE.C4, beats: 0.5 },
    { midi: NOTE.C4, beats: 0.5 },
    { midi: NOTE.C4, beats: 0.5 },
    { midi: NOTE.D4, beats: 0.5 },
    { midi: NOTE.D4, beats: 0.5 },
    { midi: NOTE.D4, beats: 0.5 },
    { midi: NOTE.D4, beats: 0.5 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
  ],
);

/** Public-domain Beethoven motif — Ode to Joy. */
export const ODE_TO_JOY_CHART: Chart = buildChart(
  "neseye-ovgu",
  "Neşeye Övgü (Ode to Joy)",
  86,
  [
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1.5 },
    { midi: NOTE.D4, beats: 0.5 },
    { midi: NOTE.D4, beats: 2 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1.5 },
    { midi: NOTE.C4, beats: 0.5 },
    { midi: NOTE.C4, beats: 2 },
  ],
);

/** Public-domain — Yankee Doodle (simplified C-major motif). */
export const YANKEE_DOODLE_CHART: Chart = buildChart(
  "yankee-doodle",
  "Yankee Doodle",
  100,
  [
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 2 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
    { midi: NOTE.B3, beats: 2 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.B3, beats: 1 },
    { midi: NOTE.G3, beats: 1 },
    { midi: NOTE.A3, beats: 1 },
    { midi: NOTE.B3, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
    { midi: NOTE.C4, beats: 2 },
  ],
);

/** Public-domain motif — Jingle Bells (1857). */
export const JINGLE_BELLS_CHART: Chart = buildChart(
  "jingil-ziller",
  "Şıngırdak Ziller (Jingle Bells)",
  100,
  [
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 2 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 2 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.C4, beats: 1.5 },
    { midi: NOTE.D4, beats: 0.5 },
    { midi: NOTE.E4, beats: 4 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.F4, beats: 1.5 },
    { midi: NOTE.F4, beats: 0.5 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.E4, beats: 0.5 },
    { midi: NOTE.E4, beats: 0.5 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 2 },
    { midi: NOTE.G4, beats: 2 },
  ],
);

/** Scale drill — C major ascending/descending with Do1→Do2. */
export const C_MAJOR_SCALE_CHART: Chart = buildChart(
  "do-majork-gam",
  "Do Majör Gam (Do1–Do2)",
  72,
  [
    { midi: NOTE.C4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.A4, beats: 1 },
    { midi: NOTE.B4, beats: 1 },
    { midi: NOTE.C5, beats: 2 },
    { midi: NOTE.B4, beats: 1 },
    { midi: NOTE.A4, beats: 1 },
    { midi: NOTE.G4, beats: 1 },
    { midi: NOTE.F4, beats: 1 },
    { midi: NOTE.E4, beats: 1 },
    { midi: NOTE.D4, beats: 1 },
    { midi: NOTE.C4, beats: 2 },
  ],
);

/** All selectable exercises (songs + drills). */
export const CHARTS: Chart[] = [
  DEMO_CHART,
  C_MAJOR_SCALE_CHART,
  HOT_CROSS_BUNS_CHART,
  MARY_CHART,
  TWINKLE_CHART,
  ODE_TO_JOY_CHART,
  YANKEE_DOODLE_CHART,
  JINGLE_BELLS_CHART,
];

export function getChartById(id: string): Chart {
  return CHARTS.find((c) => c.id === id) ?? DEMO_CHART;
}

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
