import { dropProgress, durationBeats } from "../engine/gameEngine";
import { midiColorStyle } from "../engine/noteColors";
import {
  isWhiteKey,
  KEYBOARD_END,
  KEYBOARD_START,
  midiToDisplayLabel,
  midiToName,
} from "../engine/noteChart";
import type { EngineSnapshot } from "../engine/gameEngine";

type Props = {
  snapshot: EngineSnapshot;
  fallLeadSec: number;
};

/** Visual height (rem) from written duration — quarter ≈ base, half/whole taller. */
function dropHeightRem(durationSec: number, bpm: number): number {
  const beats = durationBeats(durationSec, bpm);
  return Math.min(11, Math.max(3.4, 2.6 + beats * 1.35));
}

function midiToXPercent(midi: number): number {
  const whites: number[] = [];
  for (let m = KEYBOARD_START; m <= KEYBOARD_END; m++) {
    if (isWhiteKey(m)) whites.push(m);
  }
  if (isWhiteKey(midi)) {
    const idx = whites.indexOf(midi);
    return ((idx + 0.5) / whites.length) * 100;
  }
  const below = [...whites].reverse().find((w) => w < midi) ?? whites[0]!;
  const above = whites.find((w) => w > midi) ?? whites[whites.length - 1]!;
  const i0 = whites.indexOf(below);
  const i1 = whites.indexOf(above);
  return ((i0 + i1 + 1) / 2 / whites.length) * 100;
}

export function FallingNotesStage({ snapshot, fallLeadSec }: Props) {
  return (
    <div className="stage" aria-label="Düşen notalar sahnesi">
      <div className="hit-line" />
      {snapshot.drops.map((drop) => {
        const p = dropProgress(snapshot.musicTime, drop.event.time, fallLeadSec);
        if (p < -0.05 || p > 1.2) return null;
        if (drop.result === "hit" && p >= 1 && drop.holdProgress >= 1) return null;

        const x = midiToXPercent(drop.event.midi);
        const y = Math.min(1, Math.max(0, p)) * 100;
        const label = midiToDisplayLabel(drop.event.midi);
        const heightRem = dropHeightRem(drop.event.duration, snapshot.bpm);
        const beats = durationBeats(drop.event.duration, snapshot.bpm);
        const isTarget = drop.isTarget;
        const black = !isWhiteKey(drop.event.midi);
        const chord = drop.event.chordId != null;
        const cls = [
          "drop",
          black ? "is-black-key" : "is-white-key",
          chord ? "is-chord-voice" : "",
          drop.result === "hit" ? "is-hit" : "",
          drop.result === "miss" ? "is-miss" : "",
          isTarget ? "is-target" : "",
          drop.attacked ? "is-holding" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const colors = midiColorStyle(drop.event.midi);

        return (
          <div
            key={drop.event.id}
            className={cls}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              height: `${heightRem}rem`,
              ...colors,
            }}
            title={`${label} · ${beats.toFixed(beats % 1 === 0 ? 0 : 1)} vuruş (${midiToName(drop.event.midi)})${black ? " · siyah tuş" : ""}${chord ? " · akor" : ""}`}
            data-note-label={label}
            data-midi={drop.event.midi}
            data-beats={beats}
            data-black-key={black ? "true" : "false"}
            data-chord={chord ? "true" : "false"}
          >
            <div
              className="drop-hold-fill"
              style={{ height: `${Math.round(drop.holdProgress * 100)}%` }}
              aria-hidden
            />
            {black && (
              <span className="drop-sharp-badge" aria-hidden>
                #
              </span>
            )}
            <span className="drop-label">{label}</span>
            <span className="drop-beats" aria-hidden>
              {beats >= 3.5 ? "4" : beats >= 1.75 ? "2" : beats >= 0.9 ? "1" : "½"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
