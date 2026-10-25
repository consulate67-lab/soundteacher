import { getLesson } from "./curriculum";
import type { PathRecord } from "./path-store";
import type { QuotaSnapshot } from "./quota";
import type { SubscriptionRecord } from "./subscription";
import { hasLessonAccess } from "./subscription";

/**
 * Free deneme (no paid/trial Stripe entitlement required).
 * Scope: first two M1 lessons — placement + M1.L1–L2 listening.
 * Beyond that → soft subscribe prompt; mock checkout still available.
 */

export const FREE_TRIAL_LESSON_IDS = ["piano.m1.l1", "piano.m1.l2"] as const;

export type FreeTrialLessonId = (typeof FREE_TRIAL_LESSON_IDS)[number];

export const FREE_TRIAL_QUOTA = {
  method1Limit: 20,
  method2Limit: 1,
} as const;

export function isFreeTrialLessonId(lessonId: string): boolean {
  return (FREE_TRIAL_LESSON_IDS as readonly string[]).includes(lessonId);
}

/** Paid Stripe trial or active monthly/yearly. */
export function hasPaidEntitlement(
  sub: SubscriptionRecord | null | undefined,
): boolean {
  return Boolean(sub && hasLessonAccess(sub.status));
}

/** Lesson playable without paid entitlement. */
export function isLessonInFreeTrialScope(lessonId: string): boolean {
  if (isFreeTrialLessonId(lessonId)) return true;
  const lesson = getLesson(lessonId);
  // Defensive: any M1 L1–L2 by module/order
  return Boolean(lesson && lesson.moduleId === 1 && lesson.order <= 2);
}

export function canAccessLesson(
  sub: SubscriptionRecord | null | undefined,
  lessonId: string,
): boolean {
  if (hasPaidEntitlement(sub)) return true;
  return isLessonInFreeTrialScope(lessonId);
}

/** Soft CTA after deneme pack done or open lesson left free scope. */
export function shouldPromptSubscribe(
  sub: SubscriptionRecord | null | undefined,
  path: PathRecord | null | undefined,
): boolean {
  if (hasPaidEntitlement(sub)) return false;
  if (!path?.placementComplete) return false;
  if (!canAccessLesson(sub, path.openLessonId)) return true;
  const done = FREE_TRIAL_LESSON_IDS.every((id) =>
    path.completedLessonIds.includes(id),
  );
  return done;
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
    "İlk dersler ücretsiz deneme — abonelik sonra. Yaş × seviye yolun ve dinleme geri bildirimi.",
  ctaStart: "Ücretsiz dene",
  ctaPlans: "Planlar",
  bannerHome:
    "Deneme: M1 ilk 2 ders ücretsiz. Tam Path için abonelik — istediğin zaman.",
  bannerSubscribe:
    "Ücretsiz denemen bitti (veya sonraki ders abonelik ister). Plan seçerek devam et.",
  lockedSubscribe:
    "Bu ders deneme kapsamının dışında. Abonelik ile Path’in devamı açılır — ödeme mock da olabilir.",
  placementNote: "Yerleştirme ücretsizdir. Abonelik ilk deneme derslerinden sonra.",
} as const;
