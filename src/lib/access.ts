import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSubscription } from "@/lib/subscription-store";
import { hasLessonAccess, isPastDue } from "@/lib/subscription";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/** Gate for Path Home / lesson surfaces (Dilim B mock entitlement). */
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
