import { NextResponse } from "next/server";
import { AUDIO_RETENTION_POLICY } from "@/lib/audio-retention";
import { isStripeMockMode } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "soundteacher",
    phase: "dilim-h",
    auth: "authjs-credentials-mock",
    stripeMode: isStripeMockMode() ? "mock" : "stripe-test",
    placement: "in-memory-path",
    lessonShell: "m1-m4-spine",
    listening: "method1-method2-quota",
    modules: "1-4",
    freeTrial: "trial-program-m1-m2",
    pwa: "manifest+sw-light",
    audioRetention: AUDIO_RETENTION_POLICY,
    tts: "web-speech-optional",
    timestamp: new Date().toISOString(),
  });
}
