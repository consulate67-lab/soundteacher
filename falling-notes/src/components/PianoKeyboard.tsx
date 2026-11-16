import {
  isWhiteKey,
  KEYBOARD_END,
  KEYBOARD_START,
  midiToName,
} from "../engine/noteChart";

type Props = {
  highlightMidi: number | null;
  hitMidi: number | null;
  missMidi: number | null;
  detectedMidi: number | null;
};

export function PianoKeyboard({ highlightMidi, hitMidi, missMidi, detectedMidi }: Props) {
  const keys: number[] = [];
  for (let m = KEYBOARD_START; m <= KEYBOARD_END; m++) keys.push(m);

  const whites = keys.filter(isWhiteKey);
  const blacks = keys.filter((m) => !isWhiteKey(m));

  return (
    <div className="keyboard" aria-label="Piyano klavyesi">
      <div className="keyboard-whites">
        {whites.map((midi) => {
          const cls = [
            "key",
            "white",
            highlightMidi === midi ? "expected" : "",
            hitMidi === midi ? "hit" : "",
            missMidi === midi ? "miss" : "",
            detectedMidi != null && Math.round(detectedMidi) === midi ? "detected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div key={midi} className={cls} data-midi={midi}>
              <span className="key-label">{midiToName(midi)}</span>
            </div>
          );
        })}
      </div>
      <div className="keyboard-blacks">
        {blacks.map((midi) => {
          const whiteBefore = whites.filter((w) => w < midi).length;
          // Position black key between whites: left = whiteBefore * whiteWidth - half black
          const leftPct =
            ((whiteBefore - 0.5) / whites.length) * 100 + 50 / whites.length;
          const cls = [
            "key",
            "black",
            highlightMidi === midi ? "expected" : "",
            hitMidi === midi ? "hit" : "",
            missMidi === midi ? "miss" : "",
            detectedMidi != null && Math.round(detectedMidi) === midi ? "detected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div
              key={midi}
              className={cls}
              data-midi={midi}
              style={{ left: `${leftPct}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
