import { getFreeQuota } from "./free-quota-store";
import { quotaSnapshot, type QuotaSnapshot } from "./quota";
import type { SubscriptionRecord } from "./subscription";
import {
  freeTrialQuotaSnapshot,
  hasPaidEntitlement,
} from "./trial-access";

/** Quota for paid sub, or free-deneme counters when no entitlement. */
export function resolveQuotaForUser(
  userId: string,
  sub: SubscriptionRecord | null,
): QuotaSnapshot {
  if (hasPaidEntitlement(sub) && sub) {
    return quotaSnapshot(sub);
  }
  const free = getFreeQuota(userId);
  return freeTrialQuotaSnapshot(free);
}
