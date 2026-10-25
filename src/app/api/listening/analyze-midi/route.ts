import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMidiAnalyzer } from "@/lib/analysis/midi-analyzer";
import type { AttemptRecord } from "@/lib/attempt";
import {
  persistLessonSessionOnResponse,
  saveAttemptInMemory,
} from "@/lib/attempt-store";
import { ensureLessonProgress } from "@/lib/lesson-progress-store";
import { log } from "@/lib/logger";
import type { MidiNoteEvent } from "@/lib/midi/types";
import { getPath } from "@/lib/path-store";
import {
  consumeFreeQuota,
  FREE_QUOTA_COOKIE,
} from "@/lib/free-quota-store";
import { shouldConsumeQuota } from "@/lib/quota";
import { resolveQuotaForUser } from "@/lib/resolve-quota";
import { setSignedCookieOnResponse } from "@/lib/signed-cookie";
import { consumeQuota, getSubscription } from "@/lib/subscription-store";
import { isPastDue } from "@/lib/subscription";
import {
  canAccessLesson,
  hasPaidEntitlement,
} from "@/lib/trial-access";

export const dynamic = "force-dynamic";

type Body = {
  lessonId?: string;
  durationMs?: number;
  events?: MidiNoteEvent[];
  deviceName?: string;
};

/**
 * Method 3 — MIDI / USB keyboard analyze (JSON).
 * No mic blob; structured note-on/off is the signal.
 * Shares Method 1 kota.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  const userId = session.user.id;
  const sub = getSubscription(userId);
  if (sub && isPastDue(sub.status)) {
    return NextResponse.json({ error: "Ödeme gecikmiş" }, { status: 403 });
  }

  const path = await getPath(userId);
  if (!path?.placementComplete) {
    return NextResponse.json({ error: "Yerleştirme gerekli" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON gerekli" }, { status: 400 });
  }

  const lessonId = String(body.lessonId ?? "");
  const durationMs = Number(body.durationMs ?? 0);
  const events = Array.isArray(body.events) ? body.events : [];
  const deviceName = body.deviceName ? String(body.deviceName).slice(0, 80) : undefined;

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId gerekli" }, { status: 400 });
  }

  if (!canAccessLesson(sub, lessonId, path)) {
    return NextResponse.json(
      { error: "Bu ders abonelik ister", code: "SUBSCRIBE_REQUIRED" },
      { status: 403 },
    );
  }

  const quota = await resolveQuotaForUser(userId, sub);
  if (!quota.method1Available) {
    return NextResponse.json(
      { error: "Kota dolu", code: "QUOTA_EXHAUSTED", method: "3" },
      { status: 429 },
    );
  }

  // Sanitize events (cap size for cookie / CPU)
  const cleanEvents: MidiNoteEvent[] = events
    .filter(
      (e) =>
        e &&
        (e.type === "on" || e.type === "off") &&
        Number.isFinite(e.t) &&
        Number.isFinite(e.note),
    )
    .slice(0, 400)
    .map((e) => ({
      t: Math.max(0, Math.round(e.t)),
      type: e.type,
      note: Math.max(0, Math.min(127, Math.round(e.note))),
      velocity:
        e.velocity !== undefined
          ? Math.max(0, Math.min(127, Math.round(e.velocity)))
          : undefined,
    }));

  const progress = await ensureLessonProgress(userId, lessonId);
  const attemptIndex = progress.attemptCount;

  try {
    const analyzer = getMidiAnalyzer();
    const result = await analyzer.analyze({
      lessonId,
      userId,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      events: cleanEvents,
      attemptIndex,
      deviceName,
    });

    const now = new Date();
    const consume = shouldConsumeQuota({
      valid: result.valid,
      abandoned: false,
    });

    let freeQuota: Awaited<ReturnType<typeof consumeFreeQuota>> | null = null;
    if (consume) {
      if (hasPaidEntitlement(sub)) {
        consumeQuota(userId, "1"); // Method 3 shares Y1 bucket
      } else {
        freeQuota = await consumeFreeQuota(userId, "1");
      }
    }

    const attemptId = `att_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const attempt: AttemptRecord = {
      id: attemptId,
      userId,
      lessonId,
      method: "3",
      startedAt: new Date(
        now.getTime() - Math.max(0, Number.isFinite(durationMs) ? durationMs : 0),
      ).toISOString(),
      endedAt: now.toISOString(),
      valid: result.valid,
      invalidReason: result.invalidReason,
      scoreSummary: result.scoreSummary,
      errorSpans: result.errorSpans,
      audioObjectKey: null,
      byteLength: cleanEvents.length,
      durationMs: Number.isFinite(durationMs) ? durationMs : 0,
      quotaConsumed: consume,
    };

    await saveAttemptInMemory(attempt);
    log.info("attempt.saved", {
      attemptId,
      userId,
      lessonId,
      method: "3",
      valid: result.valid,
      invalidReason: result.invalidReason,
      errorSpanCount: result.errorSpans.length,
      noteEvents: cleanEvents.length,
      deviceName: deviceName ?? null,
      analyzer: analyzer.name,
      quotaConsumed: consume,
    });

    const res = NextResponse.json({
      ok: true,
      analyzer: analyzer.name,
      retention: "saklama-a-midi",
      attempt,
      quotaConsumed: consume,
    });
    await persistLessonSessionOnResponse(res, userId);
    if (freeQuota) {
      await setSignedCookieOnResponse(
        res,
        FREE_QUOTA_COOKIE,
        freeQuota as unknown as Record<string, unknown>,
      );
    }
    return res;
  } catch (err) {
    log.error("api.listening.analyze_midi.failed", {
      userId,
      lessonId,
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "MIDI analiz başarısız" }, { status: 500 });
  }
}
