import {
  isWhiteKey,
  KEYBOARD_END,
  KEYBOARD_START,
  midiToDisplayLabel,
} from "../engine/noteChart";

type Props = {
  highlightMidi: number | null;
  hitMidi: number | null;
  missMidi: number | null;
  detectedMidi: number | null;
};

function keyClass(
  midi: number,
  kind: "white" | "black",
  highlightMidi: number | null,
  hitMidi: number | null,
  missMidi: number | null,
  detectedMidi: number | null,
): string {
  return [
    "key",
    kind,
    highlightMidi === midi ? "expected" : "",
    hitMidi === midi ? "hit" : "",
    missMidi === midi ? "miss" : "",
    detectedMidi != null && Math.round(detectedMidi) === midi ? "detected" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function PianoKeyboard({ highlightMidi, hitMidi, missMidi, detectedMidi }: Props) {
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
          return (
            <div
              key={midi}
              className={keyClass(midi, "white", highlightMidi, hitMidi, missMidi, detectedMidi)}
              data-midi={midi}
              data-note-label={label}
            >
              <span className="key-label">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="keyboard-blacks">
        {blacks.map((midi) => {
          const whiteBefore = whites.filter((w) => w < midi).length;
          const leftPct =
            ((whiteBefore - 0.5) / whites.length) * 100 + 50 / whites.length;
          const label = midiToDisplayLabel(midi);
          return (
            <div
              key={midi}
              className={keyClass(midi, "black", highlightMidi, hitMidi, missMidi, detectedMidi)}
              data-midi={midi}
              data-note-label={label}
              style={{ left: `${leftPct}%` }}
              title={label}
            >
              <span className="key-label black-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
