import type { Chart } from "../engine/types";
import type { GameConfig, GamePhase } from "../engine/types";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "../engine/noteChart";

type Props = {
  phase: GamePhase;
  config: GameConfig;
  micOn: boolean;
  micError: string | null;
  hits: number;
  misses: number;
  detectedLabel: string;
  holdProgress: number;
  chart: Chart;
  onTempo: (scale: number) => void;
  onWaitToggle: (v: boolean) => void;
  onRefToggle: (v: boolean) => void;
  onWindow: (ms: number) => void;
  onStartMic: () => void;
  onStopMic: () => void;
  onPlay: () => void;
  onStop: () => void;
};

export function Controls({
  phase,
  config,
  micOn,
  micError,
  hits,
  misses,
  detectedLabel,
  holdProgress,
  chart,
  onTempo,
  onWaitToggle,
  onRefToggle,
  onWindow,
  onStartMic,
  onStopMic,
  onPlay,
  onStop,
}: Props) {
  const playing = phase === "playing" || phase === "waiting" || phase === "holding";

  return (
    <header className="controls">
      <div className="brand-block">
        <p className="brand">Falling Notes</p>
        <h1>{chart.title}</h1>
        <p className="sub">
          {CATEGORY_LABELS[chart.category]} · {DIFFICULTY_LABELS[chart.difficulty]} ·
          tableti sehpaya koy
        </p>
      </div>

      <div className="control-grid">
        <label className="field">
          <span>Tempo</span>
          <select
            value={config.tempoScale}
            onChange={(e) => onTempo(Number(e.target.value))}
            disabled={playing}
          >
            <option value={0.5}>0.5× (yavaş)</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1× (orijinal)</option>
          </select>
        </label>

        <label className="field">
          <span>Pencere</span>
          <select
            value={config.hitWindowMs}
            onChange={(e) => onWindow(Number(e.target.value))}
            disabled={playing}
          >
            <option value={100}>±100 ms</option>
            <option value={150}>±150 ms</option>
            <option value={200}>±200 ms</option>
          </select>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={config.waitForNote}
            onChange={(e) => onWaitToggle(e.target.checked)}
            disabled={playing}
          />
          <span>Notayı bekle</span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={config.referenceAudio}
            onChange={(e) => onRefToggle(e.target.checked)}
            disabled={playing}
          />
          <span>Piyano referans</span>
        </label>
      </div>

      <div className="actions">
        {!micOn ? (
          <button type="button" className="btn primary" onClick={onStartMic}>
            Mikrofonu aç
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={onStopMic}>
            Mikrofonu kapat
          </button>
        )}
        {!playing ? (
          <button
            type="button"
            className="btn accent"
            onClick={onPlay}
            disabled={!micOn && !config.referenceAudio}
          >
            Başlat
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={onStop}>
            Durdur
          </button>
        )}
      </div>

      <div className="status-row">
        <span className={`mic-pill ${micOn ? "on" : ""}`}>
          {micOn ? "Mikrofon açık" : "Mikrofon kapalı"}
        </span>
        <span>Algı: {detectedLabel}</span>
        <span>
          İsabet: {hits} · Kaçırılan: {misses}
        </span>
        {phase === "waiting" && <span className="wait-pill">Doğru notayı bekliyor…</span>}
        {phase === "holding" && (
          <span className="hold-pill">
            Basılı tut · {Math.round(holdProgress * 100)}%
          </span>
        )}
        {phase === "finished" && <span className="done-pill">Bitti — tebrikler!</span>}
        {micError && <span className="err">{micError}</span>}
      </div>
    </header>
  );
}
