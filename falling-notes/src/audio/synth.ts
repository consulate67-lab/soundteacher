import { midiToFrequency } from "../engine/noteChart";

/** Sparse Salamander piano samples shipped under /samples/piano. */
const SAMPLE_FILES: { name: string; midi: number }[] = [
  { name: "A1", midi: 33 },
  { name: "C2", midi: 36 },
  { name: "Ds2", midi: 39 },
  { name: "Fs2", midi: 42 },
  { name: "A2", midi: 45 },
  { name: "C3", midi: 48 },
  { name: "Ds3", midi: 51 },
  { name: "Fs3", midi: 54 },
  { name: "A3", midi: 57 },
  { name: "C4", midi: 60 },
  { name: "Ds4", midi: 63 },
  { name: "Fs4", midi: 66 },
  { name: "A4", midi: 69 },
  { name: "C5", midi: 72 },
  { name: "Ds5", midi: 75 },
  { name: "Fs5", midi: 78 },
  { name: "A5", midi: 81 },
  { name: "C6", midi: 84 },
];

/**
 * Real piano sample playback (Web Audio buffers) for reference notes and hits.
 * Falls back to a soft triangle oscillator if samples fail to load.
 */
export class ReferenceSynth {
  private ctx: AudioContext | null = null;
  private buffers = new Map<number, AudioBuffer>();
  private loadPromise: Promise<void> | null = null;
  private ready = false;
  private master: GainNode | null = null;

  private ensure(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async resume(): Promise<void> {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    await this.load();
  }

  async load(): Promise<void> {
    this.ensure();
    if (this.ready) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const ctx = this.ensure();
      await Promise.all(
        SAMPLE_FILES.map(async ({ name, midi }) => {
          try {
            const res = await fetch(`/samples/piano/${name}.mp3`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.arrayBuffer();
            const buf = await ctx.decodeAudioData(raw.slice(0));
            this.buffers.set(midi, buf);
          } catch {
            // Leave gap; nearest-sample lookup + oscillator fallback handle it.
          }
        }),
      );
      this.ready = this.buffers.size > 0;
    })();

    return this.loadPromise;
  }

  /** Play a pitched piano note for roughly durationSec (envelope release). */
  play(midi: number, durationSec: number, when?: number, velocity = 0.9): void {
    const ctx = this.ensure();
    const t0 = when ?? ctx.currentTime;
    const dur = Math.max(0.08, durationSec);

    const nearest = this.nearestSample(midi);
    if (nearest) {
      this.playSample(nearest.midi, nearest.buffer, midi, dur, t0, velocity);
      return;
    }
    this.playOscillator(midi, dur, t0, velocity * 0.2);
  }

  private nearestSample(midi: number): { midi: number; buffer: AudioBuffer } | null {
    let best: { midi: number; buffer: AudioBuffer } | null = null;
    let bestDist = Infinity;
    for (const [sampleMidi, buffer] of this.buffers) {
      const dist = Math.abs(sampleMidi - midi);
      if (dist < bestDist) {
        bestDist = dist;
        best = { midi: sampleMidi, buffer };
      }
    }
    return best;
  }

  private playSample(
    sampleMidi: number,
    buffer: AudioBuffer,
    targetMidi: number,
    durationSec: number,
    t0: number,
    velocity: number,
  ): void {
    const ctx = this.ensure();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = Math.pow(2, (targetMidi - sampleMidi) / 12);

    const gain = ctx.createGain();
    const peak = Math.min(1, 0.22 + velocity * 0.35);
    const attack = 0.008;
    const release = Math.min(0.45, Math.max(0.08, durationSec * 0.35));
    const holdEnd = t0 + Math.max(attack + 0.02, durationSec - release);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gain.gain.setValueAtTime(peak * 0.92, holdEnd);
    gain.gain.exponentialRampToValueAtTime(0.0001, holdEnd + release);

    src.connect(gain);
    gain.connect(this.master ?? ctx.destination);

    const stopAt = holdEnd + release + 0.05;
    src.start(t0);
    src.stop(stopAt);
  }

  private playOscillator(
    midi: number,
    durationSec: number,
    t0: number,
    gainPeak: number,
  ): void {
    const ctx = this.ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = midiToFrequency(midi);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      t0 + Math.max(0.08, durationSec * 0.9),
    );
    osc.connect(gain);
    gain.connect(this.master ?? ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durationSec + 0.05);
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.buffers.clear();
    this.ready = false;
    this.loadPromise = null;
  }
}
