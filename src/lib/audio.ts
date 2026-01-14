import { Howl } from "howler";

// In a real production app, we'd import these from assets
// For this template, we'll use placeholders or generated sounds if possible,
// but for now, we set up the structure.

export const SOUNDS = {
  bgm_chill: new Howl({
    src: ["/assets/sounds/chill_glitch_lofi.mp3"], // Placeholder path
    loop: true,
    volume: 0.5,
    html5: true,
  }),
  sfx_camera: new Howl({
    src: ["/assets/sounds/camera_shutter.mp3"],
    volume: 0.8,
  }),
  sfx_jump: new Howl({
    src: ["/assets/sounds/jump.mp3"],
    volume: 0.6,
  }),
  sfx_impact: new Howl({
    src: ["/assets/sounds/impact.mp3"],
    volume: 0.7,
  }),
  sfx_cocoa: new Howl({
    src: ["/assets/sounds/slurp.mp3"],
    volume: 1.0,
  }),
};

export const AudioSystem = {
  playBGM: () => {
    if (!SOUNDS.bgm_chill.playing()) {
      // SOUNDS.bgm_chill.play(); // Commented out to prevent auto-play policy issues in dev
    }
  },
  playSFX: (key: keyof typeof SOUNDS) => {
    if (key.startsWith("sfx_")) {
      // SOUNDS[key].play();
    }
  },
  mute: (muted: boolean) => {
    Howler.mute(muted);
  },
};
