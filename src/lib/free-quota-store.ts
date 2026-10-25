/**
 * Listening quota for free-deneme users — durable via signed cookie on Vercel.
 */

import {
  readSignedCookie,
  writeSignedCookie,
} from "./signed-cookie";

type FreeQuota = {
  userId: string;
  method1Used: number;
  method2Used: number;
};

type Store = Map<string, FreeQuota>;

export const FREE_QUOTA_COOKIE = "st_free_quota_v1";
const COOKIE = FREE_QUOTA_COOKIE;

const globalForFree = globalThis as unknown as {
  __soundteacherFreeQuota?: Store;
};

function store(): Store {
  if (!globalForFree.__soundteacherFreeQuota) {
    globalForFree.__soundteacherFreeQuota = new Map();
  }
  return globalForFree.__soundteacherFreeQuota;
}

export async function getFreeQuota(userId: string): Promise<FreeQuota> {
  const mem = store().get(userId);
  if (mem) return mem;

  const fromCookie = await readSignedCookie<FreeQuota>(COOKIE);
  if (fromCookie && fromCookie.userId === userId) {
    store().set(userId, fromCookie);
    return fromCookie;
  }

  const fresh: FreeQuota = { userId, method1Used: 0, method2Used: 0 };
  store().set(userId, fresh);
  return fresh;
}

export async function consumeFreeQuota(
  userId: string,
  method: "1" | "2",
): Promise<FreeQuota> {
  const current = await getFreeQuota(userId);
  const next: FreeQuota = {
    ...current,
    method1Used: method === "1" ? current.method1Used + 1 : current.method1Used,
    method2Used: method === "2" ? current.method2Used + 1 : current.method2Used,
  };
  store().set(userId, next);
  await writeSignedCookie(COOKIE, next);
  return next;
}
