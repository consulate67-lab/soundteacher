import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePath, requireSubscribed } from "@/lib/access";
import { getLesson, isLessonLocked, lessonTitle } from "@/lib/curriculum";
import { getSubscription } from "@/lib/subscription-store";
import { hasLessonAccess } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Ders kilitli",
  description: "Sıra dışı veya hak yok (S21).",
};

type Props = {
  params: Promise<{ lessonId: string }>;
};

/** S21 — Ders kilitli. */
export default async function LessonLockedPage({ params }: Props) {
  const { session, path } = await requirePath();
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);

  // Entitlement edge: if somehow past_due mid-nav, requirePath already blocked.
  const sub = getSubscription(session.user.id);
  if (!sub || !hasLessonAccess(sub.status)) {
    await requireSubscribed();
  }

  if (!lesson) {
    redirect("/home");
  }

  const locked = isLessonLocked(
    lesson,
    path.openLessonId,
    path.completedLessonIds,
    path.moduleEntry,
  );

  if (!locked) {
    redirect(`/lessons/${lessonId}`);
  }

  const title = lessonTitle(lesson, path.band);
  const reason =
    lesson.moduleId < path.moduleEntry
      ? "Bu ders yerleştirme girişinin öncesinde — zorunlu değil (mikro fırça ayrı)."
      : "Sıkı sıra: önce açık dersini bitir, sonra bu ders açılır.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        Ders kilitli
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        <strong>{title}</strong> henüz açık değil. {reason}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href={`/lessons/${path.openLessonId}`}
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Açık derse dön
        </Link>
        <Link
          href="/home"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft"
        >
          Path Home
        </Link>
        <Link
          href="/plans"
          className="text-center text-sm text-muted hover:text-foreground"
        >
          Aboneliği kontrol et
        </Link>
      </div>
    </main>
  );
}
