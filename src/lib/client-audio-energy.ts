/**
 * Browser-side energy check (Web Audio API) — detect silence before upload.
 */

export type ClientEnergy = {
  rms: number;
  peak: number;
  hasSignal: boolean;
};

export async function measureBlobEnergy(blob: Blob): Promise<ClientEnergy> {
  if (blob.size < 200) {
    return { rms: 0, peak: 0, hasSignal: false };
  }

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const buf = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf.slice(0));
    await ctx.close();

    const ch = audio.getChannelData(0);
    let sumSq = 0;
    let peak = 0;
    const step = Math.max(1, Math.floor(ch.length / 8000));
    let n = 0;
    for (let i = 0; i < ch.length; i += step) {
      const v = ch[i]!;
      sumSq += v * v;
      peak = Math.max(peak, Math.abs(v));
      n += 1;
    }
    const rms = n > 0 ? Math.sqrt(sumSq / n) : 0;
    const hasSignal = rms > 0.008 || peak > 0.04;
    return { rms, peak, hasSignal };
  } catch {
    // decode failed (rare codec) — don't block upload; server will decide
    return { rms: 0.05, peak: 0.1, hasSignal: blob.size > 1500 };
  }
}
