import { AudioContextManager, createNoiseBuffer } from "./core";

export class AtmosphereSynth {
  private ctx: AudioContext;
  private windGain: GainNode | null = null;
  private masterGain: GainNode;
  private isPlaying = false;

  constructor() {
    this.ctx = AudioContextManager.get();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.4;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startWind();
    this.startIceCrackles();
  }

  stop() {
    this.isPlaying = false;
    // Disconnect/stop logic would go here for full cleanup
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
  }

  private startWind() {
    // Pink noise source
    const buffer = createNoiseBuffer(this.ctx, 'pink', 5);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Lowpass filter to simulate muffled wind
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    // Gain node for gusts
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.5;

    // LFO for gusts (Low Frequency Oscillator)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow gusts
    
    // Connect LFO to filter frequency for dynamic "whooshing"
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200; // Modulate frequency by +/- 200Hz
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Chain: Noise -> Filter -> Gain -> Master
    source.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    source.start();
    lfo.start();
  }

  private startIceCrackles() {
    const loop = () => {
      if (!this.isPlaying) return;
      
      const delay = Math.random() * 5000 + 2000; // Random crackle every 2-7s
      setTimeout(() => {
        this.triggerCrackle();
        loop();
      }, delay);
    };
    loop();
  }

  private triggerCrackle() {
    // High frequency sine bursts with reverb feel
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(Math.random() * 1000 + 2000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    filter.type = 'highpass';
    filter.frequency.value = 1500;

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}
