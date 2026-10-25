import type { PathRecord } from "./path-store";
import type { QuotaSnapshot } from "./quota";
import type { SubscriptionRecord } from "./subscription";
import { hasLessonAccess } from "./subscription";
import {
  isTrialProgramComplete,
  trialProgramLessonIds,
} from "./trial-program";

/**
 * Free deneme — no paid Stripe entitlement.
 * Scope = generated deneme programı (typically 4 lessons from M1–M2 / entry).
 */

export const FREE_TRIAL_QUOTA = {
  method1Limit: 24,
  method2Limit: 2,
} as const;

/** Paid Stripe trial or active monthly/yearly. */
export function hasPaidEntitlement(
  sub: SubscriptionRecord | null | undefined,
): boolean {
  return Boolean(sub && hasLessonAccess(sub.status));
}

/** Lesson in this user's deneme programı (or legacy M1.L1–L2). */
export function isLessonInFreeTrialScope(
  lessonId: string,
  path?: Pick<PathRecord, "level" | "moduleEntry"> | null,
): boolean {
  if (path) {
    return trialProgramLessonIds(path).includes(lessonId);
  }
  // Fallback without path: M1 first four + M2 first two
  return (
    lessonId.startsWith("piano.m1.l") &&
    ["1", "2", "3", "4"].includes(lessonId.slice(-1))
  );
}

export function canAccessLesson(
  sub: SubscriptionRecord | null | undefined,
  lessonId: string,
  path?: Pick<PathRecord, "level" | "moduleEntry"> | null,
): boolean {
  if (hasPaidEntitlement(sub)) return true;
  return isLessonInFreeTrialScope(lessonId, path);
}

/** Soft CTA after deneme pack done or open lesson left free scope. */
export function shouldPromptSubscribe(
  sub: SubscriptionRecord | null | undefined,
  path: PathRecord | null | undefined,
): boolean {
  if (hasPaidEntitlement(sub)) return false;
  if (!path?.placementComplete) return false;
  if (!canAccessLesson(sub, path.openLessonId, path)) return true;
  return isTrialProgramComplete(path);
}

export function freeTrialQuotaSnapshot(usage: {
  method1Used: number;
  method2Used: number;
}): QuotaSnapshot {
  const method1Used = usage.method1Used;
  const method2Used = usage.method2Used;
  const method1Limit = FREE_TRIAL_QUOTA.method1Limit;
  const method2Limit = FREE_TRIAL_QUOTA.method2Limit;
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

export const TRIAL_COPY = {
  landingBlurb:
    "Ücretsiz deneme programı — abonelik sonra. Yaş × seviye yolun ve dinleme geri bildirimi.",
  ctaStart: "Ücretsiz dene",
  ctaPlans: "Planlar",
  ctaFirstLesson: "İlk deneme dersine başla",
  bannerHome:
    "Deneme programın ücretsiz. Tam Path için abonelik — istediğin zaman.",
  bannerSubscribe:
    "Ücretsiz deneme programın bitti. Plan seçerek Path’e devam et.",
  lockedSubscribe:
    "Bu ders deneme programının dışında. Abonelik ile devam — ödeme mock da olabilir.",
  placementNote:
    "Yerleştirme ücretsizdir. Ardından kısa deneme programın gösterilir.",
  programEyebrow: "Deneme programın",
} as const;
