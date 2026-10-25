/**
 * Deterministic demo analysis helpers from raw audio bytes.
 * Not ML — RMS / peak proxies so silence vs sound always yields a visible outcome.
 */

export type EnergyStats = {
  rms: number;
  peak: number;
  /** Rough “has audible content” flag. */
  hasSignal: boolean;
  /** 0–1 normalized energy for variety. */
  energyNorm: number;
};

/** Decode PCM-ish energy from compressed container bytes (heuristic, not true decode). */
export function estimateEnergyFromBytes(
  audioBuffer: ArrayBuffer | undefined,
  durationMs: number,
): EnergyStats {
  if (!audioBuffer || audioBuffer.byteLength < 64) {
    return { rms: 0, peak: 0, hasSignal: false, energyNorm: 0 };
  }

  const view = new Uint8Array(audioBuffer);
  // Skip likely container header; sample mid-body for Opus/WebM payload variance
  const start = Math.min(256, view.length);
  const end = view.length;
  let sumSq = 0;
  let peak = 0;
  let n = 0;
  for (let i = start; i < end; i += 3) {
    const centered = (view[i]! - 128) / 128;
    sumSq += centered * centered;
    peak = Math.max(peak, Math.abs(centered));
    n += 1;
  }
  const rms = n > 0 ? Math.sqrt(sumSq / n) : 0;
  // Tiny webm silence packs are low-variance; real mic noise has more
  const hasSignal =
    durationMs >= 900 &&
    audioBuffer.byteLength >= 800 &&
    (rms > 0.04 || peak > 0.12 || audioBuffer.byteLength > 4_000);
  const energyNorm = Math.min(1, rms * 2.2 + peak * 0.35);

  return { rms, peak, hasSignal, energyNorm };
}
