---
inclusion: fileMatch
fileMatchPattern: ['**/audio/**/*.ts']
---

# Procedural Audio System

## Overview

The game uses procedural audio synthesis via Web Audio API. No audio files - everything is generated at runtime.

## Architecture

```
src/lib/audio/
├── core.ts          # AudioContext singleton, master gain
├── atmosphere.ts    # Wind, ice crackles (ambient)
├── sfx.ts          # Sound effects (jump, hit, collect)
├── music.ts        # Generative background music
└── ProceduralAudio.ts  # Legacy/main export
```

## Core Audio Context

```typescript
// Singleton pattern - one AudioContext for the app
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function resumeAudio(): void {
  if (audioContext?.state === "suspended") {
    audioContext.resume();
  }
}
```

### User Gesture Requirement

Web Audio requires user interaction before playing. Call `resumeAudio()` on first user tap/click.

## Sound Design Patterns

### Oscillator-Based SFX

```typescript
function playJump() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
```

### Noise-Based Atmosphere

Wind uses filtered pink noise:

```typescript
function createPinkNoise() {
  const ctx = getAudioContext();
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  // Pink noise algorithm
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    // ... additional coefficients
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
  }

  return buffer;
}
```

### Generative Music

Minor pentatonic sequencer:

```typescript
const PENTATONIC_MINOR = [0, 3, 5, 7, 10]; // Semitone offsets

function getRandomNote(rng: RNG, baseFreq: number): number {
  const octave = rng.rangeInt(0, 2);
  const noteIndex = rng.rangeInt(0, PENTATONIC_MINOR.length - 1);
  const semitones = PENTATONIC_MINOR[noteIndex] + octave * 12;
  return baseFreq * Math.pow(2, semitones / 12);
}
```

## Deterministic RNG

Use project RNG for reproducible audio:

```typescript
import { GameRNG } from "@/lib/rng";

// Or create isolated RNG for audio
const AudioRNG = new RNG(42);

function generateCrackle() {
  const interval = AudioRNG.range(2, 5); // seconds
  // ...
}
```

## Best Practices

1. **Use exponential ramps** - `exponentialRampToValueAtTime` sounds more natural
2. **Short sounds = oscillators** - No need for buffers for < 0.5s sounds
3. **Disconnect nodes** - Clean up after sounds finish to prevent memory leaks
4. **Master gain control** - Route all audio through a master gain for volume control
5. **Use RNG for variation** - Slight randomness prevents repetitive feel
6. **Lazy initialization** - Don't create AudioContext until needed
