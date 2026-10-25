import type { PlanId } from "./plans";

/** Mirrors abonelik-iskeleti.md §4 / mimari Subscription.status */
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

export type Entitlement = {
  instrumentAccess: "piano";
  quotaMethod1Limit: number;
  quotaMethod2Limit: number;
  moduleAccessPolicy: "strict_sequence";
};

export type SubscriptionRecord = {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  periodStart: string;
  periodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  entitlement: Entitlement;
  /** Dilim F — in-memory usage counters for the current period. */
  quotaMethod1Used: number;
  quotaMethod2Used: number;
  updatedAt: string;
};

export function entitlementFor(plan: PlanId, status: SubscriptionStatus): Entitlement {
  const base: Entitlement = {
    instrumentAccess: "piano",
    moduleAccessPolicy: "strict_sequence",
    quotaMethod1Limit: status === "trial" ? 20 : 200,
    quotaMethod2Limit: status === "trial" ? 2 : 30,
  };
  if (status === "past_due" || status === "canceled") {
    return { ...base, quotaMethod1Limit: 0, quotaMethod2Limit: 0 };
  }
  return base;
}

/** Lesson / Path access — Dilim B mock policy: trial + active only. past_due blocks immediately. */
export function hasLessonAccess(status: SubscriptionStatus | null | undefined): boolean {
  return status === "trial" || status === "active";
}

export function isPastDue(status: SubscriptionStatus | null | undefined): boolean {
  return status === "past_due";
}

export function statusLabelTr(status: SubscriptionStatus): string {
  switch (status) {
    case "trial":
      return "Deneme";
    case "active":
      return "Aktif";
    case "past_due":
      return "Ödeme gecikmiş";
    case "canceled":
      return "İptal";
  }
}
