import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPath, getPlacementDraft } from "@/lib/path-store";
import { getSubscription } from "@/lib/subscription-store";
import { hasLessonAccess, isPastDue } from "@/lib/subscription";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/** Gate for Path Home / lesson surfaces — trial/active entitlement. */
export async function requireSubscribed() {
  const session = await requireSession();
  const sub = getSubscription(session.user.id);

  if (!sub) {
    redirect("/plans");
  }
  if (isPastDue(sub.status)) {
    redirect("/billing/past-due");
  }
  if (!hasLessonAccess(sub.status)) {
    redirect("/billing/past-due");
  }
  return { session, subscription: sub };
}

/**
 * Subscribed + completed Path. Incomplete placement → S14; none → S10.
 */
export async function requirePath() {
  const { session, subscription } = await requireSubscribed();
  const path = getPath(session.user.id);
  if (path?.placementComplete) {
    return { session, subscription, path };
  }
  const draft = getPlacementDraft(session.user.id);
  if (draft?.band) {
    redirect("/placement/incomplete");
  }
  redirect("/placement");
}
