import { AtmosphereSynth } from "./atmosphere";
import { AudioContextManager } from "./core";
import { MusicSynth } from "./music";
import { SFXSynth } from "./sfx";

export class ProceduralAudio {
  private static instance: ProceduralAudio;

  public atmosphere: AtmosphereSynth;
  public music: MusicSynth;
  public sfx: SFXSynth;
  private initialized = false;

  private constructor() {
    this.atmosphere = new AtmosphereSynth();
    this.music = new MusicSynth();
    this.sfx = new SFXSynth();
  }

  public static get(): ProceduralAudio {
    if (!ProceduralAudio.instance) {
      ProceduralAudio.instance = new ProceduralAudio();
    }
    return ProceduralAudio.instance;
  }

  public async init() {
    if (this.initialized) return;
    await AudioContextManager.resume();
    this.atmosphere.start();
    this.music.start();
    this.initialized = true;
  }

  public playSFX(type: "jump" | "impact" | "camera" | "cocoa") {
    if (!this.initialized) return; // Or queue?
    switch (type) {
      case "jump":
        this.sfx.playJump();
        break;
      case "impact":
        this.sfx.playImpact();
        break;
      case "camera":
        this.sfx.playCamera();
        break;
      case "cocoa":
        this.sfx.playCocoa();
        break;
    }
  }
}

// Export a simple compatible interface for existing code
export const AudioSystem = {
  playBGM: () => {
    ProceduralAudio.get().init();
  },
  playSFX: (key: string) => {
    // Map old keys to new types
    if (key === "sfx_camera") ProceduralAudio.get().playSFX("camera");
    if (key === "sfx_jump") ProceduralAudio.get().playSFX("jump");
    if (key === "sfx_impact") ProceduralAudio.get().playSFX("impact");
    if (key === "sfx_cocoa") ProceduralAudio.get().playSFX("cocoa");
  },
  init: () => {
    ProceduralAudio.get().init();
  },
};
