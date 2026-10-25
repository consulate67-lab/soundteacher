import { StubAudioAnalyzer } from "./stub-analyzer";
import type { AudioAnalyzer } from "./types";

/** Factory — swap stub for real analyzer without UI changes. */
export function getAudioAnalyzer(): AudioAnalyzer {
  // Future: if (process.env.ANALYSIS_WORKER_URL) return new RemoteAnalyzer(...)
  return new StubAudioAnalyzer();
}

export type { AudioAnalyzer, AnalyzeAudioInput, AnalyzeAudioResult } from "./types";
