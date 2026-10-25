import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePath } from "@/lib/access";
import { getLesson, isLessonLocked, lessonTitle } from "@/lib/curriculum";
import { loadLessonContent } from "@/lib/lesson-content";
import { ensureLessonProgress } from "@/lib/lesson-progress-store";
import { quotaSnapshot } from "@/lib/quota";
import { LessonSession } from "./lesson-session";

type Props = {
  params: Promise<{ lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  return { title: lesson ? lesson.titles.adult : lessonId };
}

/** Dilim D–F — M1 ders kabuğu + Y1/Y2 dinleme + kota. */
export default async function LessonPage({ params }: Props) {
  const { session, path, subscription } = await requirePath();
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);

  if (!lesson) {
    redirect("/home");
  }

  if (
    isLessonLocked(lesson, path.openLessonId, path.completedLessonIds, path.moduleEntry)
  ) {
    redirect(`/lessons/${lessonId}/locked`);
  }

  if (!loadLessonContent(lessonId)) {
    redirect("/home");
  }

  const title = lessonTitle(lesson, path.band);
  const progress = ensureLessonProgress(session.user.id, lessonId);
  const quota = quotaSnapshot(subscription);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-12">
      <Link href="/home" className="text-sm font-medium text-brand hover:underline">
        ← Path Home
      </Link>

      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        M{lesson.moduleId}.{lesson.order} · ~{path.defaultSessionMinutes} dk ·{" "}
        {path.band === "adult" ? "siz" : "sen"} dili · Y2 kota {quota.method2Remaining}/
        {quota.method2Limit}
      </p>

      <LessonSession
        lessonId={lessonId}
        band={path.band}
        title={title}
        sessionMinutes={path.defaultSessionMinutes}
        progress={progress}
        quota={quota}
      />
    </main>
  );
}
