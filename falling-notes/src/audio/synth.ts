import { midiToFrequency } from "../engine/noteChart";

/** Simple Web Audio sine/triangle synth for optional reference playback. */
export class ReferenceSynth {
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  async resume(): Promise<void> {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
  }

  play(midi: number, durationSec: number, when?: number): void {
    const ctx = this.ensure();
    const t0 = when ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = midiToFrequency(midi);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      t0 + Math.max(0.08, durationSec * 0.9),
    );
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durationSec + 0.05);
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
  }
}
