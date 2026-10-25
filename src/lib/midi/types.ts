/** Structured MIDI signal for Method 3 (not mic audio). */

export type MidiNoteEvent = {
  /** ms from take start */
  t: number;
  type: "on" | "off";
  /** MIDI note number 0–127 */
  note: number;
  velocity?: number;
};

export type MidiTakePayload = {
  lessonId: string;
  durationMs: number;
  events: MidiNoteEvent[];
  deviceName?: string;
};
