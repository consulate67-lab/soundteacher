/**
 * Compact Path JWT claims — keep Set-Cookie well under browser ~4KB limits.
 * Progress arrays live in localStorage (client) + optional short `done` field.
 */

import type { Band } from "./bands";
import type { Level } from "./placement";
import type { PathRecord } from "./path-store";

/** Cookie name for minimal Path claims. */
export const PATH_COOKIE = "st_path_v3";
export const PATH_COOKIE_V2 = "st_path_v2";
export const PATH_COOKIE_V1 = "st_path_v1";

export type CompactPathClaims = {
  u: string; // userId
  b: Band;
  l: Level;
  m: number; // moduleEntry
  s: number; // defaultSessionMinutes
  o: string; // openLessonId
  p: 1; // placementComplete
  c: string; // createdAt
  t: string; // updatedAt
  /** Cap ~8 compressed lesson tokens, e.g. "1.1,1.2,2.1" */
  d?: string;
};

const MAX_DONE = 8;

/** piano.m1.l2 → 1.2 */
export function compressLessonId(id: string): string | null {
  const m = /^piano\.m(\d+)\.l(\d+)$/.exec(id);
  if (!m) return null;
  return `${m[1]}.${m[2]}`;
}

export function expandLessonId(token: string): string | null {
  const m = /^(\d+)\.(\d+)$/.exec(token.trim());
  if (!m) return null;
  return `piano.m${m[1]}.l${m[2]}`;
}

export function encodeDone(ids: string[]): string {
  const out: string[] = [];
  for (const id of ids) {
    const t = compressLessonId(id);
    if (t && !out.includes(t)) out.push(t);
  }
  return out.slice(-MAX_DONE).join(",");
}

export function decodeDone(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map(expandLessonId)
    .filter((x): x is string => Boolean(x));
}

export function pathToCompactClaims(record: PathRecord): CompactPathClaims {
  const claims: CompactPathClaims = {
    u: record.userId,
    b: record.band,
    l: record.level,
    m: record.moduleEntry,
    s: record.defaultSessionMinutes,
    o: record.openLessonId,
    p: 1,
    c: record.createdAt,
    t: record.updatedAt,
  };
  const done = encodeDone(record.completedLessonIds);
  if (done) claims.d = done;
  return claims;
}

export function compactClaimsToPath(
  claims: CompactPathClaims,
  sessionUserId: string,
): PathRecord | null {
  if (claims.p !== 1) return null;
  if (typeof claims.b !== "string" || typeof claims.l !== "string") return null;
  if (typeof claims.m !== "number" || typeof claims.o !== "string") return null;

  const userId = sessionUserId || claims.u;
  const completedLessonIds = decodeDone(claims.d);
  const injectedMicroLessons =
    claims.l === "A1" ? ["piano.m1.l2", "piano.m1.l4"] : [];

  return {
    userId,
    band: claims.b,
    level: claims.l,
    moduleEntry: claims.m,
    defaultSessionMinutes: typeof claims.s === "number" ? claims.s : 15,
    openLessonId: claims.o,
    completedLessonIds,
    injectedMicroLessons,
    placementComplete: true,
    createdAt: typeof claims.c === "string" ? claims.c : new Date().toISOString(),
    updatedAt: typeof claims.t === "string" ? claims.t : new Date().toISOString(),
  };
}

/** Legacy fat PathRecord cookie payloads (v1/v2). */
export function legacyCookieToPath(
  raw: Record<string, unknown>,
  sessionUserId: string,
): PathRecord | null {
  if (raw.p === 1 || raw.placementComplete === true) {
    // already compact?
    if (typeof raw.u === "string" && typeof raw.b === "string") {
      return compactClaimsToPath(raw as unknown as CompactPathClaims, sessionUserId);
    }
  }
  if (raw.placementComplete !== true) return null;
  if (typeof raw.band !== "string" || typeof raw.level !== "string") return null;
  if (typeof raw.moduleEntry !== "number" || typeof raw.openLessonId !== "string") {
    return null;
  }
  return {
    userId: sessionUserId,
    band: raw.band as Band,
    level: raw.level as Level,
    moduleEntry: raw.moduleEntry,
    defaultSessionMinutes:
      typeof raw.defaultSessionMinutes === "number" ? raw.defaultSessionMinutes : 15,
    openLessonId: raw.openLessonId as string,
    completedLessonIds: Array.isArray(raw.completedLessonIds)
      ? (raw.completedLessonIds as string[]).filter((x) => typeof x === "string")
      : [],
    injectedMicroLessons: Array.isArray(raw.injectedMicroLessons)
      ? (raw.injectedMicroLessons as string[]).filter((x) => typeof x === "string")
      : raw.level === "A1"
        ? ["piano.m1.l2", "piano.m1.l4"]
        : [],
    placementComplete: true,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

export async function measureJwtBytes(
  seal: (v: Record<string, unknown>) => Promise<string>,
  claims: Record<string, unknown>,
): Promise<number> {
  const token = await seal(claims);
  return token.length;
}
