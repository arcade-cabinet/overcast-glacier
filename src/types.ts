import type * as THREE from "three";

export type EnemyType = "snowman" | "polar_bear" | "glitch_imp";

export interface EnemyInstance {
  id: string;
  position: THREE.Vector3;
  hit: () => void;
  type: EnemyType;
}

export interface CollectibleInstance {
  id: string;
  position: THREE.Vector3;
  collect: () => void;
  type: "cocoa" | "film";
}
