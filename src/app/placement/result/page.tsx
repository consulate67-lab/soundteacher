import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSubscribed } from "@/lib/access";
import { BAND_SHORT } from "@/lib/bands";
import { getLesson, lessonTitle } from "@/lib/curriculum";
import { getPath } from "@/lib/path-store";

export const metadata: Metadata = {
  title: "Yerleştirme sonucu",
  description: "Path özeti (S13).",
};

/** S13 — Yerleştirme sonucu. */
export default async function PlacementResultPage() {
  const { session } = await requireSubscribed();
  const path = getPath(session.user.id);
  if (!path?.placementComplete) {
    redirect("/placement");
  }

  const open = getLesson(path.openLessonId);
  const openTitle = open ? lessonTitle(open, path.band) : path.openLessonId;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Yerleştirme · sonuç
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Yolun hazır
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {path.band === "adult"
          ? "İşte sizin için önerilen başlangıç."
          : "İşte senin için önerilen başlangıç."}
      </p>

      <dl className="mt-8 space-y-3 rounded-md border border-border bg-surface px-4 py-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Bant</dt>
          <dd className="font-medium">{BAND_SHORT[path.band]}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Seviye</dt>
          <dd className="font-medium">{path.level}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Modül girişi</dt>
          <dd className="font-medium">Modül {path.moduleEntry}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Oturum</dt>
          <dd className="font-medium">~{path.defaultSessionMinutes} dk</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">İlk ders</dt>
          <dd className="max-w-[14rem] text-right font-medium">{openTitle}</dd>
        </div>
      </dl>

      {path.injectedMicroLessons.length > 0 ? (
        <p className="mt-4 text-xs text-muted">
          A1 için Modül 1’den mikro fırça dersleri yola eklendi (iskelet).
        </p>
      ) : null}

      <Link
        href="/home"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        İlk derse git
      </Link>
    </main>
  );
}
