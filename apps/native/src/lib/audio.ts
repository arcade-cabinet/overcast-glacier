/**
 * Audio System using expo-av
 * Replaces Web Audio API with native audio
 */
import { Audio, type AVPlaybackStatus } from "expo-av";
import { AudioRNG } from "./rng";

export interface SoundConfig {
  volume: number;
  loop: boolean;
  pitch?: number;
}

const DEFAULT_SOUND_CONFIG: SoundConfig = {
  volume: 0.7,
  loop: false,
};

/**
 * Sound types for the game
 */
export enum SoundType {
  // Music
  MenuMusic = "menu_music",
  GameMusic = "game_music",
  BossMusic = "boss_music",

  // SFX
  Jump = "jump",
  Land = "land",
  Kick = "kick",
  Hit = "hit",
  Collect = "collect",
  Damage = "damage",
  Death = "death",
  Victory = "victory",

  // Ambience
  Wind = "wind",
  Snow = "snow",
}

/**
 * Audio Manager - handles all game audio
 */
export class AudioManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private musicSound: Audio.Sound | null = null;
  private ambienceSound: Audio.Sound | null = null;
  private masterVolume = 0.8;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private isInitialized = false;

  /**
   * Initialize audio system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn("Failed to initialize audio:", error);
    }
  }

  /**
   * Play a sound effect
   */
  async playSFX(
    type: SoundType,
    config: Partial<SoundConfig> = {},
  ): Promise<void> {
    if (!this.isInitialized) return;

    const { volume, loop, pitch } = { ...DEFAULT_SOUND_CONFIG, ...config };

    try {
      // For now, generate simple tones procedurally
      // In production, you'd load actual sound files
      const sound = await this.createProceduralSound(type);

      if (sound) {
        await sound.setVolumeAsync(volume * this.sfxVolume * this.masterVolume);
        await sound.setIsLoopingAsync(loop);

        if (pitch && pitch !== 1) {
          await sound.setRateAsync(pitch, true);
        }

        await sound.playAsync();

        // Auto-cleanup non-looping sounds
        if (!loop) {
          sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync();
            }
          });
        } else {
          this.sounds.set(type, sound);
        }
      }
    } catch (error) {
      console.warn(`Failed to play sound ${type}:`, error);
    }
  }

  /**
   * Create procedural sound (placeholder for actual audio files)
   */
  private async createProceduralSound(
    _type: SoundType,
  ): Promise<Audio.Sound | null> {
    // In a full implementation, you would load actual audio files:
    // const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/jump.mp3'));

    // For now, we just create a silent placeholder
    // This allows the game to run without audio files
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: "" }, // Empty URI - won't actually play
        { shouldPlay: false },
      );
      return sound;
    } catch {
      return null;
    }
  }

  /**
   * Play background music
   */
  async playMusic(type: SoundType): Promise<void> {
    if (!this.isInitialized) return;

    // Stop current music
    await this.stopMusic();

    try {
      const sound = await this.createProceduralSound(type);

      if (sound) {
        this.musicSound = sound;
        await sound.setVolumeAsync(this.musicVolume * this.masterVolume);
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      }
    } catch (error) {
      console.warn(`Failed to play music ${type}:`, error);
    }
  }

  /**
   * Stop background music
   */
  async stopMusic(): Promise<void> {
    if (this.musicSound) {
      try {
        await this.musicSound.stopAsync();
        await this.musicSound.unloadAsync();
      } catch {
        // Ignore errors during cleanup
      }
      this.musicSound = null;
    }
  }

  /**
   * Play ambience sound (wind, snow)
   */
  async playAmbience(type: SoundType): Promise<void> {
    if (!this.isInitialized) return;

    await this.stopAmbience();

    try {
      const sound = await this.createProceduralSound(type);

      if (sound) {
        this.ambienceSound = sound;
        await sound.setVolumeAsync(0.3 * this.masterVolume);
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      }
    } catch (error) {
      console.warn(`Failed to play ambience ${type}:`, error);
    }
  }

  /**
   * Stop ambience sound
   */
  async stopAmbience(): Promise<void> {
    if (this.ambienceSound) {
      try {
        await this.ambienceSound.stopAsync();
        await this.ambienceSound.unloadAsync();
      } catch {
        // Ignore errors during cleanup
      }
      this.ambienceSound = null;
    }
  }

  /**
   * Stop a specific sound
   */
  async stopSound(type: SoundType): Promise<void> {
    const sound = this.sounds.get(type);
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {
        // Ignore errors during cleanup
      }
      this.sounds.delete(type);
    }
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicSound) {
      this.musicSound.setVolumeAsync(this.musicVolume * this.masterVolume);
    }
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Update all playing sound volumes
   */
  private async updateAllVolumes(): Promise<void> {
    if (this.musicSound) {
      await this.musicSound.setVolumeAsync(
        this.musicVolume * this.masterVolume,
      );
    }
    if (this.ambienceSound) {
      await this.ambienceSound.setVolumeAsync(0.3 * this.masterVolume);
    }
  }

  /**
   * Pause all audio
   */
  async pauseAll(): Promise<void> {
    if (this.musicSound) {
      await this.musicSound.pauseAsync();
    }
    if (this.ambienceSound) {
      await this.ambienceSound.pauseAsync();
    }
    for (const sound of this.sounds.values()) {
      await sound.pauseAsync();
    }
  }

  /**
   * Resume all audio
   */
  async resumeAll(): Promise<void> {
    if (this.musicSound) {
      await this.musicSound.playAsync();
    }
    if (this.ambienceSound) {
      await this.ambienceSound.playAsync();
    }
  }

  /**
   * Play random variation of a sound type
   */
  async playRandomVariation(
    baseType: SoundType,
    pitchRange: [number, number] = [0.9, 1.1],
  ): Promise<void> {
    const pitch = AudioRNG.range(pitchRange[0], pitchRange[1]);
    await this.playSFX(baseType, { pitch });
  }

  /**
   * Dispose all audio resources
   */
  async dispose(): Promise<void> {
    await this.stopMusic();
    await this.stopAmbience();

    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.sounds.clear();

    this.isInitialized = false;
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();
