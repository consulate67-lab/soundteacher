import { isWhiteKey } from "./noteChart";

/** Pitch-class → drop / key identity color (stable mapping for tablet readability). */
const PITCH_COLORS: readonly string[] = [
  "#e85d4c", // C  — coral
  "#c44d3a", // C#
  "#f0a202", // D  — amber
  "#d48900", // D#
  "#e8c547", // E  — gold
  "#4caf70", // F  — green
  "#2f8f55", // F#
  "#2f9e9e", // G  — teal
  "#217a7a", // G#
  "#4f7fd6", // A  — blue
  "#3a5fb5", // A#
  "#8b6cc7", // B  — violet
];

export type KeyColorSet = {
  /** Solid identity color (drops, expected key glow). */
  base: string;
  /** Lighter edge for drop gradient. */
  light: string;
  /** Darker edge for drop gradient / black keys. */
  dark: string;
  /** Soft wash for idle white keys. */
  wash: string;
  /** Text contrast on the drop label. */
  ink: string;
};

function mixHex(hex: string, toward: string, t: number): string {
  const parse = (h: string) => {
    const n = h.replace("#", "");
    return [
      parseInt(n.slice(0, 2), 16),
      parseInt(n.slice(2, 4), 16),
      parseInt(n.slice(4, 6), 16),
    ] as const;
  };
  const [r0, g0, b0] = parse(hex);
  const [r1, g1, b1] = parse(toward);
  const r = Math.round(r0 + (r1 - r0) * t);
  const g = Math.round(g0 + (g1 - g0) * t);
  const b = Math.round(b0 + (b1 - b0) * t);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Identity colors for a MIDI pitch — shared by falling drops and piano keys. */
export function midiToKeyColors(midi: number): KeyColorSet {
  const pc = ((midi % 12) + 12) % 12;
  const base = PITCH_COLORS[pc]!;
  const light = mixHex(base, "#ffffff", 0.35);
  const dark = mixHex(base, "#0a0908", isWhiteKey(midi) ? 0.28 : 0.45);
  const wash = mixHex(base, "#f7f1e8", 0.72);
  const ink = luminance(base) > 0.55 ? "#1a1410" : "#f7f1e8";
  return { base, light, dark, wash, ink };
}

/** CSS variables object for a key / drop. */
export function midiColorStyle(midi: number): Record<string, string> {
  const c = midiToKeyColors(midi);
  return {
    "--note-base": c.base,
    "--note-light": c.light,
    "--note-dark": c.dark,
    "--note-wash": c.wash,
    "--note-ink": c.ink,
  };
}
