import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePlacementAccess } from "@/lib/access";
import { getPath } from "@/lib/path-store";
import { hasPaidEntitlement } from "@/lib/trial-access";

export const metadata: Metadata = {
  title: "Yerleştirme sonucu",
  description: "Path özeti (S13) → deneme programı.",
};

/**
 * S13 — Yerleştirme sonucu.
 * Free users → /trial-program (deneme ders programı).
 * Paid → /home.
 */
export default async function PlacementResultPage() {
  const { session, subscription } = await requirePlacementAccess();
  const path = await getPath(session.user.id);
  if (!path?.placementComplete) {
    // Client-first trial bootstrap can restore from localStorage — avoid /placement bounce.
    redirect("/trial-program");
  }

  if (hasPaidEntitlement(subscription)) {
    redirect("/home");
  }
  redirect("/trial-program");
}
