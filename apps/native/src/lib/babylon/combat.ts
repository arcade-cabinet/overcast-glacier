/**
 * Anime-Style Combat System with Babylon.js
 * DBZ/Kill La Kill inspired clash effects that hide collision details
 */
import {
  type AbstractMesh,
  Animation,
  type ArcRotateCamera,
  Color3,
  Color4,
  GPUParticleSystem,
  type Mesh,
  MeshBuilder,
  ParticleSystem,
  type Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { GameRNG } from "../rng";

export interface ClashEffect {
  particleSystem: ParticleSystem | GPUParticleSystem;
  flashMesh: Mesh | null;
  duration: number;
  startTime: number;
}

export interface CombatConfig {
  clashRange: number;
  clashCooldown: number;
  knockbackForce: number;
  particleCount: number;
  flashDuration: number;
  cameraShakeIntensity: number;
}

const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  clashRange: 2.5,
  clashCooldown: 2000,
  knockbackForce: 8,
  particleCount: 500, // Reduced for mobile
  flashDuration: 0.3,
  cameraShakeIntensity: 0.5,
};

/**
 * Combat Manager - handles all combat interactions and effects
 */
export class CombatManager {
  private scene: Scene;
  private camera: ArcRotateCamera | null = null;
  private config: CombatConfig;
  private activeEffects: ClashEffect[] = [];
  private clashCooldowns: Set<string> = new Set();
  private originalCameraRadius = 30;

  // Reusable particle texture (created once)
  private particleTexture: Texture | null = null;

  constructor(scene: Scene, config: Partial<CombatConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_COMBAT_CONFIG, ...config };
  }

  /**
   * Set the camera for shake effects
   */
  setCamera(camera: ArcRotateCamera): void {
    this.camera = camera;
    this.originalCameraRadius = camera.radius;
  }

  /**
   * Check if entities are in clash range
   */
  canClash(
    entityA: AbstractMesh,
    entityB: AbstractMesh,
    clashId: string,
  ): boolean {
    if (this.clashCooldowns.has(clashId)) {
      return false;
    }

    const distance = Vector3.Distance(entityA.position, entityB.position);
    return distance < this.config.clashRange;
  }

  /**
   * Trigger an anime-style clash between two entities
   */
  triggerClash(
    entityA: AbstractMesh,
    entityB: AbstractMesh,
    clashId: string,
    onComplete?: () => void,
  ): void {
    if (this.clashCooldowns.has(clashId)) return;

    // Set cooldown
    this.clashCooldowns.add(clashId);
    setTimeout(() => {
      this.clashCooldowns.delete(clashId);
    }, this.config.clashCooldown);

    // Calculate midpoint
    const midpoint = Vector3.Lerp(entityA.position, entityB.position, 0.5);
    midpoint.y += 1; // Raise effect slightly

    // Create explosion particles
    this.spawnExplosion(midpoint);

    // Screen flash
    this.screenFlash();

    // Camera shake + pull back
    this.cameraShake();

    // Apply knockback to both entities
    this.applyKnockback(entityA, entityB);

    // Cleanup and callback
    setTimeout(() => {
      onComplete?.();
    }, 500);
  }

  /**
   * Spawn explosion particle system (DBZ-style energy burst)
   */
  private spawnExplosion(position: Vector3): void {
    // Try GPU particles first, fall back to regular
    let particleSystem: ParticleSystem | GPUParticleSystem;

    try {
      // GPU particles for better performance
      particleSystem = new GPUParticleSystem(
        "explosion",
        { capacity: this.config.particleCount },
        this.scene,
      );
    } catch {
      // Fallback to CPU particles
      particleSystem = new ParticleSystem(
        "explosion",
        this.config.particleCount,
        this.scene,
      );
    }

    // Create simple particle texture if needed
    if (!this.particleTexture) {
      this.particleTexture = this.createParticleTexture();
    }
    particleSystem.particleTexture = this.particleTexture;

    // Emitter position
    particleSystem.emitter = position;

    // Emission area
    particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
    particleSystem.maxEmitBox = new Vector3(0.5, 0.5, 0.5);

    // Colors (orange/yellow energy burst)
    particleSystem.color1 = new Color4(1, 0.8, 0.2, 1);
    particleSystem.color2 = new Color4(1, 0.4, 0.1, 1);
    particleSystem.colorDead = new Color4(0.3, 0.1, 0, 0);

    // Size
    particleSystem.minSize = 0.2;
    particleSystem.maxSize = 1.5;

    // Lifetime
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 0.8;

    // Emission
    particleSystem.emitRate = this.config.particleCount * 2;
    particleSystem.manualEmitCount = this.config.particleCount;

    // Speed and direction
    particleSystem.direction1 = new Vector3(-5, 5, -5);
    particleSystem.direction2 = new Vector3(5, 8, 5);
    particleSystem.minEmitPower = 3;
    particleSystem.maxEmitPower = 8;

    // Gravity (slight upward for energy effect)
    particleSystem.gravity = new Vector3(0, -2, 0);

    // Blending for glowing effect
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    // Start and auto-dispose
    particleSystem.start();

    setTimeout(() => {
      particleSystem.stop();
      setTimeout(() => {
        particleSystem.dispose();
      }, 1000);
    }, 300);

    // Add ring shockwave
    this.spawnShockwave(position);
  }

  /**
   * Spawn expanding ring shockwave
   */
  private spawnShockwave(position: Vector3): void {
    const ring = MeshBuilder.CreateTorus(
      "shockwave",
      {
        diameter: 1,
        thickness: 0.3,
        tessellation: 32,
      },
      this.scene,
    );

    ring.position = position.clone();
    ring.rotation.x = Math.PI / 2;

    const material = new StandardMaterial("shockwaveMat", this.scene);
    material.diffuseColor = new Color3(1, 0.6, 0.2);
    material.emissiveColor = new Color3(1, 0.5, 0.1);
    material.alpha = 0.8;
    ring.material = material;

    // Animate expansion
    const expandAnim = new Animation(
      "expand",
      "scaling",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    expandAnim.setKeys([
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 30, value: new Vector3(8, 8, 8) },
    ]);

    const fadeAnim = new Animation(
      "fade",
      "visibility",
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    fadeAnim.setKeys([
      { frame: 0, value: 1 },
      { frame: 30, value: 0 },
    ]);

    ring.animations = [expandAnim, fadeAnim];

    this.scene.beginAnimation(ring, 0, 30, false, 1, () => {
      ring.dispose();
    });
  }

  /**
   * Create simple particle texture programmatically
   */
  private createParticleTexture(): Texture {
    // Create a simple radial gradient texture using dynamic texture
    const _size = 64;
    const texture = new Texture(null, this.scene);

    // For React Native, we'll use a simple white texture
    // In a full implementation, you'd create a proper radial gradient
    texture.name = "particleTexture";

    return texture;
  }

  /**
   * Screen flash effect
   */
  private screenFlash(): void {
    // Create a full-screen flash mesh
    const flash = MeshBuilder.CreatePlane("flash", { size: 100 }, this.scene);

    // Position in front of camera
    if (this.camera) {
      flash.position = this.camera.position.add(
        this.camera.getForwardRay().direction.scale(5),
      );
      flash.lookAt(this.camera.position);
    }

    const material = new StandardMaterial("flashMat", this.scene);
    material.diffuseColor = Color3.White();
    material.emissiveColor = Color3.White();
    material.alpha = 0.8;
    material.disableLighting = true;
    flash.material = material;

    // Fade out
    const fadeAnim = new Animation(
      "flashFade",
      "visibility",
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    fadeAnim.setKeys([
      { frame: 0, value: 0.8 },
      { frame: 20, value: 0 },
    ]);

    flash.animations = [fadeAnim];

    this.scene.beginAnimation(flash, 0, 20, false, 1, () => {
      flash.dispose();
    });
  }

  /**
   * Camera shake effect
   */
  private cameraShake(): void {
    if (!this.camera) return;

    // Pull camera back
    const originalRadius = this.originalCameraRadius;
    this.camera.radius = originalRadius * 1.3;

    // Shake
    let frames = 0;
    const maxFrames = 30;
    const intensity = this.config.cameraShakeIntensity;

    const shakeObserver = this.scene.onBeforeRenderObservable.add(() => {
      if (!this.camera) return;

      frames++;

      if (frames < maxFrames) {
        // Apply random offset
        const decay = 1 - frames / maxFrames;
        this.camera.alpha += (GameRNG.next() - 0.5) * intensity * decay * 0.1;
        this.camera.beta += (GameRNG.next() - 0.5) * intensity * decay * 0.05;
      } else {
        // Reset
        this.camera.radius = originalRadius;
        this.scene.onBeforeRenderObservable.remove(shakeObserver);
      }
    });

    // Ensure radius returns even if observer fails
    setTimeout(() => {
      if (this.camera) {
        this.camera.radius = originalRadius;
      }
    }, 1000);
  }

  /**
   * Apply knockback to entities after clash
   */
  private applyKnockback(entityA: AbstractMesh, entityB: AbstractMesh): void {
    const direction = entityB.position.subtract(entityA.position).normalize();
    const force = this.config.knockbackForce;

    // Knockback animation for entity A (away from B)
    const knockbackA = new Animation(
      "knockbackA",
      "position",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    const startA = entityA.position.clone();
    const endA = startA.subtract(direction.scale(force));
    endA.y = Math.max(startA.y, 1); // Keep above ground

    knockbackA.setKeys([
      { frame: 0, value: startA },
      { frame: 10, value: endA },
      { frame: 30, value: startA },
    ]);

    entityA.animations = [knockbackA];
    this.scene.beginAnimation(entityA, 0, 30, false);

    // Knockback animation for entity B (away from A)
    const knockbackB = new Animation(
      "knockbackB",
      "position",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    const startB = entityB.position.clone();
    const endB = startB.add(direction.scale(force));
    endB.y = Math.max(startB.y, 1);

    knockbackB.setKeys([
      { frame: 0, value: startB },
      { frame: 10, value: endB },
      { frame: 30, value: startB },
    ]);

    entityB.animations = [knockbackB];
    this.scene.beginAnimation(entityB, 0, 30, false);
  }

  /**
   * Spawn damage number popup (for HUD integration)
   */
  spawnDamageNumber(
    position: Vector3,
    damage: number,
    isCritical: boolean = false,
  ): { worldPosition: Vector3; damage: number; isCritical: boolean } {
    return {
      worldPosition: position.clone(),
      damage,
      isCritical,
    };
  }

  /**
   * Create power-up effect (cocoa collect, etc.)
   */
  spawnCollectEffect(
    position: Vector3,
    color: Color3 = new Color3(0.8, 0.4, 0.2),
  ): void {
    const particleSystem = new ParticleSystem("collect", 100, this.scene);

    if (this.particleTexture) {
      particleSystem.particleTexture = this.particleTexture;
    }

    particleSystem.emitter = position;

    particleSystem.color1 = new Color4(color.r, color.g, color.b, 1);
    particleSystem.color2 = new Color4(
      color.r * 1.2,
      color.g * 1.2,
      color.b * 1.2,
      1,
    );
    particleSystem.colorDead = new Color4(color.r, color.g, color.b, 0);

    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.8;

    particleSystem.emitRate = 200;
    particleSystem.manualEmitCount = 50;

    particleSystem.direction1 = new Vector3(-2, 3, -2);
    particleSystem.direction2 = new Vector3(2, 5, 2);

    particleSystem.gravity = new Vector3(0, -5, 0);

    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    particleSystem.start();

    setTimeout(() => {
      particleSystem.stop();
      setTimeout(() => particleSystem.dispose(), 1000);
    }, 200);
  }

  /**
   * Update active effects (call in render loop)
   */
  update(_deltaTime: number): void {
    const now = Date.now();

    // Cleanup finished effects
    this.activeEffects = this.activeEffects.filter((effect) => {
      if (now - effect.startTime > effect.duration) {
        effect.particleSystem.dispose();
        effect.flashMesh?.dispose();
        return false;
      }
      return true;
    });
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.activeEffects.forEach((effect) => {
      effect.particleSystem.dispose();
      effect.flashMesh?.dispose();
    });
    this.activeEffects = [];
    this.particleTexture?.dispose();
    this.clashCooldowns.clear();
  }
}
