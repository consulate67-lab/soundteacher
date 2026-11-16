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

export type Chart = {
  id: string;
  title: string;
  /** Beats per minute of the chart’s written tempo. */
  bpm: number;
  notes: NoteEvent[];
};

export type MatchResult = "hit" | "miss" | "pending";

export type ActiveDrop = {
  event: NoteEvent;
  /** Scaled start time in game clock seconds. */
  startScaled: number;
  /** Scaled duration in game clock seconds. */
  durationScaled: number;
  result: MatchResult;
};

export type GamePhase =
  | "idle"
  | "countdown"
  | "playing"
  | "waiting"
  | "finished";

export type GameConfig = {
  /** Clock/tempo scale: 0.5 = half speed (notes take 2× wall time). */
  tempoScale: number;
  /** Hit window half-width in wall-clock ms (±). */
  hitWindowMs: number;
  /** Pause scroll until correct pitch is heard. */
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
