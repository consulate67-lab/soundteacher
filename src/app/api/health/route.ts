import { NextResponse } from "next/server";
import { isStripeMockMode } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "soundteacher",
    phase: "dilim-c",
    auth: "authjs-credentials-mock",
    stripeMode: isStripeMockMode() ? "mock" : "stripe-test",
    placement: "in-memory-path",
    timestamp: new Date().toISOString(),
  });
}
