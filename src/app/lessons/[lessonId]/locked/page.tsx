import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePath } from "@/lib/access";
import { getLesson, isLessonLocked, lessonTitle } from "@/lib/curriculum";
import {
  canAccessLesson,
  hasPaidEntitlement,
  TRIAL_COPY,
} from "@/lib/trial-access";

export const metadata: Metadata = {
  title: "Ders kilitli",
  description: "Sıra dışı veya deneme kapsamı dışı (S21).",
};

type Props = {
  params: Promise<{ lessonId: string }>;
};

/** S21 — Ders kilitli (sıra veya abonelik). */
export default async function LessonLockedPage({ params }: Props) {
  const { path, subscription } = await requirePath();
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);

  if (!lesson) {
    redirect("/home");
  }

  const sequenceLocked = isLessonLocked(
    lesson,
    path.openLessonId,
    path.completedLessonIds,
    path.moduleEntry,
  );
  const needsSub = !canAccessLesson(subscription, lessonId);
  const paid = hasPaidEntitlement(subscription);

  if (!sequenceLocked && !needsSub) {
    redirect(`/lessons/${lessonId}`);
  }

  const title = lessonTitle(lesson, path.band);
  const reason = needsSub
    ? TRIAL_COPY.lockedSubscribe
    : lesson.moduleId < path.moduleEntry
      ? "Bu ders yerleştirme girişinin öncesinde — zorunlu değil (mikro fırça ayrı)."
      : "Sıkı sıra: önce açık dersini bitir, sonra bu ders açılır.";

  const openAllowed = canAccessLesson(subscription, path.openLessonId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-brand"
      >
        SoundTeacher
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        {needsSub ? "Abonelik gerekir" : "Ders kilitli"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        <strong>{title}</strong> henüz açık değil. {reason}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {needsSub || !paid ? (
          <Link
            href="/plans"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Plan seç — devam et
          </Link>
        ) : null}
        {openAllowed ? (
          <Link
            href={`/lessons/${path.openLessonId}`}
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft"
          >
            Açık derse dön
          </Link>
        ) : null}
        <Link
          href="/home"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:bg-brand-soft"
        >
          Path Home
        </Link>
      </div>
    </main>
  );
}
