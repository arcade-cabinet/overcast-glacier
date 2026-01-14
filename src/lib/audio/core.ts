import { GameRNG } from "../rng";

// Singleton to manage the AudioContext
class AudioContextManager {
// ... existing code ...
  public static async resume() {
    if (AudioContextManager.instance?.state === 'suspended') {
      await AudioContextManager.instance.resume();
    }
  }
}

// Utility to create noise buffers (White, Pink)
export const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink' = 'white', duration = 2): AudioBuffer => {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = GameRNG.next() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = GameRNG.next() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }
  }

  return buffer;
};

export { AudioContextManager };
