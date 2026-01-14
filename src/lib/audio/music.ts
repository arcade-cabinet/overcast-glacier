import { AudioContextManager } from "./core";

// Minor Pentatonic Scale Frequencies (roughly A minor)
const SCALE = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25];

export class MusicSynth {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private isPlaying = false;
  private nextNoteTime = 0;

  constructor() {
    this.ctx = AudioContextManager.get();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduleNotes();
    this.startDrone();
  }

  stop() {
    this.isPlaying = false;
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
  }

  private startDrone() {
    // Low pad
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 110; // Low A
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 100;
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.1;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    lfo.start();
    
    // Stop logic handled by master gain mute on stop
  }

  private scheduleNotes() {
    if (!this.isPlaying) return;

    // Schedule lookahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.5) {
      this.playRandomNote(this.nextNoteTime);
      // Random interval between notes
      this.nextNoteTime += Math.random() * 2 + 1; 
    }

    setTimeout(() => this.scheduleNotes(), 200);
  }

  private playRandomNote(time: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Choose random note from scale
    const freq = SCALE[Math.floor(Math.random() * SCALE.length)];
    
    // Occasional octave jump for "glitch" feel
    const octave = Math.random() > 0.8 ? 2 : 1;
    
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq * octave, time);

    // Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5); // Long tail

    // Optional delay effect simulated
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.3;
    const delayGain = this.ctx.createGain();
    delayGain.gain.value = 0.4;

    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Send to delay
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // Feedback
    delayGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 2);
  }
}
