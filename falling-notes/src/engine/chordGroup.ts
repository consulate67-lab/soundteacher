import type { NoteEvent } from "./types";

/** Notes that share an onset (same time / chordId) starting at `index`. */
export function chordGroupAt(notes: NoteEvent[], index: number): NoteEvent[] {
  const first = notes[index];
  if (!first) return [];
  const group = [first];
  for (let i = index + 1; i < notes.length; i++) {
    const n = notes[i]!;
    const sameChord =
      first.chordId != null && n.chordId != null
        ? n.chordId === first.chordId
        : Math.abs(n.time - first.time) < 1e-9;
    if (!sameChord) break;
    group.push(n);
  }
  return group;
}

/** True if `midi` matches any voice in the group (monophonic mic). */
export function pitchInGroup(group: NoteEvent[], midi: number): boolean {
  const rounded = Math.round(midi);
  return group.some((n) => n.midi === rounded);
}

/** Midis in a group, low → high. */
export function groupMidis(group: NoteEvent[]): number[] {
  return [...new Set(group.map((n) => n.midi))].sort((a, b) => a - b);
}

/** Written duration used for hold matching (longest voice). */
export function groupHoldDuration(group: NoteEvent[]): number {
  if (group.length === 0) return 0;
  return Math.max(...group.map((n) => n.duration));
}
