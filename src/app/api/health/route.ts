import { NextResponse } from "next/server";
import { isStripeMockMode } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "soundteacher",
    phase: "dilim-g",
    auth: "authjs-credentials-mock",
    stripeMode: isStripeMockMode() ? "mock" : "stripe-test",
    placement: "in-memory-path",
    lessonShell: "m1-m4-spine",
    listening: "method1-method2-quota",
    modules: "1-4",
    timestamp: new Date().toISOString(),
  });
}
