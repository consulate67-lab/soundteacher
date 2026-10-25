import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudioAnalyzer } from "@/lib/analysis";
import type { AttemptRecord } from "@/lib/attempt";
import { saveAttempt } from "@/lib/attempt-store";
import { ensureLessonProgress } from "@/lib/lesson-progress-store";
import { getPath } from "@/lib/path-store";
import { getSubscription } from "@/lib/subscription-store";
import { hasLessonAccess } from "@/lib/subscription";

export const dynamic = "force-dynamic";

/**
 * Upload stub + analysis (Dilim E).
 * Accepts multipart audio; runs pluggable analyzer; persists Attempt in memory.
 * Does not require S3 — stores placeholder object key only (Saklama A).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const userId = session.user.id;
  const sub = getSubscription(userId);
  if (!sub || !hasLessonAccess(sub.status)) {
    return NextResponse.json({ error: "Abonelik gerekli" }, { status: 403 });
  }

  const path = getPath(userId);
  if (!path?.placementComplete) {
    return NextResponse.json({ error: "Yerleştirme gerekli" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData gerekli" }, { status: 400 });
  }

  const lessonId = String(form.get("lessonId") ?? "");
  const method = (String(form.get("method") ?? "1") as "1" | "2") || "1";
  const durationMs = Number(form.get("durationMs") ?? 0);
  const file = form.get("audio");

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId gerekli" }, { status: 400 });
  }

  let byteLength = 0;
  let audioBuffer: ArrayBuffer | undefined;
  if (file && typeof file !== "string" && "arrayBuffer" in file) {
    audioBuffer = await file.arrayBuffer();
    byteLength = audioBuffer.byteLength;
  }

  const progress = ensureLessonProgress(userId, lessonId);
  const attemptIndex = progress.attemptCount;

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

  const now = new Date();
  const startedAt = new Date(now.getTime() - Math.max(0, durationMs)).toISOString();

  const attempt: AttemptRecord = {
    id: `att_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    userId,
    lessonId,
    method,
    startedAt,
    endedAt: now.toISOString(),
    valid: result.valid,
    invalidReason: result.invalidReason,
    scoreSummary: result.scoreSummary,
    errorSpans: result.errorSpans,
    audioObjectKey: result.audioObjectKey,
    byteLength,
    durationMs: Number.isFinite(durationMs) ? durationMs : 0,
    quotaConsumed: result.valid,
  };

  saveAttempt(attempt);

  return NextResponse.json({
    ok: true,
    analyzer: analyzer.name,
    attempt,
  });
}
