const NAMES = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"] as const;

/** Turkish-ish note label from MIDI number (C4 = 60 → Do). */
export function midiNoteLabel(note: number): string {
  const n = ((note % 12) + 12) % 12;
  const octave = Math.floor(note / 12) - 1;
  return `${NAMES[n]} (${octave})`;
}

export function midiPitchClass(note: number): number {
  return ((note % 12) + 12) % 12;
}
