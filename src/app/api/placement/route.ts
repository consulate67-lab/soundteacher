import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isBand, type Band } from "@/lib/bands";
import { needsVerification, scorePlacement, type AnswerMap } from "@/lib/placement";
import {
  createPathFromPlacement,
  getPath,
  savePlacementDraft,
  toPlacementResult,
} from "@/lib/path-store";
import { getSubscription } from "@/lib/subscription-store";
import { isPastDue } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type Body = {
  action?: "save_band" | "score" | "complete" | "verify_pass" | "verify_skip";
  band?: string;
  answers?: AnswerMap;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }
  const path = getPath(session.user.id);
  return NextResponse.json({
    path: path ? toPlacementResult(path) : null,
    openLessonId: path?.openLessonId ?? null,
    placementComplete: path?.placementComplete ?? false,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  // Placement is free — no paid entitlement required (deneme önce).
  const sub = getSubscription(session.user.id);
  if (sub && isPastDue(sub.status)) {
    return NextResponse.json({ error: "Ödeme gecikmiş" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const userId = session.user.id;
  const action = body.action ?? "score";

  if (action === "save_band") {
    if (!body.band || !isBand(body.band)) {
      return NextResponse.json({ error: "Geçersiz bant" }, { status: 400 });
    }
    const draft = savePlacementDraft(userId, {
      band: body.band,
      answers: {},
      provisional: undefined,
      verificationPassed: undefined,
    });
    return NextResponse.json({ ok: true, draft });
  }

  if (action === "score") {
    const band = body.band as Band | undefined;
    if (!band || !isBand(band)) {
      return NextResponse.json({ error: "Geçersiz bant" }, { status: 400 });
    }
    const answers = body.answers ?? {};
    const result = scorePlacement(band, answers);
    const draft = savePlacementDraft(userId, {
      band,
      answers,
      provisional: result,
    });
    return NextResponse.json({
      ok: true,
      result,
      needsVerification: needsVerification(result.level),
      draft,
    });
  }

  if (action === "verify_pass" || action === "verify_skip") {
    const draft = savePlacementDraft(userId, {
      verificationPassed: action === "verify_pass",
    });
    const result = draft.provisional;
    if (!result) {
      return NextResponse.json(
        { error: "Önce beceri sorularını tamamla" },
        { status: 400 },
      );
    }
    // Skip without pass drops one level for A2/B1 candidates (product rule).
    let final = result;
    if (action === "verify_skip" && (result.level === "A2" || result.level === "B1")) {
      const levelOrder = ["A0", "A1", "A2", "B1"] as const;
      const idx = Math.max(0, levelOrder.indexOf(result.level) - 1);
      const level = levelOrder[idx];
      const module_entry =
        level === "A0" ? 1 : level === "A1" ? 2 : level === "A2" ? 4 : 6;
      final = { ...result, level, module_entry };
    }
    const path = createPathFromPlacement(userId, final);
    return NextResponse.json({
      ok: true,
      result: toPlacementResult(path),
      path,
    });
  }

  if (action === "complete") {
    const band = body.band as Band | undefined;
    if (!band || !isBand(band)) {
      return NextResponse.json({ error: "Geçersiz bant" }, { status: 400 });
    }
    const answers = body.answers ?? {};
    const result = scorePlacement(band, answers);
    if (needsVerification(result.level)) {
      savePlacementDraft(userId, { band, answers, provisional: result });
      return NextResponse.json({
        ok: true,
        result,
        needsVerification: true,
      });
    }
    const path = createPathFromPlacement(userId, result);
    return NextResponse.json({
      ok: true,
      result: toPlacementResult(path),
      path,
      needsVerification: false,
    });
  }

  return NextResponse.json({ error: "Bilinmeyen action" }, { status: 400 });
}
