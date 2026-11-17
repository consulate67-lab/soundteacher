import type { CSSProperties } from "react";
import { midiColorStyle } from "../engine/noteColors";
import {
  isWhiteKey,
  KEYBOARD_END,
  KEYBOARD_START,
  midiToDisplayLabel,
} from "../engine/noteChart";

type Props = {
  /** Expected keys for the current chord group (1–n simultaneous). */
  highlightMidis: number[];
  hitMidis: number[];
  missMidis: number[];
  detectedMidi: number | null;
  /** True while the current target is being held. */
  holding?: boolean;
  holdProgress?: number;
};

function keyClass(
  midi: number,
  kind: "white" | "black",
  highlightMidis: number[],
  hitMidis: number[],
  missMidis: number[],
  detectedMidi: number | null,
  holding: boolean,
): string {
  const expected = highlightMidis.includes(midi);
  return [
    "key",
    kind,
    expected ? "expected" : "",
    expected && holding ? "holding" : "",
    hitMidis.includes(midi) ? "hit" : "",
    missMidis.includes(midi) ? "miss" : "",
    detectedMidi != null && Math.round(detectedMidi) === midi ? "detected" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function PianoKeyboard({
  highlightMidis,
  hitMidis,
  missMidis,
  detectedMidi,
  holding = false,
  holdProgress = 0,
}: Props) {
  const keys: number[] = [];
  for (let m = KEYBOARD_START; m <= KEYBOARD_END; m++) keys.push(m);

  const whites = keys.filter(isWhiteKey);
  const blacks = keys.filter((m) => !isWhiteKey(m));

  return (
    <div className="keyboard" aria-label="Piyano klavyesi" role="group">
      <div className="keyboard-rail" aria-hidden />
      <div className="keyboard-whites">
        {whites.map((midi) => {
          const label = midiToDisplayLabel(midi);
          const colors = midiColorStyle(midi);
          const expected = highlightMidis.includes(midi);
          return (
            <div
              key={midi}
              className={keyClass(
                midi,
                "white",
                highlightMidis,
                hitMidis,
                missMidis,
                detectedMidi,
                holding,
              )}
              data-midi={midi}
              data-note-label={label}
              data-black-key="false"
              style={
                {
                  ...colors,
                  ...(expected && holding
                    ? { ["--hold-pct" as string]: `${Math.round(holdProgress * 100)}%` }
                    : {}),
                } as CSSProperties
              }
            >
              <span className="key-label">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="keyboard-blacks" aria-hidden={false}>
        {blacks.map((midi) => {
          const whiteBefore = whites.filter((w) => w < midi).length;
          const leftPct = (whiteBefore / whites.length) * 100;
          const label = midiToDisplayLabel(midi);
          const colors = midiColorStyle(midi);
          return (
            <div
              key={midi}
              className={keyClass(
                midi,
                "black",
                highlightMidis,
                hitMidis,
                missMidis,
                detectedMidi,
                holding,
              )}
              data-midi={midi}
              data-note-label={label}
              data-black-key="true"
              style={{ left: `${leftPct}%`, ...colors }}
              title={`${label} · siyah tuş`}
            >
              <span className="key-label black-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
