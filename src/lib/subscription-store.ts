import type { PlanId } from "./plans";
import {
  entitlementFor,
  type SubscriptionRecord,
  type SubscriptionStatus,
} from "./subscription";

/**
 * Dilim B mock store — in-memory only.
 * Replace with Postgres (Subscription + Entitlement) when DATABASE_URL is wired.
 */
type Store = Map<string, SubscriptionRecord>;

const globalForStore = globalThis as unknown as {
  __soundteacherSubs?: Store;
};

function store(): Store {
  if (!globalForStore.__soundteacherSubs) {
    globalForStore.__soundteacherSubs = new Map();
  }
  return globalForStore.__soundteacherSubs;
}

function periodEndFor(plan: PlanId, from: Date): string | null {
  const end = new Date(from);
  if (plan === "trial") {
    end.setDate(end.getDate() + 7);
    return end.toISOString();
  }
  if (plan === "monthly") {
    end.setMonth(end.getMonth() + 1);
    return end.toISOString();
  }
  if (plan === "quarterly") {
    end.setMonth(end.getMonth() + 3);
    return end.toISOString();
  }
  if (plan === "semiannual") {
    end.setMonth(end.getMonth() + 6);
    return end.toISOString();
  }
  if (plan === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
    return end.toISOString();
  }
  return null;
}

export function getSubscription(userId: string): SubscriptionRecord | null {
  const sub = store().get(userId);
  return sub ? normalizeSub(sub) : null;
}

export function upsertSubscription(input: {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubId?: string | null;
}): SubscriptionRecord {
  const now = new Date();
  const existing = store().get(input.userId);
  const record: SubscriptionRecord = {
    userId: input.userId,
    plan: input.plan,
    status: input.status,
    periodStart: now.toISOString(),
    periodEnd: periodEndFor(input.plan, now),
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubId: input.stripeSubId ?? null,
    entitlement: entitlementFor(input.plan, input.status),
    quotaMethod1Used: existing?.quotaMethod1Used ?? 0,
    quotaMethod2Used: existing?.quotaMethod2Used ?? 0,
    updatedAt: now.toISOString(),
  };
  store().set(input.userId, record);
  return record;
}

export function consumeQuota(
  userId: string,
  method: "1" | "2",
): SubscriptionRecord | null {
  const existing = store().get(userId);
  if (!existing) return null;
  const updated: SubscriptionRecord = {
    ...normalizeSub(existing),
    quotaMethod1Used:
      method === "1"
        ? (existing.quotaMethod1Used ?? 0) + 1
        : (existing.quotaMethod1Used ?? 0),
    quotaMethod2Used:
      method === "2"
        ? (existing.quotaMethod2Used ?? 0) + 1
        : (existing.quotaMethod2Used ?? 0),
    updatedAt: new Date().toISOString(),
  };
  store().set(userId, updated);
  return updated;
}

/** Ensure older in-memory records have usage fields. */
export function normalizeSub(sub: SubscriptionRecord): SubscriptionRecord {
  return {
    ...sub,
    quotaMethod1Used: sub.quotaMethod1Used ?? 0,
    quotaMethod2Used: sub.quotaMethod2Used ?? 0,
  };
}

export function setSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
): SubscriptionRecord | null {
  const existing = store().get(userId);
  if (!existing) return null;
  const base = normalizeSub(existing);
  const updated: SubscriptionRecord = {
    ...base,
    status,
    entitlement: entitlementFor(existing.plan, status),
    updatedAt: new Date().toISOString(),
  };
  store().set(userId, updated);
  return updated;
}

export function activateFromCheckout(input: {
  userId: string;
  plan: PlanId;
  stripeCustomerId?: string | null;
  stripeSubId?: string | null;
}): SubscriptionRecord {
  const status: SubscriptionStatus = input.plan === "trial" ? "trial" : "active";
  return upsertSubscription({
    userId: input.userId,
    plan: input.plan,
    status,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubId: input.stripeSubId,
  });
}
