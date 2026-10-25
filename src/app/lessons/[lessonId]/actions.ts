"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAttempt, saveGateResult } from "@/lib/attempt-store";
import { primaryError } from "@/lib/attempt";
import { evaluateGateFromAttempt } from "@/lib/feedback-copy";
import { getLesson, isLessonLocked } from "@/lib/curriculum";
import {
  ensureLessonProgress,
  resetLessonToListening,
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

/** After valid Attempt from /api/listening/analyze → S35 feedback. */
export async function completeListeningAction(lessonId: string, attemptId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.userId !== userId || attempt.lessonId !== lessonId) {
    return { error: "Attempt bulunamadı" };
  }
  if (!attempt.valid) {
    return { error: "Geçersiz Attempt ile kapıya gidilemez" };
  }

  const progress = ensureLessonProgress(userId, lessonId);
  setLessonPhase(userId, lessonId, "feedback", {
    attemptCount: progress.attemptCount + 1,
    lastAttemptId: attemptId,
  });
  revalidatePath(`/lessons/${lessonId}`);
  return { ok: true };
}

/** Count invalid attempts too (for stub rotation) without leaving listening. */
export async function registerInvalidAttemptAction(lessonId: string, attemptId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.userId !== userId) {
    return { error: "Attempt bulunamadı" };
  }
  const progress = ensureLessonProgress(userId, lessonId);
  setLessonPhase(userId, lessonId, "listening", {
    attemptCount: progress.attemptCount + 1,
    lastAttemptId: attemptId,
  });
  revalidatePath(`/lessons/${lessonId}`);
  return { ok: true };
}

/** S36/S37 from last valid Attempt + GateResult persist. */
export async function evaluateGateAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const progress = ensureLessonProgress(userId, lessonId);
  if (!progress.lastAttemptId) {
    return { error: "Önce dinleme denemesi gerekli" };
  }
  const attempt = getAttempt(progress.lastAttemptId);
  if (!attempt || !attempt.valid) {
    return { error: "Geçerli Attempt yok" };
  }

  const outcome = evaluateGateFromAttempt(attempt);
  if (outcome === "invalid") {
    return { error: "Geçersiz Attempt" };
  }

  const highPitch = attempt.errorSpans.filter(
    (s) => s.type === "pitch" && s.severity === "high",
  ).length;
  const highTiming = attempt.errorSpans.filter(
    (s) => s.type === "timing" && s.severity === "high",
  ).length;

  saveGateResult({
    id: `gate_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    attemptId: attempt.id,
    lessonId,
    userId,
    result: outcome,
    tolerances: {
      pitchErrorsHigh: highPitch,
      timingErrorsHigh: highTiming,
    },
    createdAt: new Date().toISOString(),
  });

  if (outcome === "pass") {
    unlockNextLesson(userId, lessonId);
    setLessonPhase(userId, lessonId, "unlock", {
      status: "passed",
      lastGateResult: "pass",
    });
  } else {
    setLessonPhase(userId, lessonId, "gate_fail", {
      status: "failed_gate",
      lastGateResult: "fail",
    });
  }

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/home");
  return { ok: true, result: outcome, primary: primaryError(attempt.errorSpans) };
}

export async function softRetryAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  resetLessonToPractice(userId, lessonId);
  revalidatePath(`/lessons/${lessonId}`);
}

export async function retryListeningAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  resetLessonToListening(userId, lessonId);
  revalidatePath(`/lessons/${lessonId}`);
}
