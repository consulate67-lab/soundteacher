"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { AttemptRecord } from "@/lib/attempt";
import { getAttempt, saveAttempt, saveGateResult } from "@/lib/attempt-store";
import { primaryError } from "@/lib/attempt";
import { evaluateGateFromAttempt } from "@/lib/feedback-copy";
import { getLesson, isLessonLocked, previousLessonId } from "@/lib/curriculum";
import { gateMetricsForModule } from "@/lib/gate-metrics";
import { isListeningRequired, loadLessonContent } from "@/lib/lesson-content";
import {
  ensureLessonProgress,
  getLessonProgress,
  resetLessonToListening,
  resetLessonToPractice,
  setLessonPhase,
  type LessonPhase,
} from "@/lib/lesson-progress-store";
import { log } from "@/lib/logger";
import { getPath, unlockNextLesson } from "@/lib/path-store";
import { getSubscription } from "@/lib/subscription-store";
import { isPastDue } from "@/lib/subscription";
import { canAccessLesson, hasPaidEntitlement } from "@/lib/trial-access";
import { isTrialProgramLessonLocked } from "@/lib/trial-program";

async function requireLessonAccess(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = getSubscription(session.user.id);
  if (sub && isPastDue(sub.status)) redirect("/billing/past-due");
  const path = await getPath(session.user.id);
  if (!path?.placementComplete) redirect("/placement");
  if (!canAccessLesson(sub, lessonId, path)) {
    redirect(`/lessons/${lessonId}/locked`);
  }

  const lesson = getLesson(lessonId);
  if (!lesson) redirect("/home");

  const locked = hasPaidEntitlement(sub)
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

  return { userId: session.user.id, path };
}

async function go(userId: string, lessonId: string, phase: LessonPhase) {
  await ensureLessonProgress(userId, lessonId);
  await setLessonPhase(userId, lessonId, phase);
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/home");
}

export async function advanceToPracticeAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  await go(userId, lessonId, "practice");
}

export async function advanceToListeningAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const content = loadLessonContent(lessonId);
  if (content && !isListeningRequired(content)) {
    await go(userId, lessonId, "practice");
    return;
  }
  await go(userId, lessonId, "listening");
}

/** Practice → Kapı when listening is not required (self-confirm). */
export async function completeSelfCheckAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const content = loadLessonContent(lessonId);
  if (!content || isListeningRequired(content)) {
    await go(userId, lessonId, "listening");
    return;
  }
  await unlockNextLesson(userId, lessonId);
  await setLessonPhase(userId, lessonId, "unlock", {
    status: "passed",
    lastGateResult: "pass",
  });
  log.info("gate.self_check_pass", { userId, lessonId });
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/home");
}

/**
 * Phase back: listening/feedback → practice → theory.
 * On theory: previous lesson or trial-program / home.
 */
export async function goBackPhaseAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const progress =
    (await getLessonProgress(userId, lessonId)) ??
    (await ensureLessonProgress(userId, lessonId));
  const phase = progress.phase;

  if (phase === "listening" || phase === "feedback" || phase === "gate_fail") {
    await go(userId, lessonId, "practice");
    return;
  }
  if (phase === "practice") {
    await go(userId, lessonId, "theory");
    return;
  }

  const prev = previousLessonId(lessonId);
  if (prev) {
    redirect(`/lessons/${prev}`);
  }
  redirect("/trial-program");
}

function assertOwnAttempt(
  attempt: AttemptRecord,
  userId: string,
  lessonId: string,
): string | null {
  if (attempt.userId !== userId || attempt.lessonId !== lessonId) {
    return "Geçersiz Attempt";
  }
  if (!attempt.id || typeof attempt.id !== "string") {
    return "Attempt kimliği yok";
  }
  return null;
}

/**
 * After valid Attempt from /api/listening/analyze → S35 feedback.
 * Accepts full Attempt payload so cold starts never lose the analyze result.
 */
export async function completeListeningAction(
  lessonId: string,
  attemptInput: AttemptRecord | string,
) {
  const { userId } = await requireLessonAccess(lessonId);

  let attempt: AttemptRecord | null = null;
  if (typeof attemptInput === "string") {
    attempt = await getAttempt(userId, attemptInput, lessonId);
  } else {
    const bad = assertOwnAttempt(attemptInput, userId, lessonId);
    if (bad) return { error: bad };
    attempt = attemptInput;
    await saveAttempt(attempt);
  }

  if (!attempt || attempt.userId !== userId || attempt.lessonId !== lessonId) {
    return { error: "Attempt bulunamadı" };
  }
  if (!attempt.valid) {
    return { error: "Geçersiz Attempt ile kapıya gidilemez" };
  }

  const progress = await ensureLessonProgress(userId, lessonId);
  await setLessonPhase(userId, lessonId, "feedback", {
    attemptCount: progress.attemptCount + 1,
    lastAttemptId: attempt.id,
  });
  // Re-save so phase + attempt land in the same cookie write
  await saveAttempt(attempt);
  revalidatePath(`/lessons/${lessonId}`);
  return { ok: true };
}

/** Count invalid attempts too (for stub rotation) without leaving listening. */
export async function registerInvalidAttemptAction(
  lessonId: string,
  attemptInput: AttemptRecord | string,
) {
  const { userId } = await requireLessonAccess(lessonId);

  let attempt: AttemptRecord | null = null;
  if (typeof attemptInput === "string") {
    attempt = await getAttempt(userId, attemptInput, lessonId);
  } else {
    const bad = assertOwnAttempt(attemptInput, userId, lessonId);
    if (bad) return { error: bad };
    attempt = attemptInput;
    await saveAttempt(attempt);
  }

  if (!attempt || attempt.userId !== userId) {
    return { error: "Attempt bulunamadı" };
  }
  const progress = await ensureLessonProgress(userId, lessonId);
  await setLessonPhase(userId, lessonId, "listening", {
    attemptCount: progress.attemptCount + 1,
    lastAttemptId: attempt.id,
  });
  await saveAttempt(attempt);
  revalidatePath(`/lessons/${lessonId}`);
  return { ok: true };
}

/** S36/S37 from last valid Attempt + GateResult persist. */
export async function evaluateGateAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  const progress = await ensureLessonProgress(userId, lessonId);
  if (!progress.lastAttemptId) {
    return { error: "Önce dinleme denemesi gerekli" };
  }
  const attempt = await getAttempt(userId, progress.lastAttemptId, lessonId);
  if (!attempt || !attempt.valid) {
    return { error: "Geçerli Attempt yok" };
  }

  const outcome = evaluateGateFromAttempt(attempt);
  if (outcome === "invalid") {
    log.warn("gate.invalid_attempt", {
      userId,
      lessonId,
      attemptId: attempt.id,
    });
    return { error: "Geçersiz Attempt" };
  }

  const lesson = getLesson(lessonId);
  const metrics = gateMetricsForModule(lesson?.moduleId ?? 1);
  const highPitch = attempt.errorSpans.filter(
    (s) => s.type === "pitch" && s.severity === "high",
  ).length;
  const highTiming = attempt.errorSpans.filter(
    (s) => s.type === "timing" && s.severity === "high",
  ).length;

  const gateId = `gate_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await saveGateResult({
    id: gateId,
    attemptId: attempt.id,
    lessonId,
    userId,
    result: outcome,
    tolerances: {
      pitchErrorsHigh: highPitch,
      timingErrorsHigh: highTiming,
      pitchToleranceCents: metrics.pitchToleranceCents,
      timingToleranceMs: metrics.timingToleranceMs,
      maxHighPitchErrors: metrics.maxHighPitchErrors,
      maxHighTimingErrors: metrics.maxHighTimingErrors,
      scoreRef: lesson?.scoreRef ?? metrics.defaultScoreRef,
    },
    createdAt: new Date().toISOString(),
  });

  if (outcome === "pass") {
    await unlockNextLesson(userId, lessonId);
    await setLessonPhase(userId, lessonId, "unlock", {
      status: "passed",
      lastGateResult: "pass",
    });
  } else {
    await setLessonPhase(userId, lessonId, "gate_fail", {
      status: "failed_gate",
      lastGateResult: "fail",
    });
  }

  log.info("gate.evaluated", {
    gateId,
    attemptId: attempt.id,
    userId,
    lessonId,
    result: outcome,
    highPitch,
    highTiming,
    moduleId: lesson?.moduleId ?? null,
  });

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/home");
  return { ok: true, result: outcome, primary: primaryError(attempt.errorSpans) };
}

export async function softRetryAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  await resetLessonToPractice(userId, lessonId);
  revalidatePath(`/lessons/${lessonId}`);
}

export async function retryListeningAction(lessonId: string) {
  const { userId } = await requireLessonAccess(lessonId);
  await resetLessonToListening(userId, lessonId);
  revalidatePath(`/lessons/${lessonId}`);
}
