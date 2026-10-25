import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlacementAccess } from "@/lib/access";
import { getPath } from "@/lib/path-store";
import { TRIAL_COPY } from "@/lib/trial-access";
import { BandForm } from "./band-form";

export const metadata: Metadata = {
  title: "Yaş bandı",
  description: "Yerleştirme — yaş bandı seçimi (S10).",
};

/** S10 — Yaş / bant. */
export default async function PlacementBandPage() {
  const { session } = await requirePlacementAccess();
  const path = await getPath(session.user.id);
  if (path?.placementComplete) {
    redirect("/trial-program");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Yerleştirme · 1/3 · ücretsiz
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Yaş bandını seç
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Dil, oturum süresi ve örnekler buna göre uyarlanır. Yaş tek başına seviyeni
        yükseltmez. {TRIAL_COPY.placementNote}
      </p>

      <BandForm />
    </main>
  );
}
