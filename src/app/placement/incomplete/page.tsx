import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlacementAccess } from "@/lib/access";
import { getPath, getPlacementDraft } from "@/lib/path-store";

export const metadata: Metadata = {
  title: "Yerleştirmeyi bitir",
  description: "Yerleştirme yarım kaldı (S14).",
};

/** S14 — Yerleştirme yarım. */
export default async function PlacementIncompletePage() {
  const { session } = await requirePlacementAccess();
  if ((await getPath(session.user.id))?.placementComplete) {
    redirect("/trial-program");
  }

  const draft = await getPlacementDraft(session.user.id);
  const resumeHref = draft?.provisional
    ? needsVerifyHref(draft)
    : draft?.band
      ? `/placement/skills?band=${draft.band}`
      : "/placement";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Yerleştirmeyi bitir
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Aboneliğin aktif. Path ve ilk ders, yerleştirmeyi tamamladığında açılır.
      </p>

      <Link
        href={resumeHref}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Yerleştirmeyi bitir
      </Link>
    </main>
  );
}

function needsVerifyHref(draft: { provisional?: { level: string } | null }): string {
  const level = draft.provisional?.level;
  if (level === "A2" || level === "B1") return "/placement/verify";
  return "/placement/result";
}
