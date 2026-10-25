import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireLessonEntitlement } from "@/lib/access";
import { getLesson, isLessonLocked, lessonTitle } from "@/lib/curriculum";
import { loadLessonContent } from "@/lib/lesson-content";
import { ensureLessonProgress } from "@/lib/lesson-progress-store";
import { resolveQuotaForUser } from "@/lib/resolve-quota";
import { hasPaidEntitlement, TRIAL_COPY } from "@/lib/trial-access";
import { isTrialProgramLessonLocked } from "@/lib/trial-program";
import { LessonSession } from "./lesson-session";

type Props = {
  params: Promise<{ lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  return { title: lesson ? lesson.titles.adult : lessonId };
}

/** Dilim D–F — ders kabuğu + Y1/Y2; ücretsiz deneme programı. */
export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const { session, path, subscription } = await requireLessonEntitlement(lessonId);
  const lesson = getLesson(lessonId);

  if (!lesson) {
    redirect("/home");
  }

  const paid = hasPaidEntitlement(subscription);
  const locked = paid
    ? isLessonLocked(
        lesson,
        path.openLessonId,
        path.completedLessonIds,
        path.moduleEntry,
      )
    : isTrialProgramLessonLocked(lessonId, path);

  if (locked) {
    redirect(`/lessons/${lessonId}/locked`);
  }

  if (!loadLessonContent(lessonId)) {
    redirect("/home");
  }

  const title = lessonTitle(lesson, path.band);
  const progress = await ensureLessonProgress(session.user.id, lessonId);
  const quota = await resolveQuotaForUser(session.user.id, subscription);
  const content = loadLessonContent(lessonId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-12">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/home" className="font-medium text-brand hover:underline">
          Path Home
        </Link>
        {!paid ? (
          <Link href="/trial-program" className="text-muted hover:text-foreground">
            Deneme programı
          </Link>
        ) : null}
      </div>

      {!paid ? (
        <p className="mt-4 rounded-md border border-border bg-brand-soft px-3 py-2 text-xs text-foreground">
          {TRIAL_COPY.bannerHome}
        </p>
      ) : null}

      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-medium text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        M{lesson.moduleId}.{lesson.order}
        {lesson.isGate ? " · kapı" : ""} · ~{path.defaultSessionMinutes} dk ·{" "}
        {path.band === "adult" ? "siz" : "sen"} dili · Y2 kota {quota.method2Remaining}/
        {quota.method2Limit}
        {!paid ? " · ücretsiz deneme" : ""}
      </p>
      <p className="mt-1 font-mono text-[0.65rem] text-muted">
        scoreRef: {content?.scoreRef ?? lesson.scoreRef}
      </p>

      <LessonSession
        lessonId={lessonId}
        band={path.band}
        title={title}
        sessionMinutes={path.defaultSessionMinutes}
        progress={progress}
        quota={quota}
        trialMode={!paid}
      />
    </main>
  );
}
