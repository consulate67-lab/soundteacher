import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudioAnalyzer } from "@/lib/analysis";
import type { AttemptRecord } from "@/lib/attempt";
import { discardAudioAfterAnalysis } from "@/lib/audio-retention";
import { saveAttempt } from "@/lib/attempt-store";
import { ensureLessonProgress } from "@/lib/lesson-progress-store";
import { log } from "@/lib/logger";
import { getPath } from "@/lib/path-store";
import {
  consumeFreeQuota,
  FREE_QUOTA_COOKIE,
} from "@/lib/free-quota-store";
import { isAbandonedTake, shouldConsumeQuota } from "@/lib/quota";
import { resolveQuotaForUser } from "@/lib/resolve-quota";
import { setSignedCookieOnResponse } from "@/lib/signed-cookie";
import { consumeQuota, getSubscription } from "@/lib/subscription-store";
import { isPastDue } from "@/lib/subscription";
import {
  canAccessLesson,
  hasPaidEntitlement,
} from "@/lib/trial-access";

export const dynamic = "force-dynamic";

/**
 * Upload stub + analysis (Dilim E/F/H).
 * Free deneme: M1.L1–L2 without paid entitlement.
 * Quota: only valid non-abandoned takes consume units (see src/lib/quota.ts).
 * Saklama A: raw audio discarded after analysis — Attempt keeps summary only.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    log.warn("api.listening.analyze.unauthorized");
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const userId = session.user.id;
  const sub = getSubscription(userId);
  if (sub && isPastDue(sub.status)) {
    return NextResponse.json({ error: "Ödeme gecikmiş" }, { status: 403 });
  }

  const path = await getPath(userId);
  if (!path?.placementComplete) {
    log.warn("api.listening.analyze.forbidden", { userId, reason: "placement" });
    return NextResponse.json({ error: "Yerleştirme gerekli" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    log.error("api.listening.analyze.bad_form", { userId });
    return NextResponse.json({ error: "FormData gerekli" }, { status: 400 });
  }

  const lessonId = String(form.get("lessonId") ?? "");
  const method = (String(form.get("method") ?? "1") as "1" | "2") || "1";
  const durationMs = Number(form.get("durationMs") ?? 0);
  const abandonedFlag = String(form.get("abandoned") ?? "") === "true";
  const file = form.get("audio");

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId gerekli" }, { status: 400 });
  }

  if (!canAccessLesson(sub, lessonId, path)) {
    log.warn("api.listening.analyze.forbidden", {
      userId,
      lessonId,
      reason: "trial_scope",
    });
    return NextResponse.json(
      { error: "Bu ders abonelik ister", code: "SUBSCRIBE_REQUIRED" },
      { status: 403 },
    );
  }

  const quota = await resolveQuotaForUser(userId, sub);
  const methodAvailable =
    method === "1" ? quota.method1Available : quota.method2Available;
  if (!methodAvailable) {
    log.warn("api.listening.analyze.quota", { userId, lessonId, method });
    return NextResponse.json(
      {
        error: "Kota dolu",
        code: "QUOTA_EXHAUSTED",
        method,
      },
      { status: 429 },
    );
  }

  const abandoned = isAbandonedTake({
    method,
    durationMs: Number.isFinite(durationMs) ? durationMs : 0,
    abandonedFlag,
  });

  // S45 — abandoned: persist Attempt, no analysis deep-dive required, no quota
  if (abandoned) {
    const now = new Date();
    const attempt: AttemptRecord = {
      id: `att_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
      userId,
      lessonId,
      method,
      startedAt: new Date(now.getTime() - Math.max(0, durationMs || 0)).toISOString(),
      endedAt: now.toISOString(),
      valid: false,
      invalidReason: "abandoned",
      scoreSummary: null,
      errorSpans: [],
      audioObjectKey: null,
      byteLength: 0,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      quotaConsumed: false,
    };
    saveAttempt(attempt);
    log.info("attempt.abandoned", {
      attemptId: attempt.id,
      userId,
      lessonId,
      method,
      durationMs: attempt.durationMs,
    });
    return NextResponse.json({
      ok: true,
      abandoned: true,
      analyzer: "none",
      retention: "saklama-a",
      attempt,
    });
  }

  let byteLength = 0;
  let audioBuffer: ArrayBuffer | undefined;
  if (file && typeof file !== "string" && "arrayBuffer" in file) {
    audioBuffer = await file.arrayBuffer();
    byteLength = audioBuffer.byteLength;
  }

  const progress = ensureLessonProgress(userId, lessonId);
  const attemptIndex = progress.attemptCount;

  try {
    const analyzer = getAudioAnalyzer();
    const result = await analyzer.analyze({
      lessonId,
      userId,
      method,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      byteLength,
      audioBuffer,
      attemptIndex,
    });

    // Saklama A — drop raw bytes from process memory; clear object key on Attempt
    audioBuffer = undefined;
    const discard = discardAudioAfterAnalysis({
      audioObjectKey: result.audioObjectKey,
      lessonId,
      userId,
      byteLength,
    });

    const now = new Date();
    const consume = shouldConsumeQuota({
      valid: result.valid,
      abandoned: false,
    });

    let freeQuota: Awaited<ReturnType<typeof consumeFreeQuota>> | null = null;
    if (consume) {
      if (hasPaidEntitlement(sub)) {
        consumeQuota(userId, method);
      } else {
        freeQuota = await consumeFreeQuota(userId, method);
      }
    }

    const attemptId = `att_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const attempt: AttemptRecord = {
      id: attemptId,
      userId,
      lessonId,
      method,
      startedAt: new Date(now.getTime() - Math.max(0, durationMs)).toISOString(),
      endedAt: now.toISOString(),
      valid: result.valid,
      invalidReason: result.invalidReason,
      scoreSummary: result.scoreSummary,
      errorSpans: result.errorSpans,
      audioObjectKey: discard.audioObjectKey,
      byteLength,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      quotaConsumed: consume,
    };

    saveAttempt(attempt);
    log.info("attempt.saved", {
      attemptId,
      userId,
      lessonId,
      method,
      valid: result.valid,
      invalidReason: result.invalidReason,
      errorSpanCount: result.errorSpans.length,
      quotaConsumed: consume,
      retention: discard.policy,
      formerAudioKey: discard.formerKey,
    });

    const res = NextResponse.json({
      ok: true,
      analyzer: analyzer.name,
      retention: discard.policy,
      attempt,
      quotaConsumed: consume,
    });
    if (freeQuota) {
      setSignedCookieOnResponse(res, FREE_QUOTA_COOKIE, freeQuota);
    }
    return res;
  } catch (err) {
    log.error("api.listening.analyze.failed", {
      userId,
      lessonId,
      method,
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Analiz başarısız" }, { status: 500 });
  }
}
