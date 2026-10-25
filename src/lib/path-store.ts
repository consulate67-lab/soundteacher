import { firstLessonOfModule, nextLessonId } from "./curriculum";
import type { Band } from "./bands";
import type { AnswerMap, Level, PlacementResult } from "./placement";

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

export function getPath(userId: string): PathRecord | null {
  return paths().get(userId) ?? null;
}

export function getPlacementDraft(userId: string): PlacementDraft | null {
  return drafts().get(userId) ?? null;
}

export function savePlacementDraft(
  userId: string,
  patch: Partial<Omit<PlacementDraft, "userId" | "updatedAt">>,
): PlacementDraft {
  const existing = drafts().get(userId);
  const next: PlacementDraft = {
    userId,
    band: patch.band ?? existing?.band,
    answers: patch.answers ?? existing?.answers ?? {},
    provisional: patch.provisional ?? existing?.provisional,
    verificationPassed: patch.verificationPassed ?? existing?.verificationPassed,
    updatedAt: new Date().toISOString(),
  };
  drafts().set(userId, next);
  return next;
}

export function clearPlacementDraft(userId: string) {
  drafts().delete(userId);
}

export function createPathFromPlacement(
  userId: string,
  result: PlacementResult,
): PathRecord {
  const first = firstLessonOfModule(result.module_entry);
  const openLessonId = first?.id ?? "piano.m1.l1";
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
  paths().set(userId, record);
  clearPlacementDraft(userId);
  return record;
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
export function unlockNextLesson(
  userId: string,
  completedLessonId: string,
): PathRecord | null {
  const path = paths().get(userId);
  if (!path) return null;

  const completed = path.completedLessonIds.includes(completedLessonId)
    ? path.completedLessonIds
    : [...path.completedLessonIds, completedLessonId];

  const nextId = nextLessonId(completedLessonId);
  const updated: PathRecord = {
    ...path,
    completedLessonIds: completed,
    openLessonId: nextId ?? path.openLessonId,
    updatedAt: new Date().toISOString(),
  };
  paths().set(userId, updated);
  return updated;
}
