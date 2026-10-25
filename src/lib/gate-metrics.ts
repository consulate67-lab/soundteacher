/**
 * Dilim G — tunable gate metric placeholders per module.
 * Same pitch/timing tolerances across bands; child gets relaxed tempo bias only.
 * Real analysis worker will read these; stub gate uses maxHigh* counts.
 */

export type GateMetrics = {
  moduleId: number;
  /** Placeholder cents — not used by stub pitch yet. */
  pitchToleranceCents: number;
  /** Placeholder ms grid slack. */
  timingToleranceMs: number;
  /** Fail gate if high-severity pitch errors exceed this. */
  maxHighPitchErrors: number;
  /** Fail gate if high-severity timing errors exceed this. */
  maxHighTimingErrors: number;
  childTempoBias: "relaxed" | "standard";
  /** Default scoreRef for module gate piece. */
  defaultScoreRef: string;
  labelTr: string;
};

export const MODULE_GATE_METRICS: Record<number, GateMetrics> = {
  1: {
    moduleId: 1,
    pitchToleranceCents: 50,
    timingToleranceMs: 120,
    maxHighPitchErrors: 0,
    maxHighTimingErrors: 1,
    childTempoBias: "relaxed",
    defaultScoreRef: "score.piano.m1.gate.v0",
    labelTr: "M1 — klavye haritası kapısı",
  },
  2: {
    moduleId: 2,
    pitchToleranceCents: 45,
    timingToleranceMs: 100,
    maxHighPitchErrors: 0,
    maxHighTimingErrors: 1,
    childTempoBias: "relaxed",
    defaultScoreRef: "score.piano.m2.gate.v0",
    labelTr: "M2 — nota / süre kapısı",
  },
  3: {
    moduleId: 3,
    pitchToleranceCents: 45,
    timingToleranceMs: 110,
    maxHighPitchErrors: 0,
    maxHighTimingErrors: 1,
    childTempoBias: "relaxed",
    defaultScoreRef: "score.piano.m3.gate.v0",
    labelTr: "M3 — sol el / kırık üçlü kapısı",
  },
  4: {
    moduleId: 4,
    pitchToleranceCents: 40,
    timingToleranceMs: 90,
    maxHighPitchErrors: 0,
    maxHighTimingErrors: 0,
    childTempoBias: "relaxed",
    defaultScoreRef: "score.piano.m4.gate.v0",
    labelTr: "M4 — iki el kapısı",
  },
};

export function gateMetricsForModule(moduleId: number): GateMetrics {
  return (
    MODULE_GATE_METRICS[moduleId] ?? {
      moduleId,
      pitchToleranceCents: 50,
      timingToleranceMs: 120,
      maxHighPitchErrors: 0,
      maxHighTimingErrors: 1,
      childTempoBias: "standard",
      defaultScoreRef: `score.piano.m${moduleId}.gate.v0`,
      labelTr: `M${moduleId} kapısı`,
    }
  );
}

export function scoreRefForLesson(
  moduleId: number,
  order: number,
  isGate: boolean,
): string {
  if (isGate) return gateMetricsForModule(moduleId).defaultScoreRef;
  return `score.piano.m${moduleId}.l${order}.v0`;
}
