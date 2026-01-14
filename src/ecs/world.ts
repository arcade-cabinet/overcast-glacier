import { World } from "miniplex";
import { createReactAPI } from "miniplex-react";
import type * as THREE from "three";
import type { PlayerForm } from "../stores/useGameStore";
import type { EnemyType } from "../types";

export type Entity = {
  id?: string;

  // Tags
  tag?: "player" | "enemy" | "projectile" | "collectible" | "boss";

  // Components
  position: THREE.Vector3;
  velocity?: THREE.Vector3;
  rotation?: THREE.Euler;

  // Game Logic
  health?: number;
  playerForm?: PlayerForm;
  enemyType?: EnemyType;
  collectibleType?: "cocoa" | "film";

  // Physics
  radius?: number; // Collision radius
  gravity?: boolean;

  // State
  active?: boolean;

  // Render
  model?: React.ReactNode; // Optional: Can store JSX directly if needed, or use tag for rendering
};

export const world = new World<Entity>();
export const ECS = createReactAPI(world);
