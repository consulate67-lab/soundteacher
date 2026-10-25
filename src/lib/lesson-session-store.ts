/**
 * Durable lesson session (phase + last Attempt + Gate) via signed JWT cookie.
 * Fixes Vercel cold-start dead-end after /api/listening/analyze.
 */

import type { AttemptRecord, GateResultRecord } from "./attempt";
import type { LessonPhase, LessonProgressRecord } from "./lesson-progress-store";
import {
  readSignedCookie,
  setSignedCookieOnResponse,
  writeSignedCookie,
} from "./signed-cookie";
import type { NextResponse } from "next/server";

export const LESSON_SESSION_COOKIE = "st_lsess_v1";

type SessionLesson = {
  phase: LessonPhase;
  status: LessonProgressRecord["status"];
  attemptCount: number;
  lastGateResult: "pass" | "fail" | null;
  updatedAt: string;
  /** Last attempt for this lesson (needed across serverless instances). */
  attempt: AttemptRecord | null;
  gate: GateResultRecord | null;
};

type SessionCookie = {
  u: string;
  /** At most a few lessons — cookie budget. */
  lessons: Record<string, SessionLesson>;
};

const MAX_LESSONS = 4;

function memory(): Map<string, SessionCookie> {
  const g = globalThis as unknown as { __stLessonSessions?: Map<string, SessionCookie> };
  if (!g.__stLessonSessions) g.__stLessonSessions = new Map();
  return g.__stLessonSessions;
}

function emptyLesson(): SessionLesson {
  return {
    phase: "theory",
    status: "in_progress",
    attemptCount: 0,
    lastGateResult: null,
    updatedAt: new Date().toISOString(),
    attempt: null,
    gate: null,
  };
}

function trimLessons(lessons: Record<string, SessionLesson>): Record<string, SessionLesson> {
  const ids = Object.keys(lessons);
  if (ids.length <= MAX_LESSONS) return lessons;
  const sorted = ids.sort(
    (a, b) =>
      new Date(lessons[b]!.updatedAt).getTime() - new Date(lessons[a]!.updatedAt).getTime(),
  );
  const keep = sorted.slice(0, MAX_LESSONS);
  const next: Record<string, SessionLesson> = {};
  for (const id of keep) next[id] = lessons[id]!;
  return next;
}

function toProgress(
  userId: string,
  lessonId: string,
  s: SessionLesson,
): LessonProgressRecord {
  return {
    userId,
    lessonId,
    phase: s.phase,
    status: s.status,
    attemptCount: s.attemptCount,
    lastAttemptId: s.attempt?.id ?? null,
    lastGateResult: s.lastGateResult,
    updatedAt: s.updatedAt,
  };
}

async function loadCookie(userId: string): Promise<SessionCookie> {
  const cached = memory().get(userId);
  if (cached) return cached;

  const raw = await readSignedCookie<SessionCookie & Record<string, unknown>>(
    LESSON_SESSION_COOKIE,
  );
  if (raw && typeof raw.u === "string" && raw.u === userId && raw.lessons) {
    const session: SessionCookie = {
      u: raw.u,
      lessons: raw.lessons as Record<string, SessionLesson>,
    };
    memory().set(userId, session);
    return session;
  }

  const fresh: SessionCookie = { u: userId, lessons: {} };
  memory().set(userId, fresh);
  return fresh;
}

async function persist(session: SessionCookie): Promise<void> {
  session.lessons = trimLessons(session.lessons);
  memory().set(session.u, session);
  await writeSignedCookie(LESSON_SESSION_COOKIE, session as unknown as Record<string, unknown>);
}

export async function persistLessonSessionOnResponse(
  response: NextResponse,
  userId: string,
): Promise<void> {
  const session = await loadCookie(userId);
  session.lessons = trimLessons(session.lessons);
  memory().set(userId, session);
  await setSignedCookieOnResponse(
    response,
    LESSON_SESSION_COOKIE,
    session as unknown as Record<string, unknown>,
  );
}

export async function ensureLessonProgress(
  userId: string,
  lessonId: string,
): Promise<LessonProgressRecord> {
  const session = await loadCookie(userId);
  if (!session.lessons[lessonId]) {
    session.lessons[lessonId] = emptyLesson();
    await persist(session);
  }
  return toProgress(userId, lessonId, session.lessons[lessonId]!);
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
): Promise<LessonProgressRecord | null> {
  const session = await loadCookie(userId);
  const s = session.lessons[lessonId];
  return s ? toProgress(userId, lessonId, s) : null;
}

export async function setLessonPhase(
  userId: string,
  lessonId: string,
  phase: LessonPhase,
  patch?: Partial<
    Pick<
      LessonProgressRecord,
      "status" | "attemptCount" | "lastGateResult" | "lastAttemptId"
    >
  >,
): Promise<LessonProgressRecord> {
  const session = await loadCookie(userId);
  const current = session.lessons[lessonId] ?? emptyLesson();
  const next: SessionLesson = {
    ...current,
    phase,
    status: patch?.status ?? current.status,
    attemptCount: patch?.attemptCount ?? current.attemptCount,
    lastGateResult:
      patch?.lastGateResult !== undefined ? patch.lastGateResult : current.lastGateResult,
    updatedAt: new Date().toISOString(),
    attempt: current.attempt,
    gate: current.gate,
  };
  // lastAttemptId patch alone doesn't clear attempt; keep linked attempt if id matches
  if (patch?.lastAttemptId === null) {
    next.attempt = null;
  } else if (
    patch?.lastAttemptId &&
    current.attempt &&
    current.attempt.id !== patch.lastAttemptId
  ) {
    // id changed without payload — keep until saveAttempt
  }
  session.lessons[lessonId] = next;
  await persist(session);
  return toProgress(userId, lessonId, next);
}

export async function resetLessonToPractice(userId: string, lessonId: string) {
  return setLessonPhase(userId, lessonId, "practice", {
    status: "in_progress",
    lastGateResult: "fail",
  });
}

export async function resetLessonToListening(userId: string, lessonId: string) {
  return setLessonPhase(userId, lessonId, "listening", {
    status: "in_progress",
  });
}

export async function saveAttempt(record: AttemptRecord): Promise<AttemptRecord> {
  const session = await loadCookie(record.userId);
  const current = session.lessons[record.lessonId] ?? emptyLesson();
  session.lessons[record.lessonId] = {
    ...current,
    attempt: record,
    updatedAt: new Date().toISOString(),
  };
  await persist(session);
  return record;
}

/** Upsert attempt without requiring cookie write in Route Handler — caller may use OnResponse. */
export async function saveAttemptInMemory(record: AttemptRecord): Promise<AttemptRecord> {
  const session = await loadCookie(record.userId);
  const current = session.lessons[record.lessonId] ?? emptyLesson();
  session.lessons[record.lessonId] = {
    ...current,
    attempt: record,
    updatedAt: new Date().toISOString(),
  };
  memory().set(record.userId, session);
  return record;
}

export async function getAttempt(
  userId: string,
  attemptId: string,
  lessonId?: string,
): Promise<AttemptRecord | null> {
  const session = await loadCookie(userId);
  if (lessonId) {
    const a = session.lessons[lessonId]?.attempt;
    return a?.id === attemptId ? a : null;
  }
  for (const s of Object.values(session.lessons)) {
    if (s.attempt?.id === attemptId) return s.attempt;
  }
  return null;
}

export async function getLastAttemptForLesson(
  userId: string,
  lessonId: string,
): Promise<AttemptRecord | null> {
  const session = await loadCookie(userId);
  return session.lessons[lessonId]?.attempt ?? null;
}

export async function saveGateResult(record: GateResultRecord): Promise<GateResultRecord> {
  const session = await loadCookie(record.userId);
  const current = session.lessons[record.lessonId] ?? emptyLesson();
  session.lessons[record.lessonId] = {
    ...current,
    gate: record,
    updatedAt: new Date().toISOString(),
  };
  await persist(session);
  return record;
}

export async function getGateByAttempt(
  userId: string,
  attemptId: string,
): Promise<GateResultRecord | null> {
  const session = await loadCookie(userId);
  for (const s of Object.values(session.lessons)) {
    if (s.gate?.attemptId === attemptId) return s.gate;
  }
  return null;
}
