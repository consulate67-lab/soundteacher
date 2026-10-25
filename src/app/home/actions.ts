"use server";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { setSubscriptionStatus } from "@/lib/subscription-store";

export async function simulatePastDueAction() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  setSubscriptionStatus(session.user.id, "past_due");
  redirect("/billing/past-due");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
