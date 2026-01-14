import { GameRNG } from "../rng";
import { AudioContextManager, createNoiseBuffer } from "./core";

export class AtmosphereSynth {
  // ... existing code ...
  private startIceCrackles() {
    const loop = () => {
      if (!this.isPlaying) return;
      
      const delay = GameRNG.range(2000, 7000); // Random crackle every 2-7s
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
    osc.frequency.setValueAtTime(GameRNG.range(2000, 3000), this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    filter.type = 'highpass';
    // ... existing code ...
