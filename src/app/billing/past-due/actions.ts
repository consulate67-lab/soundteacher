"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSubscription, setSubscriptionStatus } from "@/lib/subscription-store";

/** Mock: “ödeme yöntemini güncelle” → active. Real Stripe Customer Portal later. */
export async function resolvePastDueAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const sub = getSubscription(session.user.id);
  if (!sub) {
    redirect("/plans");
  }
  setSubscriptionStatus(session.user.id, "active");
  redirect("/home");
}
