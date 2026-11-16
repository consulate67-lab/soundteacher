import type {
  ActiveDrop,
  Chart,
  GameConfig,
  GamePhase,
  NoteEvent,
} from "./types";

/**
 * Falling-notes clock:
 * - Chart times are at tempoScale=1.
 * - Wall elapsed * tempoScale advances the music clock when playing.
 * - waitForNote freezes the music clock until the current target is hit.
 */

export type EngineSnapshot = {
  phase: GamePhase;
  musicTime: number;
  drops: ActiveDrop[];
  /** Index of the next unmatched note (wait / hit target). */
  targetIndex: number;
  hits: number;
  misses: number;
  feedback: "none" | "hit" | "miss";
  lastFeedbackAt: number;
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
  }

  stop(): void {
    this.phase = "idle";
    this.musicTime = 0;
  }

  /** Convert chart time → scaled game clock. */
  scaleTime(chartTime: number): number {
    return chartTime / this.config.tempoScale;
  }

  private currentTarget(): NoteEvent | null {
    return this.chart.notes[this.targetIndex] ?? null;
  }

  /**
   * Advance simulation. Returns notes that should trigger reference audio.
   */
  tick(now: number): { refNotes: NoteEvent[]; snapshot: EngineSnapshot } {
    const refNotes: NoteEvent[] = [];

    if (this.phase === "playing") {
      const wallDelta = (now - this.wallStartedAt) / 1000;
      this.musicTime =
        this.musicAtWallStart + wallDelta * this.config.tempoScale;
      this.expireMisses(now);
      this.maybeEnterWait(now);

      if (this.config.referenceAudio) {
        for (const n of this.chart.notes) {
          if (this.playedRef.has(n.id)) continue;
          if (this.musicTime >= n.time) {
            this.playedRef.add(n.id);
            refNotes.push(n);
          }
        }
      }

      if (
        this.targetIndex >= this.chart.notes.length &&
        this.phase === "playing"
      ) {
        this.phase = "finished";
      }
    } else if (this.phase === "waiting") {
      // Music clock frozen; still expire nothing new — wait for pitch.
    }

    return { refNotes, snapshot: this.snapshot(now) };
  }

  private maybeEnterWait(now: number): void {
    if (!this.config.waitForNote) return;
    const target = this.currentTarget();
    if (!target) return;
    if (this.results.has(target.id)) return;
    // Freeze when we reach the note’s chart time (at the hit line).
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
        continue;
      }
      // In wait mode we never auto-miss past the target.
      if (this.config.waitForNote && this.musicTime >= n.time) break;
      if (this.musicTime > n.time + windowSec) {
        this.results.set(n.id, "miss");
        this.misses++;
        this.feedback = "miss";
        this.lastFeedbackAt = now;
        this.targetIndex++;
      } else {
        break;
      }
    }
  }

  /**
   * Attempt to match detected MIDI against the current target within the window.
   */
  tryMatch(detectedMidi: number | null, now: number): boolean {
    if (detectedMidi == null) return false;
    if (this.phase !== "playing" && this.phase !== "waiting") return false;

    const target = this.currentTarget();
    if (!target || this.results.has(target.id)) return false;

    const windowSec = this.config.hitWindowMs / 1000;
    const early = target.time - windowSec;
    const late = target.time + windowSec;

    // In wait mode, once at/after the note, accept indefinitely until hit.
    const inWindow = this.config.waitForNote
      ? this.musicTime >= early
      : this.musicTime >= early && this.musicTime <= late;

    if (!inWindow) return false;

    // Half-semitone (~50 cents) via rounded MIDI compare
    if (Math.round(detectedMidi) !== target.midi) return false;

    this.results.set(target.id, "hit");
    this.hits++;
    this.feedback = "hit";
    this.lastFeedbackAt = now;
    this.targetIndex++;

    if (this.phase === "waiting") {
      this.phase = "playing";
      this.musicAtWallStart = this.musicTime;
      this.wallStartedAt = now;
    }

    if (this.targetIndex >= this.chart.notes.length) {
      this.phase = "finished";
    }

    return true;
  }

  snapshot(_now = performance.now()): EngineSnapshot {
    const drops: ActiveDrop[] = this.chart.notes.map((event) => {
      const startScaled = this.scaleTime(event.time);
      const durationScaled = this.scaleTime(event.duration);
      const stored = this.results.get(event.id);
      let result: ActiveDrop["result"] = "pending";
      if (stored) result = stored;
      return { event, startScaled, durationScaled, result };
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
    };
  }
}

/**
 * Y position of a note drop: 0 = top spawn, 1 = hit line.
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
