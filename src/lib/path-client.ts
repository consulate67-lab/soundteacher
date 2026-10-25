/**
 * Browser mirror of Path — backup when Set-Cookie is dropped / delayed.
 * Server remains source of truth via compact JWT cookie after restore.
 */

import type { PathRecord } from "./path-store";
import { pathToCompactClaims } from "./path-cookie";

export const PATH_LOCAL_KEY = "st_path_v3";
const PATH_LOCAL_LEGACY = "st_path_v2";

export function savePathLocal(path: PathRecord): void {
  try {
    // Store compact claims + full open fields for restore flexibility
    const payload = {
      ...pathToCompactClaims(path),
      placementComplete: true,
      userId: path.userId,
      band: path.band,
      level: path.level,
      moduleEntry: path.moduleEntry,
      defaultSessionMinutes: path.defaultSessionMinutes,
      openLessonId: path.openLessonId,
      completedLessonIds: path.completedLessonIds.slice(-8),
      createdAt: path.createdAt,
      updatedAt: path.updatedAt,
    };
    localStorage.setItem(PATH_LOCAL_KEY, JSON.stringify(payload));
    localStorage.removeItem(PATH_LOCAL_LEGACY);
  } catch {
    /* private mode / quota */
  }
}

export function readPathLocal(): PathRecord | null {
  try {
    const raw =
      localStorage.getItem(PATH_LOCAL_KEY) ??
      localStorage.getItem(PATH_LOCAL_LEGACY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<PathRecord> & { p?: 1 };
    if (!(p.placementComplete === true || p.p === 1)) return null;
    if (typeof p.band !== "string" || typeof p.level !== "string") return null;
    if (typeof p.moduleEntry !== "number" || typeof p.openLessonId !== "string") {
      // compact-only mirror
      if (typeof (p as { b?: string }).b === "string") {
        const c = p as {
          u?: string;
          b: string;
          l: string;
          m: number;
          s?: number;
          o: string;
          c?: string;
          t?: string;
        };
        return {
          userId: c.u ?? "local",
          band: c.b as PathRecord["band"],
          level: c.l as PathRecord["level"],
          moduleEntry: c.m,
          defaultSessionMinutes: c.s ?? 15,
          openLessonId: c.o,
          completedLessonIds: [],
          injectedMicroLessons: c.l === "A1" ? ["piano.m1.l2", "piano.m1.l4"] : [],
          placementComplete: true,
          createdAt: c.c ?? new Date().toISOString(),
          updatedAt: c.t ?? new Date().toISOString(),
        };
      }
      return null;
    }
    return {
      userId: typeof p.userId === "string" ? p.userId : "local",
      band: p.band as PathRecord["band"],
      level: p.level as PathRecord["level"],
      moduleEntry: p.moduleEntry,
      defaultSessionMinutes:
        typeof p.defaultSessionMinutes === "number" ? p.defaultSessionMinutes : 15,
      openLessonId: p.openLessonId,
      completedLessonIds: Array.isArray(p.completedLessonIds)
        ? p.completedLessonIds.filter((x): x is string => typeof x === "string")
        : [],
      injectedMicroLessons:
        p.level === "A1" ? ["piano.m1.l2", "piano.m1.l4"] : [],
      placementComplete: true,
      createdAt:
        typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
      updatedAt:
        typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearPathLocal(): void {
  try {
    localStorage.removeItem(PATH_LOCAL_KEY);
    localStorage.removeItem(PATH_LOCAL_LEGACY);
  } catch {
    /* ignore */
  }
}
