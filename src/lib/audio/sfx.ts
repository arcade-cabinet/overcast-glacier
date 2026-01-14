import { AudioContextManager, createNoiseBuffer } from "./core";

export class SFXSynth {
  private ctx: AudioContext;
  private masterGain: GainNode;

  constructor() {
    this.ctx = AudioContextManager.get();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
  }

  playJump() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playImpact() {
    // Low thud + noise burst
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(this.ctx, "white", 0.5);

    const oscGain = this.ctx.createGain();
    const noiseGain = this.ctx.createGain();

    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);

    oscGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    noiseGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + 0.1,
    );

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    osc.connect(oscGain);
    noise.connect(filter);
    filter.connect(noiseGain);

    oscGain.connect(this.masterGain);
    noiseGain.connect(this.masterGain);

    osc.start();
    noise.start();
    osc.stop(this.ctx.currentTime + 0.2);
    noise.stop(this.ctx.currentTime + 0.2);
  }

  playCamera() {
    // Mechanical click + high pitched flash charge feel
    const noise = this.ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(this.ctx, "white", 0.1);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.05);
  }

  playCocoa() {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}
