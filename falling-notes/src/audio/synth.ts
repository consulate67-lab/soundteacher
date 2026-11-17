/** Chromatic Salamander-based acoustic piano under /samples/piano (C3–C6). */
const SAMPLE_NAMES = [
  "C3",
  "Cs3",
  "D3",
  "Ds3",
  "E3",
  "F3",
  "Fs3",
  "G3",
  "Gs3",
  "A3",
  "As3",
  "B3",
  "C4",
  "Cs4",
  "D4",
  "Ds4",
  "E4",
  "F4",
  "Fs4",
  "G4",
  "Gs4",
  "A4",
  "As4",
  "B4",
  "C5",
  "Cs5",
  "D5",
  "Ds5",
  "E5",
  "F5",
  "Fs5",
  "G5",
  "Gs5",
  "A5",
  "As5",
  "B5",
  "C6",
] as const;

/** MIDI for C3 … C6 matching SAMPLE_NAMES order. */
const SAMPLE_MIDI_START = 48; // C3

/**
 * Acoustic piano playback via dense multi-samples (Web Audio buffers).
 * Exact MIDI hits play without pitch-shift; envelope preserves hammer attack.
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
      // Slight headroom; samples are already normalized.
      this.master.gain.value = 0.72;
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
        SAMPLE_NAMES.map(async (name, i) => {
          const midi = SAMPLE_MIDI_START + i;
          try {
            const res = await fetch(`/samples/piano/${name}.mp3`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.arrayBuffer();
            const buf = await ctx.decodeAudioData(raw.slice(0));
            this.buffers.set(midi, buf);
          } catch {
            // Missing note: nearest-sample path covers it.
          }
        }),
      );
      this.ready = this.buffers.size > 0;
    })();

    return this.loadPromise;
  }

  /** Play acoustic piano for roughly durationSec (natural attack, soft release). */
  play(midi: number, durationSec: number, when?: number, velocity = 0.9): void {
    const ctx = this.ensure();
    const t0 = when ?? ctx.currentTime;
    const dur = Math.max(0.06, durationSec);

    const picked = this.pickSample(midi);
    if (!picked) return;

    this.playSample(picked.midi, picked.buffer, midi, dur, t0, velocity);
  }

  /** Prefer exact buffer; otherwise nearest (≤2 semitones typical with dense set). */
  private pickSample(midi: number): { midi: number; buffer: AudioBuffer } | null {
    const exact = this.buffers.get(midi);
    if (exact) return { midi, buffer: exact };

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

    const semitones = targetMidi - sampleMidi;
    // Dense bank → almost always 0; keep tiny shifts only for out-of-range notes.
    src.playbackRate.value = semitones === 0 ? 1 : Math.pow(2, semitones / 12);

    const gain = ctx.createGain();
    const peak = Math.min(0.95, 0.35 + velocity * 0.55);

    // Preserve Salamander hammer attack: no fade-in from silence (that → organ).
    gain.gain.setValueAtTime(peak, t0);

    // Natural decay lives in the sample; we only gate with a short piano-like release.
    const release = Math.min(0.55, Math.max(0.12, durationSec * 0.28));
    const noteEnd = t0 + Math.max(0.05, durationSec);
    const levelAtRelease = peak * 0.55;
    gain.gain.setValueAtTime(levelAtRelease, Math.max(t0 + 0.03, noteEnd - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd + 0.02);

    src.connect(gain);
    gain.connect(this.master ?? ctx.destination);

    src.start(t0);
    // Let a bit of release trail past written duration.
    src.stop(noteEnd + release + 0.08);
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
