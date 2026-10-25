"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLesson, isLessonLocked } from "@/lib/curriculum";
import {
  ensureLessonProgress,
  resetLessonToPractice,
  setLessonPhase,
  type LessonPhase,
} from "@/lib/lesson-progress-store";
import { getPath, unlockNextLesson } from "@/lib/path-store";
import { getSubscription } from "@/lib/subscription-store";
import { hasLessonAccess } from "@/lib/subscription";

async function requireLessonAccess(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = getSubscription(session.user.id);
  if (!sub || !hasLessonAccess(sub.status)) redirect("/plans");

  const path = getPath(session.user.id);
  if (!path?.placementComplete) redirect("/placement");

  const lesson = getLesson(lessonId);
  if (!lesson) redirect("/home");

  if (
    isLessonLocked(lesson, path.openLessonId, path.completedLessonIds, path.moduleEntry)
  ) {
    redirect(`/lessons/${lessonId}/locked`);
  }

  return { userId: session.user.id, path };
}

function go(userId: string, lessonId: string, phase: LessonPhase) {
  ensureLessonProgress(userId, lessonId);
  setLessonPhase(userId, lessonId, phase);
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/home");
}

export async function advanceToPracticeAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  go(userId, lessonId, "practice");
}

export async function advanceToListeningAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  go(userId, lessonId, "listening");
}

/**
 * Dilim D mock: skip real MediaRecorder.
 * TODO(Dilim E): start getUserMedia → MediaRecorder → upload → Attempt.
 */
export async function finishMockListeningAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const progress = ensureLessonProgress(userId, lessonId);
  setLessonPhase(userId, lessonId, "feedback", {
    attemptCount: progress.attemptCount + 1,
  });
  revalidatePath(`/lessons/${lessonId}`);
}

export async function mockGatePassAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  setLessonPhase(userId, lessonId, "gate_pass", {
    status: "passed",
    lastGateResult: "pass",
  });
  unlockNextLesson(userId, lessonId);
  setLessonPhase(userId, lessonId, "unlock", {
    status: "passed",
    lastGateResult: "pass",
  });
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/home");
}

export async function mockGateFailAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  setLessonPhase(userId, lessonId, "gate_fail", {
    status: "failed_gate",
    lastGateResult: "fail",
  });
  revalidatePath(`/lessons/${lessonId}`);
}

export async function softRetryAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  resetLessonToPractice(userId, lessonId);
  revalidatePath(`/lessons/${lessonId}`);
}
