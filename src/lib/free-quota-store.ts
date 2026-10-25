/**
 * In-memory listening quota for users without a Subscription record
 * (free deneme). Paid users use subscription-store counters instead.
 */

type FreeQuota = {
  userId: string;
  method1Used: number;
  method2Used: number;
};

type Store = Map<string, FreeQuota>;

const globalForFree = globalThis as unknown as {
  __soundteacherFreeQuota?: Store;
};

function store(): Store {
  if (!globalForFree.__soundteacherFreeQuota) {
    globalForFree.__soundteacherFreeQuota = new Map();
  }
  return globalForFree.__soundteacherFreeQuota;
}

export function getFreeQuota(userId: string): FreeQuota {
  const existing = store().get(userId);
  if (existing) return existing;
  const fresh: FreeQuota = { userId, method1Used: 0, method2Used: 0 };
  store().set(userId, fresh);
  return fresh;
}

export function consumeFreeQuota(
  userId: string,
  method: "1" | "2",
): FreeQuota {
  const current = getFreeQuota(userId);
  const next: FreeQuota = {
    ...current,
    method1Used: method === "1" ? current.method1Used + 1 : current.method1Used,
    method2Used: method === "2" ? current.method2Used + 1 : current.method2Used,
  };
  store().set(userId, next);
  return next;
}
