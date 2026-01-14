import { GameRNG } from "../rng";
import { AudioContextManager } from "./core";

// Minor Pentatonic Scale Frequencies (roughly A minor)
const SCALE = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25];

export class MusicSynth {
  // ... existing code ...
  private scheduleNotes() {
    if (!this.isPlaying) return;

    // Schedule lookahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.5) {
      this.playRandomNote(this.nextNoteTime);
      // Random interval between notes
      this.nextNoteTime += GameRNG.range(1, 3); 
    }

    setTimeout(() => this.scheduleNotes(), 200);
  }

  private playRandomNote(time: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Choose random note from scale
    const freq = SCALE[Math.floor(GameRNG.next() * SCALE.length)];
    
    // Occasional octave jump for "glitch" feel
    const octave = GameRNG.chance(0.2) ? 2 : 1;
    
    osc.type = GameRNG.chance(0.5) ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq * octave, time);

    // Envelope
    // ... existing code ...
