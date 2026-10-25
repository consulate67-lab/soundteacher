/**
 * Dilim D — in-memory lesson phase state.
 * Schema mirror: LessonProgress (theory | practice | listening | gate).
 */

export type LessonPhase =
  "theory" | "practice" | "listening" | "feedback" | "gate_pass" | "gate_fail" | "unlock";

export type LessonProgressRecord = {
  userId: string;
  lessonId: string;
  phase: LessonPhase;
  /** Product status for DB sketch: in_progress | passed | failed_gate */
  status: "in_progress" | "passed" | "failed_gate";
  attemptCount: number;
  lastGateResult: "pass" | "fail" | null;
  updatedAt: string;
};

type Store = Map<string, LessonProgressRecord>;

const globalForProgress = globalThis as unknown as {
  __soundteacherLessonProgress?: Store;
};

function store(): Store {
  if (!globalForProgress.__soundteacherLessonProgress) {
    globalForProgress.__soundteacherLessonProgress = new Map();
  }
  return globalForProgress.__soundteacherLessonProgress;
}

function key(userId: string, lessonId: string) {
  return `${userId}::${lessonId}`;
}

export function getLessonProgress(
  userId: string,
  lessonId: string,
): LessonProgressRecord | null {
  return store().get(key(userId, lessonId)) ?? null;
}

export function ensureLessonProgress(
  userId: string,
  lessonId: string,
): LessonProgressRecord {
  const existing = getLessonProgress(userId, lessonId);
  if (existing) return existing;
  const record: LessonProgressRecord = {
    userId,
    lessonId,
    phase: "theory",
    status: "in_progress",
    attemptCount: 0,
    lastGateResult: null,
    updatedAt: new Date().toISOString(),
  };
  store().set(key(userId, lessonId), record);
  return record;
}

export function setLessonPhase(
  userId: string,
  lessonId: string,
  phase: LessonPhase,
  patch?: Partial<
    Pick<LessonProgressRecord, "status" | "attemptCount" | "lastGateResult">
  >,
): LessonProgressRecord {
  const current = ensureLessonProgress(userId, lessonId);
  const next: LessonProgressRecord = {
    ...current,
    phase,
    status: patch?.status ?? current.status,
    attemptCount: patch?.attemptCount ?? current.attemptCount,
    lastGateResult:
      patch?.lastGateResult !== undefined ? patch.lastGateResult : current.lastGateResult,
    updatedAt: new Date().toISOString(),
  };
  store().set(key(userId, lessonId), next);
  return next;
}

export function resetLessonToPractice(userId: string, lessonId: string) {
  return setLessonPhase(userId, lessonId, "practice", {
    status: "in_progress",
    lastGateResult: "fail",
  });
}
