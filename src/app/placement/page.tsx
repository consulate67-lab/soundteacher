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
        className="st-fade-up mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <p className="st-fade-up text-xs font-medium uppercase tracking-[0.14em] text-accent">
        Yerleştirme · 1/3 · ücretsiz
      </p>
      <h1 className="st-fade-up-delay mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Yaş bandını seç
      </h1>
      <p className="st-fade-up-delay mt-2 text-sm leading-relaxed text-muted">
        Dil, oturum süresi ve örnekler buna göre uyarlanır. Yaş tek başına seviyeni
        yükseltmez. {TRIAL_COPY.placementNote}
      </p>

      <div className="st-fade-up-delay-2">
        <BandForm />
      </div>
    </main>
  );
}
