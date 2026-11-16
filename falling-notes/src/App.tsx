import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "./audio/pitchDetect";
import { ReferenceSynth } from "./audio/synth";
import { Controls } from "./components/Controls";
import { FallingNotesStage } from "./components/FallingNotesStage";
import { PianoKeyboard } from "./components/PianoKeyboard";
import {
  GameEngine,
  type EngineSnapshot,
} from "./engine/gameEngine";
import { DEMO_CHART, midiToName } from "./engine/noteChart";
import type { GameConfig } from "./engine/types";
import "./App.css";

const FALL_LEAD = 2.5;

const DEFAULT_CONFIG: GameConfig = {
  tempoScale: 0.75,
  hitWindowMs: 150,
  waitForNote: false,
  referenceAudio: true,
};

function emptySnapshot(): EngineSnapshot {
  const engine = new GameEngine(DEMO_CHART, DEFAULT_CONFIG, FALL_LEAD);
  return engine.snapshot();
}

export default function App() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(emptySnapshot);
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
  const [flashHit, setFlashHit] = useState<number | null>(null);
  const [flashMiss, setFlashMiss] = useState<number | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const detectorRef = useRef<PitchDetector | null>(null);
  const synthRef = useRef<ReferenceSynth | null>(null);
  const rafRef = useRef(0);
  const lastFeedbackRef = useRef(0);

  useEffect(() => {
    engineRef.current = new GameEngine(DEMO_CHART, config, FALL_LEAD);
    synthRef.current = new ReferenceSynth();
    return () => {
      cancelAnimationFrame(rafRef.current);
      detectorRef.current?.stop();
      synthRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  useEffect(() => {
    engineRef.current?.setConfig(config);
  }, [config]);

  const loop = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const now = performance.now();
    const { refNotes, snapshot: snap } = engine.tick(now);

    if (config.referenceAudio && synthRef.current) {
      for (const n of refNotes) {
        const dur = n.duration / config.tempoScale;
        synthRef.current.play(n.midi, Math.min(dur, 1.2));
      }
    }

    if (
      snap.feedback !== "none" &&
      snap.lastFeedbackAt !== lastFeedbackRef.current
    ) {
      lastFeedbackRef.current = snap.lastFeedbackAt;
      const target = DEMO_CHART.notes[snap.targetIndex - 1];
      if (snap.feedback === "hit" && target) {
        setFlashHit(target.midi);
        setFlashMiss(null);
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
        if (!engine || sample.midi == null) return;
        engine.tryMatch(Math.round(sample.midi), performance.now());
      });
      detectorRef.current = detector;
      await detector.start();
      setMicOn(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Mikrofon izni alınamadı";
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
    setSnapshot(engineRef.current?.snapshot() ?? emptySnapshot());
  };

  const expectedMidi =
    snapshot.phase === "playing" || snapshot.phase === "waiting"
      ? (DEMO_CHART.notes[snapshot.targetIndex]?.midi ?? null)
      : null;

  const detectedLabel =
    detectedMidi != null ? midiToName(Math.round(detectedMidi)) : "—";

  return (
    <div className="app landscape-first">
      <Controls
        phase={snapshot.phase}
        config={config}
        micOn={micOn}
        micError={micError}
        hits={snapshot.hits}
        misses={snapshot.misses}
        detectedLabel={detectedLabel}
        chartTitle={DEMO_CHART.title}
        onTempo={(tempoScale) => setConfig((c) => ({ ...c, tempoScale }))}
        onWaitToggle={(waitForNote) =>
          setConfig((c) => ({ ...c, waitForNote }))
        }
        onRefToggle={(referenceAudio) =>
          setConfig((c) => ({ ...c, referenceAudio }))
        }
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
        />
      </main>
    </div>
  );
}
