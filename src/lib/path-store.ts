import { firstLessonOfModule, nextLessonId } from "./curriculum";
import type { Band } from "./bands";
import type { AnswerMap, Level, PlacementResult } from "./placement";
import {
  compactClaimsToPath,
  legacyCookieToPath,
  PATH_COOKIE,
  PATH_COOKIE_V1,
  PATH_COOKIE_V2,
  pathToCompactClaims,
  type CompactPathClaims,
} from "./path-cookie";
import {
  clearSignedCookie,
  readSignedCookie,
  sealJwt,
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

export { PATH_COOKIE };
export const DRAFT_COOKIE = "st_draft_v3";
const DRAFT_COOKIE_V2 = "st_draft_v2";
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

/** Minimal draft cookie — band + provisional only (no fat answers map). */
function draftToCookieValue(draft: PlacementDraft): Record<string, unknown> {
  return {
    u: draft.userId,
    b: draft.band ?? null,
    r: draft.provisional ?? null,
    v: draft.verificationPassed ?? null,
    t: draft.updatedAt,
  };
}

function cookieToDraft(
  raw: Record<string, unknown>,
  userId: string,
): PlacementDraft | null {
  // compact v3
  if ("u" in raw || "b" in raw) {
    return {
      userId,
      band: (raw.b as Band | undefined) ?? undefined,
      answers: {},
      provisional: (raw.r as PlacementResult | undefined) ?? undefined,
      verificationPassed:
        typeof raw.v === "boolean" ? raw.v : undefined,
      updatedAt: typeof raw.t === "string" ? raw.t : new Date().toISOString(),
    };
  }
  // legacy
  if (typeof raw.userId === "string" || raw.band || raw.provisional) {
    return {
      userId,
      band: raw.band as Band | undefined,
      answers: (raw.answers as AnswerMap) ?? {},
      provisional: raw.provisional as PlacementResult | undefined,
      verificationPassed: raw.verificationPassed as boolean | undefined,
      updatedAt:
        typeof raw.updatedAt === "string"
          ? raw.updatedAt
          : new Date().toISOString(),
    };
  }
  return null;
}

async function readPathFromCookies(
  userId: string,
): Promise<PathRecord | null> {
  const v3 = await readSignedCookie<CompactPathClaims>(PATH_COOKIE);
  if (v3) {
    const path = compactClaimsToPath(v3, userId);
    if (path) return path;
  }

  for (const name of [PATH_COOKIE_V2, PATH_COOKIE_V1]) {
    const legacy = await readSignedCookie<Record<string, unknown>>(name);
    if (!legacy) continue;
    const path = legacyCookieToPath(legacy, userId);
    if (path) return path;
  }
  return null;
}

/**
 * Durable Path: memory + compact JWT cookie (survives Vercel cold starts).
 */
export async function getPath(userId: string): Promise<PathRecord | null> {
  const mem = paths().get(userId);
  if (mem) return mem;

  const fromCookie = await readPathFromCookies(userId);
  if (!fromCookie?.placementComplete) return null;

  paths().set(userId, fromCookie);
  return fromCookie;
}

export async function getPlacementDraft(
  userId: string,
): Promise<PlacementDraft | null> {
  const mem = drafts().get(userId);
  if (mem) return mem;

  for (const name of [DRAFT_COOKIE, DRAFT_COOKIE_V2, DRAFT_COOKIE_V1]) {
    const raw = await readSignedCookie<Record<string, unknown>>(name);
    if (!raw) continue;
    const draft = cookieToDraft(raw, userId);
    if (draft) {
      drafts().set(userId, draft);
      return draft;
    }
  }
  return null;
}

async function persistPath(record: PathRecord): Promise<PathRecord> {
  paths().set(record.userId, record);
  const claims = pathToCompactClaims(record);
  await writeSignedCookie(PATH_COOKIE, claims as unknown as Record<string, unknown>);
  return record;
}

/** Seal compact claims and return token + byte length (for Set-Cookie + diagnostics). */
export async function sealPathCookie(
  record: PathRecord,
): Promise<{ token: string; bytes: number; claims: CompactPathClaims }> {
  const claims = pathToCompactClaims(record);
  const token = await sealJwt(claims as unknown as Record<string, unknown>);
  return { token, bytes: token.length, claims };
}

export async function savePlacementDraft(
  userId: string,
  patch: Partial<Omit<PlacementDraft, "userId" | "updatedAt">>,
): Promise<PlacementDraft> {
  const existing = (await getPlacementDraft(userId)) ?? undefined;
  const next: PlacementDraft = {
    userId,
    band: patch.band ?? existing?.band,
    // Keep answers in memory only for this invocation — not in cookie.
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
  await clearSignedCookie(DRAFT_COOKIE_V2);
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

export async function restorePathFromClient(
  userId: string,
  raw: unknown,
): Promise<PathRecord | null> {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<PathRecord> & Partial<CompactPathClaims>;

  // Accept compact or full client mirror
  if (p.p === 1 && typeof p.b === "string") {
    const path = compactClaimsToPath(p as CompactPathClaims, userId);
    if (!path) return null;
    return persistPath(path);
  }

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
      ? p.completedLessonIds.filter((x): x is string => typeof x === "string").slice(-8)
      : [],
    injectedMicroLessons:
      p.level === "A1" ? ["piano.m1.l2", "piano.m1.l4"] : [],
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

export async function unlockNextLesson(
  userId: string,
  completedLessonId: string,
): Promise<PathRecord | null> {
  const path = await getPath(userId);
  if (!path) return null;

  const completed = path.completedLessonIds.includes(completedLessonId)
    ? path.completedLessonIds
    : [...path.completedLessonIds, completedLessonId].slice(-8);

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
