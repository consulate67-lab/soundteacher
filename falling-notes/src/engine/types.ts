/** MIDI note number (60 = C4 / middle C). */
export type MidiNote = number;

export type NoteEvent = {
  id: string;
  /** Absolute start time in the chart at 1.0× tempo (seconds). */
  time: number;
  /** Duration at 1.0× tempo (seconds). */
  duration: number;
  midi: MidiNote;
};

/** Exercise type / content category (Turkish UI labels via catalog). */
export type ChartCategory = "gam" | "teknik" | "cocuk" | "klasik" | "halk" | "populer";

/** Top-level song-menu language / repertoire group. */
export type ChartLocale = "turkce" | "yabanci";

/** Pedagogical difficulty band. */
export type ChartDifficulty = "baslangic" | "orta" | "ileri";

export type Chart = {
  id: string;
  title: string;
  /** Beats per minute of the chart’s written tempo. */
  bpm: number;
  notes: NoteEvent[];
  category: ChartCategory;
  difficulty: ChartDifficulty;
  /** Türkçe vs Yabancı grouping for the left-side song list. */
  locale: ChartLocale;
};

export type MatchResult = "hit" | "miss" | "pending";

export type ActiveDrop = {
  event: NoteEvent;
  /** Scaled start time in game clock seconds. */
  startScaled: number;
  /** Scaled duration in game clock seconds. */
  durationScaled: number;
  result: MatchResult;
  /** 0–1 hold progress toward required duration (target only). */
  holdProgress: number;
  /** True once the correct pitch has been attacked for this note. */
  attacked: boolean;
};

export type GamePhase =
  "idle" | "countdown" | "playing" | "waiting" | "holding" | "finished";

export type GameConfig = {
  /** Clock/tempo scale: 0.5 = half speed (notes take 2× wall time). */
  tempoScale: number;
  /** Hit window half-width in chart-time ms (±) for attack onset. */
  hitWindowMs: number;
  /** Pause scroll until correct pitch is heard (and held when required). */
  waitForNote: boolean;
  /** Play reference synth tones at the same tempo. */
  referenceAudio: boolean;
};

export type PitchSample = {
  frequency: number | null;
  midi: number | null;
  clarity: number;
  timestamp: number;
};
