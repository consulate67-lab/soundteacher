import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "./audio/pitchDetect";
import { ReferenceSynth } from "./audio/synth";
import { Controls } from "./components/Controls";
import { ExerciseList } from "./components/ExerciseList";
import { FallingNotesStage } from "./components/FallingNotesStage";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { GameEngine, type EngineSnapshot } from "./engine/gameEngine";
import { CHARTS, DEMO_CHART, getChartById, midiToDisplayLabel } from "./engine/noteChart";
import type { Chart, ChartDifficulty, ChartLocale, GameConfig } from "./engine/types";
import "./App.css";

const FALL_LEAD = 2.5;

const DEFAULT_CONFIG: GameConfig = {
  tempoScale: 0.75,
  hitWindowMs: 150,
  waitForNote: false,
  referenceAudio: true,
};

function emptySnapshot(chart: Chart): EngineSnapshot {
  const engine = new GameEngine(chart, DEFAULT_CONFIG, FALL_LEAD);
  return engine.snapshot();
}

export default function App() {
  const [chart, setChart] = useState<Chart>(DEMO_CHART);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() =>
    emptySnapshot(DEMO_CHART),
  );
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
  const [flashHit, setFlashHit] = useState<number | null>(null);
  const [flashMiss, setFlashMiss] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<ChartDifficulty | "all">(
    "all",
  );
  const [localeFilter, setLocaleFilter] = useState<ChartLocale | "all">("all");

  const engineRef = useRef<GameEngine | null>(null);
  const chartRef = useRef(chart);
  const detectorRef = useRef<PitchDetector | null>(null);
  const synthRef = useRef<ReferenceSynth | null>(null);
  const rafRef = useRef(0);
  const lastFeedbackRef = useRef(0);

  useEffect(() => {
    chartRef.current = chart;
  }, [chart]);

  useEffect(() => {
    engineRef.current = new GameEngine(chart, config, FALL_LEAD);
    setSnapshot(engineRef.current.snapshot());
    synthRef.current ??= new ReferenceSynth();
    void synthRef.current.load();
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chart id drives rebuild
  }, [chart.id]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      detectorRef.current?.stop();
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setConfig(config);
  }, [config]);

  const loop = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const now = performance.now();
    const { refNotes, snapshot: snap } = engine.tick(now);
    const activeChart = chartRef.current;

    if (config.referenceAudio && synthRef.current) {
      for (const n of refNotes) {
        // Wall-clock duration so held notes ring with the falling-note timing.
        const dur = n.duration / config.tempoScale;
        synthRef.current.play(
          n.midi,
          Math.min(Math.max(dur, 0.12), 3.5),
          undefined,
          0.95,
        );
      }
    }

    if (snap.feedback !== "none" && snap.lastFeedbackAt !== lastFeedbackRef.current) {
      lastFeedbackRef.current = snap.lastFeedbackAt;
      const target = activeChart.notes[snap.targetIndex - 1];
      if (snap.feedback === "hit" && target) {
        setFlashHit(target.midi);
        setFlashMiss(null);
        // Confirm hit with the same pitched piano sample (music ↔ pitch link).
        if (!config.referenceAudio) {
          synthRef.current?.play(
            target.midi,
            Math.min(target.duration / config.tempoScale, 1.6),
            undefined,
            1,
          );
        }
        window.setTimeout(() => setFlashHit(null), 280);
      }
      if (snap.feedback === "miss" && target) {
        setFlashMiss(target.midi);
        setFlashHit(null);
        window.setTimeout(() => setFlashMiss(null), 320);
      }
    }

    setSnapshot(snap);
    rafRef.current = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleStartMic = async () => {
    setMicError(null);
    try {
      detectorRef.current?.stop();
      const detector = new PitchDetector((sample) => {
        setDetectedMidi(sample.midi);
        const engine = engineRef.current;
        if (!engine) return;
        engine.updatePitch(
          sample.midi == null ? null : Math.round(sample.midi),
          performance.now(),
        );
      });
      detectorRef.current = detector;
      await detector.start();
      setMicOn(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Mikrofon izni alınamadı";
      setMicError(msg);
      setMicOn(false);
    }
  };

  const handleStopMic = () => {
    detectorRef.current?.stop();
    detectorRef.current = null;
    setMicOn(false);
    setDetectedMidi(null);
  };

  const handlePlay = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setConfig(config);
    await synthRef.current?.resume();
    engine.start(performance.now());
    startLoop();
  };

  const handleStop = () => {
    engineRef.current?.stop();
    cancelAnimationFrame(rafRef.current);
    setSnapshot(engineRef.current?.snapshot() ?? emptySnapshot(chart));
  };

  const handleChart = (id: string) => {
    const next = getChartById(id);
    cancelAnimationFrame(rafRef.current);
    setFlashHit(null);
    setFlashMiss(null);
    lastFeedbackRef.current = 0;
    setChart(next);
  };

  const livePhase =
    snapshot.phase === "playing" ||
    snapshot.phase === "waiting" ||
    snapshot.phase === "holding";

  const expectedMidi = livePhase
    ? (chart.notes[snapshot.targetIndex]?.midi ?? null)
    : null;

  const detectedLabel =
    detectedMidi != null ? midiToDisplayLabel(Math.round(detectedMidi)) : "—";

  return (
    <div className="app landscape-first app-with-catalog">
      <ExerciseList
        charts={CHARTS}
        selectedId={chart.id}
        disabled={livePhase}
        difficultyFilter={difficultyFilter}
        onDifficultyFilter={setDifficultyFilter}
        localeFilter={localeFilter}
        onLocaleFilter={setLocaleFilter}
        onSelect={handleChart}
      />

      <div className="app-main">
        <Controls
          phase={snapshot.phase}
          config={config}
          micOn={micOn}
          micError={micError}
          hits={snapshot.hits}
          misses={snapshot.misses}
          detectedLabel={detectedLabel}
          holdProgress={snapshot.holdProgress}
          chart={chart}
          onTempo={(tempoScale) => setConfig((c) => ({ ...c, tempoScale }))}
          onWaitToggle={(waitForNote) => setConfig((c) => ({ ...c, waitForNote }))}
          onRefToggle={(referenceAudio) => setConfig((c) => ({ ...c, referenceAudio }))}
          onWindow={(hitWindowMs) => setConfig((c) => ({ ...c, hitWindowMs }))}
          onStartMic={handleStartMic}
          onStopMic={handleStopMic}
          onPlay={handlePlay}
          onStop={handleStop}
        />

        <main className="playfield">
          <div
            className={`feedback-flash ${flashHit != null ? "ok" : ""} ${flashMiss != null ? "bad" : ""}`}
            aria-live="polite"
          />
          <FallingNotesStage snapshot={snapshot} fallLeadSec={FALL_LEAD} />
          <PianoKeyboard
            highlightMidi={expectedMidi}
            hitMidi={flashHit}
            missMidi={flashMiss}
            detectedMidi={detectedMidi}
            holding={snapshot.phase === "holding"}
            holdProgress={snapshot.holdProgress}
          />
        </main>
      </div>
    </div>
  );
}
