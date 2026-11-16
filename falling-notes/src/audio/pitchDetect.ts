import { frequencyToMidi } from "../engine/noteChart";
import type { PitchSample } from "../engine/types";

/**
 * Lightweight monophonic pitch detector via autocorrelation on AnalyserNode
 * time-domain data. Good enough for MVP single-note piano matching.
 *
 * Next step (documented in README): Basic Pitch / CREPE for polyphony.
 */

export type PitchDetectorOptions = {
  /** RMS below this → treat as silence (noise gate). */
  noiseGate: number;
  /** Min frequency (Hz) — roughly A1. */
  minHz: number;
  /** Max frequency (Hz) — roughly C7. */
  maxHz: number;
  /** Clarity (normalized autocorrelation peak) must exceed this. */
  minClarity: number;
};

const DEFAULTS: PitchDetectorOptions = {
  noiseGate: 0.02,
  minHz: 55,
  maxHz: 2093,
  minClarity: 0.85,
};

export class PitchDetector {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private buf: Float32Array<ArrayBuffer> | null = null;
  private raf = 0;
  private opts: PitchDetectorOptions;
  private onSample: (s: PitchSample) => void;
  private running = false;

  constructor(
    onSample: (s: PitchSample) => void,
    opts: Partial<PitchDetectorOptions> = {},
  ) {
    this.onSample = onSample;
    this.opts = { ...DEFAULTS, ...opts };
  }

  get active(): boolean {
    return this.running;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });
    this.ctx = new AudioContext();
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.source.connect(this.analyser);
    this.buf = new Float32Array(this.analyser.fftSize);
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.source = null;
    this.analyser = null;
    this.stream = null;
    this.ctx = null;
    this.buf = null;
  }

  private tick = (): void => {
    if (!this.running || !this.analyser || !this.buf || !this.ctx) return;
    this.analyser.getFloatTimeDomainData(this.buf);
    const sample = this.analyze(this.buf, this.ctx.sampleRate);
    this.onSample(sample);
    this.raf = requestAnimationFrame(this.tick);
  };

  private analyze(buf: Float32Array<ArrayBuffer>, sampleRate: number): PitchSample {
    const timestamp = performance.now();
    let rms = 0;
    for (let i = 0; i < buf.length; i++) rms += buf[i]! * buf[i]!;
    rms = Math.sqrt(rms / buf.length);
    if (rms < this.opts.noiseGate) {
      return { frequency: null, midi: null, clarity: 0, timestamp };
    }

    const freq = autocorrelate(buf, sampleRate, this.opts.minHz, this.opts.maxHz);
    if (freq == null) {
      return { frequency: null, midi: null, clarity: 0, timestamp };
    }

    // Recompute clarity-ish: peak correlation already gated inside autocorrelate
    // via returning null; treat successful detect as high clarity.
    const midi = frequencyToMidi(freq);
    return {
      frequency: freq,
      midi,
      clarity: 1,
      timestamp,
    };
  }
}

/**
 * Autocorrelation pitch estimate.
 * Returns null if no clear peak (acts as minClarity gate).
 */
function autocorrelate(
  buf: Float32Array<ArrayBuffer>,
  sampleRate: number,
  minHz: number,
  maxHz: number,
): number | null {
  const size = buf.length;
  const maxLag = Math.floor(sampleRate / minHz);
  const minLag = Math.floor(sampleRate / maxHz);
  let bestLag = -1;
  let bestCorr = 0;

  // Normalize by removing DC
  let mean = 0;
  for (let i = 0; i < size; i++) mean += buf[i]!;
  mean /= size;

  const r0 = (() => {
    let s = 0;
    for (let i = 0; i < size; i++) {
      const v = buf[i]! - mean;
      s += v * v;
    }
    return s;
  })();
  if (r0 < 1e-8) return null;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < size - lag; i++) {
      corr += (buf[i]! - mean) * (buf[i + lag]! - mean);
    }
    corr /= r0;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  // Clarity gate (~0.85 equivalent)
  if (bestLag < 0 || bestCorr < 0.85) return null;

  // Parabolic interpolation around peak
  const y0 = corrAt(buf, mean, r0, bestLag - 1);
  const y1 = bestCorr;
  const y2 = corrAt(buf, mean, r0, bestLag + 1);
  const denom = 2 * (2 * y1 - y2 - y0);
  const shift = denom !== 0 ? (y2 - y0) / denom : 0;
  const refinedLag = bestLag + shift;
  return sampleRate / refinedLag;
}

function corrAt(
  buf: Float32Array<ArrayBuffer>,
  mean: number,
  r0: number,
  lag: number,
): number {
  if (lag < 1 || lag >= buf.length) return 0;
  let corr = 0;
  for (let i = 0; i < buf.length - lag; i++) {
    corr += (buf[i]! - mean) * (buf[i + lag]! - mean);
  }
  return corr / r0;
}

/** True if detected MIDI is within half-semitone of expected. */
export function pitchesMatch(
  detectedMidi: number | null,
  expectedMidi: number,
  centsTolerance = 50,
): boolean {
  if (detectedMidi == null) return false;
  const cents = Math.abs(detectedMidi - expectedMidi) * 100;
  return cents <= centsTolerance;
}
