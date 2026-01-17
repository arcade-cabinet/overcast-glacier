import type { Vector3 } from "@babylonjs/core";

export type EnemyType = "snowman" | "polar_bear" | "glitch_imp";

export interface EnemyInstance {
  id: string;
  position: Vector3;
  hit: () => void;
  type: EnemyType;
}

export interface CollectibleInstance {
  id: string;
  position: Vector3;
  collect: () => void;
  type: "cocoa" | "film";
}
