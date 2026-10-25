/**
 * Browser mirror of Path — backup when Set-Cookie is dropped.
 * Server remains source of truth via JWT cookie after restore.
 */

import type { PathRecord } from "./path-store";

export const PATH_LOCAL_KEY = "st_path_v2";

export function savePathLocal(path: PathRecord): void {
  try {
    localStorage.setItem(PATH_LOCAL_KEY, JSON.stringify(path));
  } catch {
    /* private mode / quota */
  }
}

export function readPathLocal(): PathRecord | null {
  try {
    const raw = localStorage.getItem(PATH_LOCAL_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PathRecord;
    if (!p?.placementComplete) return null;
    return p;
  } catch {
    return null;
  }
}

export function clearPathLocal(): void {
  try {
    localStorage.removeItem(PATH_LOCAL_KEY);
  } catch {
    /* ignore */
  }
}
