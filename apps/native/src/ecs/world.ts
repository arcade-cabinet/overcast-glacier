import type { AbstractMesh, Vector3 } from "@babylonjs/core";
import { World } from "miniplex";
import { createReactAPI } from "miniplex-react";
import type React from "react";
import type { PlayerForm } from "../stores/useGameStore";
import type { EnemyType } from "../types";

export type Entity = {
  id?: string;

  // Tags
  tag?: "player" | "enemy" | "projectile" | "collectible" | "boss";

  // Components
  position: Vector3;
  velocity?: Vector3;
  rotation?: Vector3; // Euler angles

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
  model?: React.ReactNode;
  mesh?: AbstractMesh;
};

export const world = new World<Entity>();
export const ECS = createReactAPI(world);
