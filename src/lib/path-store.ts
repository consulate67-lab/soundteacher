import { firstLessonOfModule, nextLessonId } from "./curriculum";
import type { Band } from "./bands";
import type { AnswerMap, Level, PlacementResult } from "./placement";
import {
  clearSignedCookie,
  readSignedCookie,
  writeSignedCookie,
} from "./signed-cookie";
import {
  nextTrialProgramLessonId,
  trialProgramLessonIds,
} from "./trial-program";

export type PathRecord = {
  userId: string;
  band: Band;
  level: Level;
  moduleEntry: number;
  defaultSessionMinutes: number;
  openLessonId: string;
  completedLessonIds: string[];
  injectedMicroLessons: string[];
  placementComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlacementDraft = {
  userId: string;
  band?: Band;
  answers: AnswerMap;
  provisional?: PlacementResult;
  verificationPassed?: boolean;
  updatedAt: string;
};

/** v2 JWT cookie — replaces HMAC v1. */
export const PATH_COOKIE = "st_path_v2";
export const DRAFT_COOKIE = "st_draft_v2";
/** Legacy cookie names (read once, migrate). */
const PATH_COOKIE_V1 = "st_path_v1";
const DRAFT_COOKIE_V1 = "st_draft_v1";

type PathStore = Map<string, PathRecord>;
type DraftStore = Map<string, PlacementDraft>;

const globalForPath = globalThis as unknown as {
  __soundteacherPaths?: PathStore;
  __soundteacherPlacementDrafts?: DraftStore;
};

function paths(): PathStore {
  if (!globalForPath.__soundteacherPaths) {
    globalForPath.__soundteacherPaths = new Map();
  }
  return globalForPath.__soundteacherPaths;
}

function drafts(): DraftStore {
  if (!globalForPath.__soundteacherPlacementDrafts) {
    globalForPath.__soundteacherPlacementDrafts = new Map();
  }
  return globalForPath.__soundteacherPlacementDrafts;
}

function isPathRecord(v: unknown): v is PathRecord {
  if (!v || typeof v !== "object") return false;
  const p = v as PathRecord;
  return (
    typeof p.userId === "string" &&
    typeof p.band === "string" &&
    typeof p.level === "string" &&
    typeof p.moduleEntry === "number" &&
    typeof p.openLessonId === "string" &&
    Array.isArray(p.completedLessonIds) &&
    typeof p.placementComplete === "boolean"
  );
}

function pathToCookieValue(record: PathRecord): Record<string, unknown> {
  return { ...record };
}

function draftToCookieValue(draft: PlacementDraft): Record<string, unknown> {
  return { ...draft };
}

/**
 * Durable Path: memory (same invocation) + JWT cookie (survives Vercel cold starts).
 * Relaxes userId match when cookie says placementComplete (id remint / migration).
 */
export async function getPath(userId: string): Promise<PathRecord | null> {
  const mem = paths().get(userId);
  if (mem) return mem;

  let fromCookie =
    (await readSignedCookie<PathRecord>(PATH_COOKIE)) ??
    (await readSignedCookie<PathRecord>(PATH_COOKIE_V1));

  if (!fromCookie || !isPathRecord(fromCookie)) return null;
  if (!fromCookie.placementComplete) return null;

  if (fromCookie.userId !== userId) {
    // Re-key orphaned Path onto current session user (stable-id migration).
    fromCookie = {
      ...fromCookie,
      userId,
      updatedAt: new Date().toISOString(),
    };
  }

  paths().set(userId, fromCookie);
  return fromCookie;
}

export async function getPlacementDraft(
  userId: string,
): Promise<PlacementDraft | null> {
  const mem = drafts().get(userId);
  if (mem) return mem;

  const fromCookie =
    (await readSignedCookie<PlacementDraft>(DRAFT_COOKIE)) ??
    (await readSignedCookie<PlacementDraft>(DRAFT_COOKIE_V1));

  if (!fromCookie || typeof fromCookie.userId !== "string") return null;

  const draft: PlacementDraft = {
    userId,
    band: fromCookie.band,
    answers: fromCookie.answers ?? {},
    provisional: fromCookie.provisional,
    verificationPassed: fromCookie.verificationPassed,
    updatedAt: fromCookie.updatedAt ?? new Date().toISOString(),
  };
  drafts().set(userId, draft);
  return draft;
}

async function persistPath(record: PathRecord): Promise<PathRecord> {
  paths().set(record.userId, record);
  await writeSignedCookie(PATH_COOKIE, pathToCookieValue(record));
  return record;
}

export async function savePlacementDraft(
  userId: string,
  patch: Partial<Omit<PlacementDraft, "userId" | "updatedAt">>,
): Promise<PlacementDraft> {
  const existing = (await getPlacementDraft(userId)) ?? undefined;
  const next: PlacementDraft = {
    userId,
    band: patch.band ?? existing?.band,
    answers: patch.answers ?? existing?.answers ?? {},
    provisional: patch.provisional ?? existing?.provisional,
    verificationPassed: patch.verificationPassed ?? existing?.verificationPassed,
    updatedAt: new Date().toISOString(),
  };
  drafts().set(userId, next);
  await writeSignedCookie(DRAFT_COOKIE, draftToCookieValue(next));
  return next;
}

export async function clearPlacementDraft(userId: string): Promise<void> {
  drafts().delete(userId);
  await clearSignedCookie(DRAFT_COOKIE);
  await clearSignedCookie(DRAFT_COOKIE_V1);
  void userId;
}

export async function createPathFromPlacement(
  userId: string,
  result: PlacementResult,
): Promise<PathRecord> {
  const first = firstLessonOfModule(result.module_entry);
  const trialIds = trialProgramLessonIds({
    level: result.level,
    moduleEntry: result.module_entry,
  });
  const openLessonId = trialIds[0] ?? first?.id ?? "piano.m1.l1";
  const injectedMicroLessons =
    result.level === "A1" ? ["piano.m1.l2", "piano.m1.l4"] : [];

  const now = new Date().toISOString();
  const record: PathRecord = {
    userId,
    band: result.band,
    level: result.level,
    moduleEntry: result.module_entry,
    defaultSessionMinutes: result.default_session_minutes,
    openLessonId,
    completedLessonIds: [],
    injectedMicroLessons,
    placementComplete: true,
    createdAt: now,
    updatedAt: now,
  };
  await persistPath(record);
  await clearPlacementDraft(userId);
  return record;
}

/**
 * Re-seal a client-mirrored Path (localStorage backup) onto the JWT cookie.
 * Used when the browser dropped Set-Cookie but still has the completion payload.
 */
export async function restorePathFromClient(
  userId: string,
  raw: unknown,
): Promise<PathRecord | null> {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<PathRecord>;
  if (
    p.placementComplete !== true ||
    typeof p.band !== "string" ||
    typeof p.level !== "string" ||
    typeof p.moduleEntry !== "number" ||
    typeof p.openLessonId !== "string"
  ) {
    return null;
  }

  const now = new Date().toISOString();
  const record: PathRecord = {
    userId,
    band: p.band as Band,
    level: p.level as Level,
    moduleEntry: p.moduleEntry,
    defaultSessionMinutes:
      typeof p.defaultSessionMinutes === "number" ? p.defaultSessionMinutes : 15,
    openLessonId: p.openLessonId,
    completedLessonIds: Array.isArray(p.completedLessonIds)
      ? p.completedLessonIds.filter((x): x is string => typeof x === "string")
      : [],
    injectedMicroLessons: Array.isArray(p.injectedMicroLessons)
      ? p.injectedMicroLessons.filter((x): x is string => typeof x === "string")
      : [],
    placementComplete: true,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : now,
    updatedAt: now,
  };
  return persistPath(record);
}

export function toPlacementResult(path: PathRecord): PlacementResult {
  return {
    band: path.band,
    level: path.level,
    module_entry: path.moduleEntry,
    default_session_minutes: path.defaultSessionMinutes,
  };
}

/** S36→S38: mark lesson complete and open the next lesson (strict sequence). */
export async function unlockNextLesson(
  userId: string,
  completedLessonId: string,
): Promise<PathRecord | null> {
  const path = await getPath(userId);
  if (!path) return null;

  const completed = path.completedLessonIds.includes(completedLessonId)
    ? path.completedLessonIds
    : [...path.completedLessonIds, completedLessonId];

  const trialNext = nextTrialProgramLessonId(
    { ...path, completedLessonIds: completed },
    completedLessonId,
  );
  const nextId = trialNext ?? nextLessonId(completedLessonId);
  const updated: PathRecord = {
    ...path,
    completedLessonIds: completed,
    openLessonId: nextId ?? path.openLessonId,
    updatedAt: new Date().toISOString(),
  };
  return persistPath(updated);
}
