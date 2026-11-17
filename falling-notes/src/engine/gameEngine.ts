import type { ActiveDrop, Chart, GameConfig, GamePhase, NoteEvent } from "./types";

/**
 * Falling-notes clock + hold matching:
 * - Chart times are at tempoScale=1.
 * - Wall elapsed * tempoScale advances the music clock when playing.
 * - Attack (= correct pitch onset) must land in the hit window (or after, in wait mode).
 * - Hit requires holding the pitch for HOLD_RATIO of the written duration
 *   (music-time), with short mic gaps forgiven.
 * - waitForNote freezes until attack, then freezes again while holding until
 *   the required hold is met (tempoScale still stretches wall hold length).
 */

/** Fraction of written note duration that must be held. */
export const HOLD_RATIO = 0.7;
/** Wall-ms silence/gap still counted as continuous hold. */
const HOLD_GAP_MS = 200;

export type EngineSnapshot = {
  phase: GamePhase;
  musicTime: number;
  drops: ActiveDrop[];
  /** Index of the next unmatched note (wait / hold target). */
  targetIndex: number;
  hits: number;
  misses: number;
  feedback: "none" | "hit" | "miss";
  lastFeedbackAt: number;
  /** 0–1 hold progress on the current target (0 if idle / none). */
  holdProgress: number;
  bpm: number;
};

export class GameEngine {
  readonly chart: Chart;
  config: GameConfig;
  private phase: GamePhase = "idle";
  private musicTime = 0;
  private wallStartedAt = 0;
  private musicAtWallStart = 0;
  private results = new Map<string, "hit" | "miss">();
  private targetIndex = 0;
  private hits = 0;
  private misses = 0;
  private feedback: "none" | "hit" | "miss" = "none";
  private lastFeedbackAt = 0;
  private playedRef = new Set<string>();

  private lastDetectedMidi: number | null = null;
  private lastPitchAt = 0;
  private attacked = false;
  private holdAccum = 0;
  private lastHoldTickAt = 0;

  /** How many seconds before hit-line the note appears at top. */
  readonly fallLeadSec: number;

  constructor(chart: Chart, config: GameConfig, fallLeadSec = 2.5) {
    this.chart = chart;
    this.config = config;
    this.fallLeadSec = fallLeadSec;
  }

  setConfig(partial: Partial<GameConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  start(now = performance.now()): void {
    this.phase = "playing";
    this.musicTime = 0;
    this.wallStartedAt = now;
    this.musicAtWallStart = 0;
    this.results.clear();
    this.playedRef.clear();
    this.targetIndex = 0;
    this.hits = 0;
    this.misses = 0;
    this.feedback = "none";
    this.resetHold();
    this.lastDetectedMidi = null;
  }

  stop(): void {
    this.phase = "idle";
    this.musicTime = 0;
    this.resetHold();
  }

  /** Convert chart time → scaled game clock. */
  scaleTime(chartTime: number): number {
    return chartTime / this.config.tempoScale;
  }

  private resetHold(): void {
    this.attacked = false;
    this.holdAccum = 0;
    this.lastHoldTickAt = 0;
  }

  private currentTarget(): NoteEvent | null {
    return this.chart.notes[this.targetIndex] ?? null;
  }

  private requiredHold(target: NoteEvent): number {
    return Math.max(0.08, target.duration * HOLD_RATIO);
  }

  private pitchMatches(target: NoteEvent): boolean {
    if (this.lastDetectedMidi == null) return false;
    if (performance.now() - this.lastPitchAt > HOLD_GAP_MS) return false;
    return Math.round(this.lastDetectedMidi) === target.midi;
  }

  /**
   * Feed latest mic pitch (or null = silence). Call on every detector sample.
   */
  updatePitch(detectedMidi: number | null, now: number): void {
    if (detectedMidi == null) {
      this.lastDetectedMidi = null;
      return;
    }
    this.lastDetectedMidi = detectedMidi;
    this.lastPitchAt = now;

    if (
      this.phase !== "playing" &&
      this.phase !== "waiting" &&
      this.phase !== "holding"
    ) {
      return;
    }

    const target = this.currentTarget();
    if (!target || this.results.has(target.id)) return;

    if (!this.attacked) {
      const windowSec = this.config.hitWindowMs / 1000;
      const early = target.time - windowSec;
      const inWindow = this.config.waitForNote
        ? this.musicTime >= early
        : this.musicTime >= early && this.musicTime <= target.time + windowSec;
      if (!inWindow) return;
      if (Math.round(detectedMidi) !== target.midi) return;

      this.attacked = true;
      this.holdAccum = 0;
      this.lastHoldTickAt = now;
      this.phase = "holding";
      // Freeze clock at attack for wait-for-note; non-wait keeps running in tick.
      if (this.config.waitForNote) {
        this.musicTime = Math.max(this.musicTime, target.time);
        this.musicAtWallStart = this.musicTime;
        this.wallStartedAt = now;
      }
    }
  }

  /**
   * Advance simulation. Returns notes that should trigger reference audio.
   */
  tick(now: number): { refNotes: NoteEvent[]; snapshot: EngineSnapshot } {
    const refNotes: NoteEvent[] = [];

    if (this.phase === "playing") {
      const wallDelta = (now - this.wallStartedAt) / 1000;
      this.musicTime = this.musicAtWallStart + wallDelta * this.config.tempoScale;
      this.maybeEnterWait(now);
      this.expireMisses(now);
      this.collectRef(refNotes);

      if (this.targetIndex >= this.chart.notes.length && this.phase === "playing") {
        this.phase = "finished";
      }
    } else if (this.phase === "waiting") {
      // Frozen until attack via updatePitch.
    } else if (this.phase === "holding") {
      this.advanceHold(now);
      if (!this.config.waitForNote) {
        // Music keeps moving during hold outside wait mode.
        const wallDelta = (now - this.wallStartedAt) / 1000;
        this.musicTime = this.musicAtWallStart + wallDelta * this.config.tempoScale;
        this.expireMisses(now);
        this.collectRef(refNotes);
      }
    }

    return { refNotes, snapshot: this.snapshot() };
  }

  private collectRef(refNotes: NoteEvent[]): void {
    if (!this.config.referenceAudio) return;
    for (const n of this.chart.notes) {
      if (this.playedRef.has(n.id)) continue;
      if (this.musicTime >= n.time) {
        this.playedRef.add(n.id);
        refNotes.push(n);
      }
    }
  }

  private advanceHold(now: number): void {
    const target = this.currentTarget();
    if (!target || this.results.has(target.id) || !this.attacked) return;

    if (this.pitchMatches(target)) {
      if (this.lastHoldTickAt <= 0) this.lastHoldTickAt = now;
      const wallDelta = (now - this.lastHoldTickAt) / 1000;
      this.lastHoldTickAt = now;
      // Accumulate in chart/music time so tempoScale stretches the real hold.
      this.holdAccum += wallDelta * this.config.tempoScale;

      if (this.holdAccum >= this.requiredHold(target)) {
        this.completeHit(now);
      }
    } else {
      // Gap: pause accumulation; wait mode stays in holding until pitch returns.
      this.lastHoldTickAt = 0;
      if (!this.config.waitForNote) {
        // Keep phase holding so expireMisses can still fail the note.
        this.phase = "holding";
      }
    }
  }

  private completeHit(now: number): void {
    const target = this.currentTarget();
    if (!target) return;
    this.results.set(target.id, "hit");
    this.hits++;
    this.feedback = "hit";
    this.lastFeedbackAt = now;
    this.targetIndex++;
    this.resetHold();
    this.phase = "playing";
    this.musicAtWallStart = this.musicTime;
    this.wallStartedAt = now;

    if (this.targetIndex >= this.chart.notes.length) {
      this.phase = "finished";
    }
  }

  private maybeEnterWait(now: number): void {
    if (!this.config.waitForNote) return;
    if (this.attacked) return;
    const target = this.currentTarget();
    if (!target) return;
    if (this.results.has(target.id)) return;
    if (this.musicTime >= target.time) {
      this.musicTime = target.time;
      this.phase = "waiting";
      this.musicAtWallStart = this.musicTime;
      this.wallStartedAt = now;
    }
  }

  private expireMisses(now: number): void {
    const windowSec = this.config.hitWindowMs / 1000;
    while (this.targetIndex < this.chart.notes.length) {
      const n = this.chart.notes[this.targetIndex]!;
      if (this.results.has(n.id)) {
        this.targetIndex++;
        this.resetHold();
        continue;
      }

      // Wait mode: never auto-miss before/during wait or while holding for this note.
      if (this.config.waitForNote) {
        if (this.musicTime >= n.time || this.attacked) break;
      }

      const attackDeadline = n.time + windowSec;
      const holdDeadline = n.time + n.duration + windowSec;

      if (!this.attacked && this.musicTime > attackDeadline) {
        this.markMiss(n, now);
        continue;
      }

      if (this.attacked && this.musicTime > holdDeadline) {
        this.markMiss(n, now);
        continue;
      }

      break;
    }
  }

  private markMiss(n: NoteEvent, now: number): void {
    this.results.set(n.id, "miss");
    this.misses++;
    this.feedback = "miss";
    this.lastFeedbackAt = now;
    this.targetIndex++;
    this.resetHold();
    if (this.phase === "holding" || this.phase === "waiting") {
      this.phase = "playing";
      this.musicAtWallStart = this.musicTime;
      this.wallStartedAt = now;
    }
  }

  /**
   * @deprecated Prefer updatePitch — kept for call-site clarity during transition.
   */
  tryMatch(detectedMidi: number | null, now: number): boolean {
    const before = this.hits;
    this.updatePitch(detectedMidi, now);
    return this.hits > before;
  }

  snapshot(): EngineSnapshot {
    const target = this.currentTarget();
    const required = target ? this.requiredHold(target) : 1;
    const holdProgress =
      target && this.attacked && !this.results.has(target.id)
        ? Math.min(1, this.holdAccum / required)
        : 0;

    const drops: ActiveDrop[] = this.chart.notes.map((event) => {
      const startScaled = this.scaleTime(event.time);
      const durationScaled = this.scaleTime(event.duration);
      const stored = this.results.get(event.id);
      let result: ActiveDrop["result"] = "pending";
      if (stored) result = stored;
      const isTarget = target?.id === event.id;
      return {
        event,
        startScaled,
        durationScaled,
        result,
        holdProgress: isTarget ? holdProgress : stored === "hit" ? 1 : 0,
        attacked: isTarget ? this.attacked : stored === "hit",
      };
    });

    return {
      phase: this.phase,
      musicTime: this.musicTime,
      drops,
      targetIndex: this.targetIndex,
      hits: this.hits,
      misses: this.misses,
      feedback: this.feedback,
      lastFeedbackAt: this.lastFeedbackAt,
      holdProgress,
      bpm: this.chart.bpm,
    };
  }
}

/**
 * Y position of a note drop head: 0 = top spawn, 1 = hit line.
 * Based on musicTime vs event.time and fallLead (in chart time at tempo 1).
 */
export function dropProgress(
  musicTime: number,
  eventTime: number,
  fallLeadChartSec: number,
): number {
  const startAppear = eventTime - fallLeadChartSec;
  if (musicTime <= startAppear) return -0.1;
  if (musicTime >= eventTime) return 1;
  return (musicTime - startAppear) / fallLeadChartSec;
}

/** Beats for a note event at chart BPM (for visual length). */
export function durationBeats(durationSec: number, bpm: number): number {
  return durationSec / (60 / bpm);
}
