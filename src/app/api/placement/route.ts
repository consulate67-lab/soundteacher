import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isBand, type Band } from "@/lib/bands";
import { needsVerification, scorePlacement, type AnswerMap } from "@/lib/placement";
import {
  createPathFromPlacement,
  DRAFT_COOKIE,
  getPath,
  PATH_COOKIE,
  restorePathFromClient,
  savePlacementDraft,
  sealPathCookie,
  toPlacementResult,
  type PathRecord,
  type PlacementDraft,
} from "@/lib/path-store";
import { pathToCompactClaims } from "@/lib/path-cookie";
import {
  clearSignedCookieOnResponse,
  sealJwt,
  setSignedCookieOnResponse,
  signedCookieOptions,
} from "@/lib/signed-cookie";
import { getSubscription } from "@/lib/subscription-store";
import { isPastDue } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type Body = {
  action?:
    | "save_band"
    | "score"
    | "complete"
    | "verify_pass"
    | "verify_skip"
    | "restore";
  band?: string;
  answers?: AnswerMap;
  path?: unknown;
};

async function jsonWithDraft(data: unknown, draft: PlacementDraft) {
  const res = NextResponse.json(data);
  await setSignedCookieOnResponse(res, DRAFT_COOKIE, {
    u: draft.userId,
    b: draft.band ?? null,
    r: draft.provisional ?? null,
    v: draft.verificationPassed ?? null,
    t: draft.updatedAt,
  });
  return res;
}

async function jsonWithPath(data: Record<string, unknown>, path: PathRecord) {
  const { token, bytes, claims } = await sealPathCookie(path);
  const res = NextResponse.json({
    ...data,
    pathCookieBytes: bytes,
    pathClaims: claims,
  });
  res.cookies.set(PATH_COOKIE, token, signedCookieOptions());
  // Clear legacy fat cookies so browsers don't keep oversized values.
  clearSignedCookieOnResponse(res, DRAFT_COOKIE);
  clearSignedCookieOnResponse(res, "st_draft_v2");
  clearSignedCookieOnResponse(res, "st_draft_v1");
  clearSignedCookieOnResponse(res, "st_path_v2");
  clearSignedCookieOnResponse(res, "st_path_v1");
  res.headers.set("X-St-Path-Cookie-Bytes", String(bytes));
  return res;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }
  const path = await getPath(session.user.id);
  let pathCookieBytes: number | null = null;
  if (path) {
    pathCookieBytes = (await sealJwt(pathToCompactClaims(path) as unknown as Record<string, unknown>))
      .length;
  }
  return NextResponse.json({
    path: path ? toPlacementResult(path) : null,
    openLessonId: path?.openLessonId ?? null,
    placementComplete: path?.placementComplete ?? false,
    pathCookieBytes,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

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

  if (action === "restore") {
    const path = await restorePathFromClient(userId, body.path);
    if (!path) {
      return NextResponse.json({ error: "Geçersiz path" }, { status: 400 });
    }
    return jsonWithPath(
      {
        ok: true,
        restored: true,
        result: toPlacementResult(path),
        path,
      },
      path,
    );
  }

  if (action === "save_band") {
    if (!body.band || !isBand(body.band)) {
      return NextResponse.json({ error: "Geçersiz bant" }, { status: 400 });
    }
    const draft = await savePlacementDraft(userId, {
      band: body.band,
      answers: {},
      provisional: undefined,
      verificationPassed: undefined,
    });
    return jsonWithDraft({ ok: true, draft }, draft);
  }

  if (action === "score") {
    const band = body.band as Band | undefined;
    if (!band || !isBand(band)) {
      return NextResponse.json({ error: "Geçersiz bant" }, { status: 400 });
    }
    const answers = body.answers ?? {};
    const result = scorePlacement(band, answers);
    const draft = await savePlacementDraft(userId, {
      band,
      answers,
      provisional: result,
    });
    return jsonWithDraft(
      {
        ok: true,
        result,
        needsVerification: needsVerification(result.level),
        draft,
      },
      draft,
    );
  }

  if (action === "verify_pass" || action === "verify_skip") {
    const draft = await savePlacementDraft(userId, {
      verificationPassed: action === "verify_pass",
    });
    const result = draft.provisional;
    if (!result) {
      return NextResponse.json(
        { error: "Önce beceri sorularını tamamla" },
        { status: 400 },
      );
    }
    let final = result;
    if (action === "verify_skip" && (result.level === "A2" || result.level === "B1")) {
      const levelOrder = ["A0", "A1", "A2", "B1"] as const;
      const idx = Math.max(0, levelOrder.indexOf(result.level) - 1);
      const level = levelOrder[idx];
      const module_entry =
        level === "A0" ? 1 : level === "A1" ? 2 : level === "A2" ? 4 : 6;
      final = { ...result, level, module_entry };
    }
    const path = await createPathFromPlacement(userId, final);
    return jsonWithPath(
      {
        ok: true,
        result: toPlacementResult(path),
        path,
      },
      path,
    );
  }

  if (action === "complete") {
    const band = body.band as Band | undefined;
    if (!band || !isBand(band)) {
      return NextResponse.json({ error: "Geçersiz bant" }, { status: 400 });
    }
    const answers = body.answers ?? {};
    const result = scorePlacement(band, answers);
    if (needsVerification(result.level)) {
      const draft = await savePlacementDraft(userId, {
        band,
        answers,
        provisional: result,
      });
      return jsonWithDraft(
        {
          ok: true,
          result,
          needsVerification: true,
        },
        draft,
      );
    }
    const path = await createPathFromPlacement(userId, result);
    return jsonWithPath(
      {
        ok: true,
        result: toPlacementResult(path),
        path,
        needsVerification: false,
      },
      path,
    );
  }

  return NextResponse.json({ error: "Bilinmeyen action" }, { status: 400 });
}
