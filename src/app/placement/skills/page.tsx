import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlacementAccess } from "@/lib/access";
import { isBand, BAND_SHORT } from "@/lib/bands";
import { getPath, getPlacementDraft } from "@/lib/path-store";
import { SkillsForm } from "./skills-form";

export const metadata: Metadata = {
  title: "Beceri soruları",
  description: "Yerleştirme — beceri soruları (S11).",
};

type Props = {
  searchParams: Promise<{ band?: string }>;
};

/** S11 — Beceri soruları (bantlı metin). */
export default async function PlacementSkillsPage({ searchParams }: Props) {
  const { session } = await requirePlacementAccess();
  if ((await getPath(session.user.id))?.placementComplete) {
    redirect("/trial-program");
  }

  const params = await searchParams;
  const draft = await getPlacementDraft(session.user.id);
  const bandParam = params.band && isBand(params.band) ? params.band : draft?.band;
  if (!bandParam) {
    redirect("/placement");
  }

  const address =
    bandParam === "adult"
      ? "Sorular sizin mevcut becerinizi anlamamıza yardım eder."
      : "Bu sorular seni doğru dersten başlatmak için.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/placement"
        className="st-fade-up mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <p className="st-fade-up text-xs font-medium uppercase tracking-[0.14em] text-accent">
        Yerleştirme · 2/3 · {BAND_SHORT[bandParam]}
      </p>
      <h1 className="st-fade-up-delay mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Kısa beceri soruları
      </h1>
      <p className="st-fade-up-delay mt-2 text-sm leading-relaxed text-muted">{address}</p>

      <SkillsForm band={bandParam} />
    </main>
  );
}
