import type { SubscriptionRecord } from "./subscription";

/**
 * Dilim F — kota kuralları (ürün kararı, belgelenmiş):
 *
 * 1. Yöntem 1: yüksek limit; geçerli tamamlanmış Attempt → 1 birim.
 * 2. Yöntem 2: düşük limit; geçerli tamamlanmış Attempt → 1 birim.
 * 3. Geçersiz Attempt (silence / noise / too_quiet): kotadan DÜŞMEZ.
 * 4. Abandoned (S45): Yöntem 2 erken bırakma — kotadan DÜŞMEZ.
 *    Eşik: süre < Y2_ABANDON_MS veya istemci `abandoned=true` gönderirse.
 * 5. Kota dolunca ders kilitlenmez; S22 handoff → Yöntem 1’e düşür.
 */

export const Y2_ABANDON_MS = 5_000;
export const Y2_MAX_SECONDS = 45;
export const Y1_MAX_SECONDS = 12;

export type QuotaSnapshot = {
  method1Used: number;
  method1Limit: number;
  method2Used: number;
  method2Limit: number;
  method1Remaining: number;
  method2Remaining: number;
  method1Available: boolean;
  method2Available: boolean;
};

export function quotaSnapshot(sub: SubscriptionRecord): QuotaSnapshot {
  const method1Used = sub.quotaMethod1Used ?? 0;
  const method2Used = sub.quotaMethod2Used ?? 0;
  const method1Limit = sub.entitlement.quotaMethod1Limit;
  const method2Limit = sub.entitlement.quotaMethod2Limit;
  const method1Remaining = Math.max(0, method1Limit - method1Used);
  const method2Remaining = Math.max(0, method2Limit - method2Used);
  return {
    method1Used,
    method1Limit,
    method2Used,
    method2Limit,
    method1Remaining,
    method2Remaining,
    method1Available: method1Remaining > 0,
    method2Available: method2Remaining > 0,
  };
}

export function canUseMethod(sub: SubscriptionRecord, method: "1" | "2"): boolean {
  const q = quotaSnapshot(sub);
  return method === "1" ? q.method1Available : q.method2Available;
}

/** Clear abandon: short stop or explicit flag — no quota burn. */
export function isAbandonedTake(input: {
  method: "1" | "2";
  durationMs: number;
  abandonedFlag?: boolean;
}): boolean {
  if (input.abandonedFlag) return true;
  if (input.method === "2" && input.durationMs < Y2_ABANDON_MS) return true;
  return false;
}

/**
 * Should this Attempt consume quota?
 * Only valid, non-abandoned completions.
 */
export function shouldConsumeQuota(input: {
  valid: boolean;
  abandoned: boolean;
}): boolean {
  return input.valid && !input.abandoned;
}
