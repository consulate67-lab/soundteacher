import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPath, getPlacementDraft } from "@/lib/path-store";
import { getSubscription } from "@/lib/subscription-store";
import { isPastDue, type SubscriptionRecord } from "@/lib/subscription";
import {
  canAccessLesson,
  hasPaidEntitlement,
} from "@/lib/trial-access";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/** Gate for paid Path / full catalog — Stripe trial or active only. */
export async function requireSubscribed() {
  const session = await requireSession();
  const sub = getSubscription(session.user.id);

  if (!sub || !hasPaidEntitlement(sub)) {
    redirect("/plans");
  }
  if (isPastDue(sub.status)) {
    redirect("/billing/past-due");
  }
  return { session, subscription: sub };
}

/**
 * Account + completed Path. Subscription optional for free deneme.
 * past_due still blocks.
 */
export async function requirePath(): Promise<{
  session: Awaited<ReturnType<typeof requireSession>>;
  subscription: SubscriptionRecord | null;
  path: NonNullable<Awaited<ReturnType<typeof getPath>>>;
}> {
  const session = await requireSession();
  const subscription = getSubscription(session.user.id);

  if (subscription && isPastDue(subscription.status)) {
    redirect("/billing/past-due");
  }

  const path = await getPath(session.user.id);
  if (path?.placementComplete) {
    return { session, subscription, path };
  }
  const draft = await getPlacementDraft(session.user.id);
  if (draft?.band) {
    redirect("/placement/incomplete");
  }
  redirect("/placement");
}

/** Placement funnel — session only; no paid entitlement required. */
export async function requirePlacementAccess() {
  const session = await requireSession();
  const subscription = getSubscription(session.user.id);
  if (subscription && isPastDue(subscription.status)) {
    redirect("/billing/past-due");
  }
  return { session, subscription };
}

/**
 * Lesson surface: paid entitlement OR free deneme lesson (program pack).
 */
export async function requireLessonEntitlement(lessonId: string) {
  const ctx = await requirePath();
  if (!canAccessLesson(ctx.subscription, lessonId, ctx.path)) {
    redirect(`/lessons/${lessonId}/locked`);
  }
  return ctx;
}
