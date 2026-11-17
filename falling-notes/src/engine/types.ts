/** MIDI note number (60 = C4 / middle C). */
export type MidiNote = number;

export type NoteEvent = {
  id: string;
  /** Absolute start time in the chart at 1.0× tempo (seconds). */
  time: number;
  /** Duration at 1.0× tempo (seconds). */
  duration: number;
  midi: MidiNote;
  /**
   * Shared id for simultaneous voices (dyad/chord). Notes with the same
   * `chordId` share onset; engine treats them as one attack target.
   */
  chordId?: string;
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
  /**
   * Performance BPM (1:1 original feel). Chart note times are authored at this
   * tempo; `tempoScale` slows wall-clock practice relative to it (1 = live).
   */
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
  /** True for every voice in the current simultaneous target group. */
  isTarget: boolean;
};

export type GamePhase =
  "idle" | "countdown" | "playing" | "waiting" | "holding" | "finished";

export type GameConfig = {
  /**
   * Wall-clock scale vs chart performance BPM.
   * 1 = 1:1 performans; 0.75 / 0.5 = alıştırma slowdown.
   */
  tempoScale: number;
  /** Hit window half-width in chart-time ms (±) for attack onset. */
  hitWindowMs: number;
  /** Pause scroll until correct pitch is heard (and held when required). */
  waitForNote: boolean;
  /** Play pitched piano samples in sync with falling notes. */
  referenceAudio: boolean;
};

export type PitchSample = {
  frequency: number | null;
  midi: number | null;
  clarity: number;
  timestamp: number;
};
