import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlacementAccess } from "@/lib/access";
import { getPath, getPlacementDraft } from "@/lib/path-store";
import { needsVerification } from "@/lib/placement";
import { VerifyActions } from "./verify-actions";

export const metadata: Metadata = {
  title: "Doğrulama",
  description: "Yerleştirme doğrulama kaydı (S12) — mock.",
};

/** S12 — Doğrulama kaydı (A2/B1 adayı); ses yok, mock. */
export default async function PlacementVerifyPage() {
  const { session } = await requirePlacementAccess();
  if ((await getPath(session.user.id))?.placementComplete) {
    redirect("/placement/result");
  }
  const draft = await getPlacementDraft(session.user.id);
  if (!draft?.provisional || !needsVerification(draft.provisional.level)) {
    redirect(draft?.band ? "/placement/skills" : "/placement");
  }

  const band = draft.provisional.band;
  const methodHint =
    band === "child"
      ? "Önerilen yöntem: Ortam kaydı (Yöntem 1). Bakıcı mic yardımı OK."
      : band === "teen"
        ? "Önerilen yöntem: Ortam veya performans kaydı."
        : "Önerilen yöntem: Performans kaydı (Yöntem 2); yoksa ortam.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Yerleştirme · doğrulama
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Kısa ezgi doğrulaması
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Seviye adayın <strong>{draft.provisional.level}</strong>. Kısa bir ezgi dinlemesi
        seviyenizi doğrular. {methodHint}
      </p>

      <VerifyActions />
    </main>
  );
}
