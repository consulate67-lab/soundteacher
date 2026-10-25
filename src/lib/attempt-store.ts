import type { AttemptRecord, GateResultRecord } from "./attempt";

type AttemptMap = Map<string, AttemptRecord>;
type GateMap = Map<string, GateResultRecord>;
type ByUserLesson = Map<string, string[]>;

const globalForAttempts = globalThis as unknown as {
  __soundteacherAttempts?: AttemptMap;
  __soundteacherGates?: GateMap;
  __soundteacherAttemptIndex?: ByUserLesson;
};

function attempts(): AttemptMap {
  if (!globalForAttempts.__soundteacherAttempts) {
    globalForAttempts.__soundteacherAttempts = new Map();
  }
  return globalForAttempts.__soundteacherAttempts;
}

function gates(): GateMap {
  if (!globalForAttempts.__soundteacherGates) {
    globalForAttempts.__soundteacherGates = new Map();
  }
  return globalForAttempts.__soundteacherGates;
}

function index(): ByUserLesson {
  if (!globalForAttempts.__soundteacherAttemptIndex) {
    globalForAttempts.__soundteacherAttemptIndex = new Map();
  }
  return globalForAttempts.__soundteacherAttemptIndex;
}

function uk(userId: string, lessonId: string) {
  return `${userId}::${lessonId}`;
}

export function saveAttempt(record: AttemptRecord): AttemptRecord {
  attempts().set(record.id, record);
  const list = index().get(uk(record.userId, record.lessonId)) ?? [];
  list.push(record.id);
  index().set(uk(record.userId, record.lessonId), list);
  return record;
}

export function getAttempt(id: string): AttemptRecord | null {
  return attempts().get(id) ?? null;
}

export function listAttempts(userId: string, lessonId: string): AttemptRecord[] {
  const ids = index().get(uk(userId, lessonId)) ?? [];
  return ids
    .map((id) => attempts().get(id))
    .filter((a): a is AttemptRecord => Boolean(a));
}

export function saveGateResult(record: GateResultRecord): GateResultRecord {
  gates().set(record.id, record);
  return record;
}

export function getGateByAttempt(attemptId: string): GateResultRecord | null {
  for (const g of gates().values()) {
    if (g.attemptId === attemptId) return g;
  }
  return null;
}
