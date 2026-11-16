import { dropProgress } from "../engine/gameEngine";
import {
  isWhiteKey,
  KEYBOARD_END,
  KEYBOARD_START,
  midiToName,
} from "../engine/noteChart";
import type { EngineSnapshot } from "../engine/gameEngine";

type Props = {
  snapshot: EngineSnapshot;
  fallLeadSec: number;
};

function midiToXPercent(midi: number): number {
  const whites: number[] = [];
  for (let m = KEYBOARD_START; m <= KEYBOARD_END; m++) {
    if (isWhiteKey(m)) whites.push(m);
  }
  // Map to nearest white column center; black keys sit between.
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
        const p = dropProgress(
          snapshot.musicTime,
          drop.event.time,
          fallLeadSec,
        );
        if (p < -0.05 || p > 1.15) return null;
        if (drop.result === "hit" && p >= 1) return null;

        const x = midiToXPercent(drop.event.midi);
        const y = Math.min(1, Math.max(0, p)) * 100;
        const cls = [
          "drop",
          drop.result === "hit" ? "is-hit" : "",
          drop.result === "miss" ? "is-miss" : "",
          snapshot.targetIndex < snapshot.drops.length &&
          drop.event.id === snapshot.drops[snapshot.targetIndex]?.event.id
            ? "is-target"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={drop.event.id}
            className={cls}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            title={midiToName(drop.event.midi)}
          >
            <span>{midiToName(drop.event.midi)}</span>
          </div>
        );
      })}
    </div>
  );
}
