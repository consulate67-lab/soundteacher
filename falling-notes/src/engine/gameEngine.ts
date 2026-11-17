import { chordGroupAt, groupHoldDuration, groupMidis, pitchInGroup } from "./chordGroup";
import type { ActiveDrop, Chart, GameConfig, GamePhase, NoteEvent } from "./types";

/**
 * Falling-notes clock + hold matching:
 * - Chart times are at tempoScale=1.
 * - Wall elapsed * tempoScale advances the music clock when playing.
 * - Simultaneous voices (same onset / chordId) form one attack target:
 *   two drops + two keys; monophonic mic accepts any voice in the group.
 * - Attack must land in the hit window (or after, in wait mode).
 * - Hit requires holding a matching pitch for HOLD_RATIO of the written
 *   duration (music-time); short articulations use a lighter hold.
 * - waitForNote freezes until attack, then while holding until required hold.
 */

/** Fraction of written note duration that must be held (long notes). */
export const HOLD_RATIO = 0.7;
/** Short articulations (≤ ~⅛–¼ at typical BPM): brief tap is enough. */
const SHORT_NOTE_SEC = 0.38;
const SHORT_HOLD_RATIO = 0.4;
/** Wall-ms silence/gap still counted as continuous hold. */
const HOLD_GAP_MS = 200;

export type EngineSnapshot = {
  phase: GamePhase;
  musicTime: number;
  drops: ActiveDrop[];
  /** Index of the first note of the next unmatched chord group. */
  targetIndex: number;
  /** MIDI numbers expected for the current group (multi-key highlight). */
  targetMidis: number[];
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

  private currentGroup(): NoteEvent[] {
    return chordGroupAt(this.chart.notes, this.targetIndex);
  }

  private requiredHold(group: NoteEvent[]): number {
    const dur = groupHoldDuration(group);
    if (dur <= SHORT_NOTE_SEC) {
      return Math.max(0.045, dur * SHORT_HOLD_RATIO);
    }
    return Math.max(0.08, dur * HOLD_RATIO);
  }

  private pitchMatches(group: NoteEvent[]): boolean {
    if (this.lastDetectedMidi == null) return false;
    if (performance.now() - this.lastPitchAt > HOLD_GAP_MS) return false;
    return pitchInGroup(group, this.lastDetectedMidi);
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

    const group = this.currentGroup();
    if (group.length === 0) return;
    if (group.every((n) => this.results.has(n.id))) return;

    if (!this.attacked) {
      const head = group[0]!;
      const windowSec = this.config.hitWindowMs / 1000;
      const early = head.time - windowSec;
      const inWindow = this.config.waitForNote
        ? this.musicTime >= early
        : this.musicTime >= early && this.musicTime <= head.time + windowSec;
      if (!inWindow) return;
      if (!pitchInGroup(group, detectedMidi)) return;

      this.attacked = true;
      this.holdAccum = 0;
      this.lastHoldTickAt = now;
      this.phase = "holding";
      if (this.config.waitForNote) {
        this.musicTime = Math.max(this.musicTime, head.time);
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
    const group = this.currentGroup();
    if (
      group.length === 0 ||
      group.every((n) => this.results.has(n.id)) ||
      !this.attacked
    ) {
      return;
    }

    if (this.pitchMatches(group)) {
      if (this.lastHoldTickAt <= 0) this.lastHoldTickAt = now;
      const wallDelta = (now - this.lastHoldTickAt) / 1000;
      this.lastHoldTickAt = now;
      this.holdAccum += wallDelta * this.config.tempoScale;

      if (this.holdAccum >= this.requiredHold(group)) {
        this.completeHit(now);
      }
    } else {
      this.lastHoldTickAt = 0;
      if (!this.config.waitForNote) {
        this.phase = "holding";
      }
    }
  }

  private completeHit(now: number): void {
    const group = this.currentGroup();
    if (group.length === 0) return;
    for (const n of group) {
      this.results.set(n.id, "hit");
    }
    this.hits++;
    this.feedback = "hit";
    this.lastFeedbackAt = now;
    this.targetIndex += group.length;
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
    const group = this.currentGroup();
    const head = group[0];
    if (!head) return;
    if (this.results.has(head.id)) return;
    if (this.musicTime >= head.time) {
      this.musicTime = head.time;
      this.phase = "waiting";
      this.musicAtWallStart = this.musicTime;
      this.wallStartedAt = now;
    }
  }

  private expireMisses(now: number): void {
    const windowSec = this.config.hitWindowMs / 1000;
    while (this.targetIndex < this.chart.notes.length) {
      const group = this.currentGroup();
      if (group.length === 0) break;
      if (group.every((n) => this.results.has(n.id))) {
        this.targetIndex += group.length;
        this.resetHold();
        continue;
      }

      const head = group[0]!;
      const dur = groupHoldDuration(group);

      if (this.config.waitForNote) {
        if (this.musicTime >= head.time || this.attacked) break;
      }

      const attackDeadline = head.time + windowSec;
      const holdDeadline = head.time + dur + windowSec;

      if (!this.attacked && this.musicTime > attackDeadline) {
        this.markMiss(group, now);
        continue;
      }

      if (this.attacked && this.musicTime > holdDeadline) {
        this.markMiss(group, now);
        continue;
      }

      break;
    }
  }

  private markMiss(group: NoteEvent[], now: number): void {
    for (const n of group) {
      this.results.set(n.id, "miss");
    }
    this.misses++;
    this.feedback = "miss";
    this.lastFeedbackAt = now;
    this.targetIndex += group.length;
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
    const group = this.currentGroup();
    const required = group.length ? this.requiredHold(group) : 1;
    const holdProgress =
      group.length > 0 && this.attacked && !group.every((n) => this.results.has(n.id))
        ? Math.min(1, this.holdAccum / required)
        : 0;
    const targetIds = new Set(group.map((n) => n.id));
    const targetMidis = groupMidis(group);

    const drops: ActiveDrop[] = this.chart.notes.map((event) => {
      const startScaled = this.scaleTime(event.time);
      const durationScaled = this.scaleTime(event.duration);
      const stored = this.results.get(event.id);
      let result: ActiveDrop["result"] = "pending";
      if (stored) result = stored;
      const isTarget = targetIds.has(event.id);
      return {
        event,
        startScaled,
        durationScaled,
        result,
        holdProgress: isTarget ? holdProgress : stored === "hit" ? 1 : 0,
        attacked: isTarget ? this.attacked : stored === "hit",
        isTarget,
      };
    });

    return {
      phase: this.phase,
      musicTime: this.musicTime,
      drops,
      targetIndex: this.targetIndex,
      targetMidis,
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
