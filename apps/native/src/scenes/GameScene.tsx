/**
 * Main Game Scene - Babylon.js React Native
 * Integrates terrain, combat, navigation, and all game systems
 */

import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  HemisphericLight,
  type Mesh,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { EngineView, useEngine } from "@babylonjs/react-native";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { HUD } from "../components/HUD";
import { type InputState, TouchControls } from "../components/TouchControls";
import { world } from "../ecs/world";
import { audioManager, SoundType } from "../lib/audio";
import { CombatManager } from "../lib/babylon/combat";
import { CrowdManager } from "../lib/babylon/navigation";
import { getBiomeForChunk, TerrainManager } from "../lib/babylon/procedural";
import { GameRNG } from "../lib/rng";
import { useGameStore } from "../stores/useGameStore";

// Game constants
const PLAYER_MAX_SPEED = 40;
const WARMTH_DECAY_RATE = 0.5; // Per second
const COCOA_SPAWN_CHANCE = 0.02;
const ENEMY_SPAWN_INTERVAL = 3000; // ms
const KICK_RANGE = 3;
const KICK_DAMAGE = 2;

interface GameSceneProps {
  onBack?: () => void;
}

/**
 * Main Game Scene Component
 */
export function GameScene({ onBack }: GameSceneProps) {
  const engine = useEngine();
  const sceneRef = useRef<Scene | null>(null);
  const playerRef = useRef<Mesh | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const terrainRef = useRef<TerrainManager | null>(null);
  const crowdRef = useRef<CrowdManager | null>(null);
  const combatRef = useRef<CombatManager | null>(null);
  const cocoaPickupsRef = useRef<Mesh[]>([]);
  const inputRef = useRef<InputState>({
    horizontal: 0,
    vertical: 0,
    jump: false,
    kick: false,
    brake: false,
  });
  const lastEnemySpawnRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(Date.now());

  const gameState = useGameStore((s) => s.gameState);
  const _comboMultiplier = useGameStore((s) => s.comboMultiplier);

  /**
   * Handle kick/attack action
   */
  const handleKick = useCallback(
    (
      player: Mesh,
      crowd: CrowdManager,
      combat: CombatManager,
      state: ReturnType<typeof useGameStore.getState>,
    ) => {
      audioManager.playSFX(SoundType.Kick);

      // Find enemies in range
      const nearbyEnemies = crowd.getAgentsInRange(player.position, KICK_RANGE);

      for (const enemy of nearbyEnemies) {
        // Trigger clash effect
        combat.triggerClash(player, enemy.node as Mesh, enemy.id, () => {
          // Damage enemy
          const killed = crowd.damageAgent(enemy.id, KICK_DAMAGE);

          if (killed) {
            audioManager.playSFX(SoundType.Hit);
            state.incrementCombo();
            state.addScore(100 * state.comboMultiplier);
            state.incrementStat("enemiesDefeated");

            // Remove enemy after delay
            setTimeout(() => {
              crowd.removeAgent(enemy.id);
            }, 500);
          }
        });
      }

      // Miss - reset combo
      if (nearbyEnemies.length === 0) {
        state.resetCombo();
      }
    },
    [],
  );

  /**
   * Check for enemy collisions with player
   */
  const checkEnemyCollisions = useCallback(
    (
      player: Mesh,
      crowd: CrowdManager,
      combat: CombatManager,
      state: ReturnType<typeof useGameStore.getState>,
    ) => {
      const enemies = crowd.getAgentsInRange(player.position, 2);

      for (const enemy of enemies) {
        if (enemy.state === "attacking") {
          // Player takes damage
          audioManager.playSFX(SoundType.Damage);
          state.decreaseWarmth(10);
          state.resetCombo();

          // Knockback enemy
          crowd.damageAgent(enemy.id, 0);

          // Visual feedback
          combat.spawnCollectEffect(player.position, new Color3(1, 0.2, 0.2));
        }
      }
    },
    [],
  );

  /**
   * Maybe spawn a cocoa pickup
   */
  const maybeSpawnCocoa = useCallback((playerZ: number, scene: Scene) => {
    if (GameRNG.next() > COCOA_SPAWN_CHANCE) return;

    const x = GameRNG.range(-30, 30);
    const z = playerZ + GameRNG.range(50, 100);

    const cocoa = MeshBuilder.CreateSphere(
      `cocoa_${Date.now()}`,
      { diameter: 1, segments: 8 },
      scene,
    );
    cocoa.position = new Vector3(x, 2, z);

    const mat = new StandardMaterial("cocoaMat", scene);
    mat.diffuseColor = new Color3(0.55, 0.27, 0.07);
    mat.emissiveColor = new Color3(0.2, 0.1, 0.02);
    cocoa.material = mat;

    cocoaPickupsRef.current.push(cocoa);

    // Floating animation
    const startTime = Date.now();
    scene.onBeforeRenderObservable.add(() => {
      if (cocoa.isDisposed()) return;
      cocoa.position.y = 2 + Math.sin((Date.now() - startTime) * 0.003) * 0.3;
      cocoa.rotation.y += 0.02;
    });
  }, []);

  /**
   * Check for cocoa pickup collisions
   */
  const checkCocoaPickups = useCallback(
    (playerPos: Vector3, state: ReturnType<typeof useGameStore.getState>) => {
      const pickups = cocoaPickupsRef.current;

      for (let i = pickups.length - 1; i >= 0; i--) {
        const cocoa = pickups[i];
        if (cocoa.isDisposed()) {
          pickups.splice(i, 1);
          continue;
        }

        const dist = Vector3.Distance(playerPos, cocoa.position);
        if (dist < 2) {
          // Collect cocoa
          audioManager.playSFX(SoundType.Collect);
          state.increaseWarmth(20);
          state.addScore(50 * state.comboMultiplier);
          state.incrementStat("cocoaDrunk");

          // Spawn collect effect
          if (combatRef.current) {
            combatRef.current.spawnCollectEffect(
              cocoa.position,
              new Color3(0.8, 0.4, 0.2),
            );
          }

          cocoa.dispose();
          pickups.splice(i, 1);
        }

        // Remove if too far behind
        if (cocoa.position.z < playerPos.z - 50) {
          cocoa.dispose();
          pickups.splice(i, 1);
        }
      }
    },
    [],
  );

  /**
   * Initialize the Babylon scene
   */
  useEffect(() => {
    if (!engine) return;

    // Create scene
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.06, 0.09, 0.16, 1); // Dark winter sky
    sceneRef.current = scene;

    // Create camera (isometric-ish angle)
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2, // Alpha - rotation around Y
      Math.PI / 3.5, // Beta - angle from ground
      30, // Radius - distance
      Vector3.Zero(),
      scene,
    );
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 50;
    camera.attachControl(true);
    cameraRef.current = camera;

    // Ambient light
    const ambientLight = new HemisphericLight(
      "ambient",
      new Vector3(0, 1, -0.5),
      scene,
    );
    ambientLight.intensity = 0.6;
    ambientLight.groundColor = new Color3(0.2, 0.3, 0.4);

    // Directional light for shadows
    const sunLight = new DirectionalLight(
      "sun",
      new Vector3(-0.5, -1, 0.5),
      scene,
    );
    sunLight.intensity = 0.8;
    sunLight.position = new Vector3(50, 100, -50);

    // Shadow generator
    const shadowGenerator = new ShadowGenerator(1024, sunLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Create player mesh (kitten placeholder - sphere for now)
    const player = MeshBuilder.CreateSphere(
      "player",
      { diameter: 1.5, segments: 16 },
      scene,
    );
    player.position = new Vector3(0, 1, 0);

    const playerMat = new StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = new Color3(1, 0.8, 0.6); // Orange kitten
    playerMat.emissiveColor = new Color3(0.1, 0.05, 0.02);
    player.material = playerMat;
    shadowGenerator.addShadowCaster(player);
    playerRef.current = player;

    // Initialize terrain manager
    const terrain = new TerrainManager(scene, {
      chunkSize: 100,
      subdivisions: 32,
      visibleChunks: 5,
      heightScale: 8,
    });
    terrain.initialize();
    terrainRef.current = terrain;

    // Initialize crowd manager for enemies
    const crowd = new CrowdManager(scene, {
      maxAgents: 15,
      separationWeight: 2.5,
      maxSpeed: 6,
    });
    crowdRef.current = crowd;

    // Initialize combat manager
    const combat = new CombatManager(scene, {
      particleCount: 300,
      cameraShakeIntensity: 0.4,
    });
    combat.setCamera(camera);
    combatRef.current = combat;

    // Initialize audio
    audioManager.initialize();

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Set game state to menu when scene is ready
    useGameStore.getState().setGameState("menu");

    // Cleanup on unmount
    return () => {
      engine.stopRenderLoop();
      terrain.dispose();
      crowd.dispose();
      combat.dispose();
      audioManager.dispose();
      scene.dispose();
      world.clear();
    };
  }, [engine]);

  /**
   * Game loop - runs on every frame
   */
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    const observer = scene.onBeforeRenderObservable.add(() => {
      // Get current state directly (not via hook)
      const state = useGameStore.getState();
      if (state.gameState !== "playing") return;

      // Calculate delta time
      const now = Date.now();
      const deltaTime = Math.min((now - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = now;

      const player = playerRef.current;
      const camera = cameraRef.current;
      const terrain = terrainRef.current;
      const crowd = crowdRef.current;
      const combat = combatRef.current;

      if (!player || !camera || !terrain || !crowd || !combat) return;

      // Get input
      const input = inputRef.current;

      // Calculate velocity with tilt control
      let velocity = state.velocity;
      if (input.brake) {
        velocity = Math.max(5, velocity - 20 * deltaTime);
      } else {
        // Gradual acceleration
        velocity = Math.min(PLAYER_MAX_SPEED, velocity + 2 * deltaTime);
      }
      state.setVelocity(velocity);

      // Update player position
      player.position.z += velocity * deltaTime;
      player.position.x += input.horizontal * 15 * deltaTime;

      // Clamp X position to track bounds
      player.position.x = Math.max(-45, Math.min(45, player.position.x));

      // Get terrain height at player position
      const terrainY = terrain.getHeightAt(
        player.position.x,
        player.position.z,
      );
      player.position.y = terrainY + 0.75;

      // Handle jump
      if (input.jump) {
        // Simple jump - temporarily raise Y
        player.position.y += 3;
        audioManager.playSFX(SoundType.Jump);
        input.jump = false;
      }

      // Handle kick/attack
      if (input.kick) {
        handleKick(player, crowd, combat, state);
        input.kick = false;
      }

      // Sync position to store
      state.setPlayerPosition({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      });

      // Update camera to follow player
      camera.target.z = player.position.z + 10;
      camera.target.x = player.position.x * 0.3;

      // Update terrain chunks
      terrain.update(player.position.z);

      // Update biome
      const chunkIndex = Math.floor(player.position.z / 100);
      const biome = getBiomeForChunk(chunkIndex);
      state.setBiome(biome);

      // Update enemies
      crowd.update(deltaTime, player.position);

      // Spawn enemies periodically
      if (now - lastEnemySpawnRef.current > ENEMY_SPAWN_INTERVAL) {
        crowd.spawnRandomAgent(player.position, 40);
        lastEnemySpawnRef.current = now;
      }

      // Check enemy collisions
      checkEnemyCollisions(player, crowd, combat, state);

      // Spawn and check cocoa pickups
      maybeSpawnCocoa(player.position.z, scene);
      checkCocoaPickups(player.position, state);

      // Update combat effects
      combat.update(deltaTime);

      // Decrease warmth over time
      state.decreaseWarmth(WARMTH_DECAY_RATE * deltaTime);

      // Add score based on distance
      state.addScore(Math.floor(velocity * deltaTime * state.comboMultiplier));

      // Update distance stat
      state.incrementStat("distanceTraveled");
    });

    return () => {
      scene.onBeforeRenderObservable.remove(observer);
    };
  }, [checkCocoaPickups, checkEnemyCollisions, handleKick, maybeSpawnCocoa]);

  /**
   * Handle input from touch controls
   */
  const handleInput = useCallback((input: InputState) => {
    inputRef.current = input;
  }, []);

  /**
   * Handle tap on menu/gameover screens
   */
  const handleScreenTap = useCallback(() => {
    const state = useGameStore.getState();
    if (state.gameState === "menu" || state.gameState === "initial") {
      state.startGame();
      audioManager.playMusic(SoundType.GameMusic);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Babylon Engine View */}
      <EngineView style={styles.engine} />

      {/* Touch Controls Layer */}
      <TouchControls onInput={handleInput} disabled={gameState !== "playing"} />

      {/* HUD Layer */}
      <HUD />

      {/* Menu Overlay */}
      {(gameState === "menu" || gameState === "initial") && (
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={handleScreenTap}
          activeOpacity={1}
        >
          <Text style={styles.title}>OVERCAST</Text>
          <Text style={styles.subtitle}>GLACIERS!</Text>
          <Text style={styles.startHint}>Tap to Start</Text>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  engine: {
    flex: 1,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 9, 16, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 8,
    textShadowColor: "rgba(125, 211, 252, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#7DD3FC",
    letterSpacing: 4,
    marginTop: -8,
  },
  startHint: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 40,
    letterSpacing: 2,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    padding: 12,
  },
  backText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});

export default GameScene;
