/**
 * Procedural Terrain Generation using Babylon.js
 * Replaces Three.js/R3F terrain with native Babylon capabilities
 */
import {
  Color3,
  type Mesh,
  MeshBuilder,
  NoiseProceduralTexture,
  type Scene,
  StandardMaterial,
  Vector3,
  VertexData,
} from "@babylonjs/core";
import { TerrainRNG } from "../rng";

// Biome definitions with colors and properties
export const BIOMES = {
  open_slope: {
    color: new Color3(0.97, 0.98, 1.0), // Snow white
    emissive: new Color3(0.1, 0.1, 0.15),
    roughness: 0.6,
    hazardChance: 0.1,
  },
  ice_cave: {
    color: new Color3(0.49, 0.83, 0.99), // Ice blue
    emissive: new Color3(0.05, 0.1, 0.15),
    roughness: 0.2,
    hazardChance: 0.3,
  },
  frozen_rink: {
    color: new Color3(0.72, 0.89, 0.99), // Light ice
    emissive: new Color3(0.1, 0.12, 0.15),
    roughness: 0.1,
    hazardChance: 0.2,
  },
  cocoa_valley: {
    color: new Color3(0.55, 0.27, 0.07), // Cocoa brown
    emissive: new Color3(0.08, 0.04, 0.01),
    roughness: 0.8,
    hazardChance: 0.05,
  },
  summit: {
    color: new Color3(0.87, 0.87, 0.87), // Gray rock
    emissive: new Color3(0.05, 0.05, 0.05),
    roughness: 0.9,
    hazardChance: 0.4,
  },
} as const;

export type BiomeType = keyof typeof BIOMES;

export interface TerrainChunk {
  mesh: Mesh;
  zPosition: number;
  biome: BiomeType;
  chunkIndex: number;
  obstacles: Mesh[];
}

export interface TerrainConfig {
  chunkSize: number;
  subdivisions: number;
  visibleChunks: number;
  heightScale: number;
  noiseScale: number;
}

const DEFAULT_CONFIG: TerrainConfig = {
  chunkSize: 100,
  subdivisions: 32,
  visibleChunks: 5,
  heightScale: 8,
  noiseScale: 0.02,
};

/**
 * Determines biome for a chunk using deterministic RNG
 */
export function getBiomeForChunk(chunkIndex: number): BiomeType {
  const chunkSeed = 42 + chunkIndex * 1337;
  TerrainRNG.reset(chunkSeed);
  const biomes = Object.keys(BIOMES) as BiomeType[];
  return TerrainRNG.pick(biomes);
}

/**
 * Generates terrain height using multi-octave noise
 */
export function getTerrainHeight(
  x: number,
  z: number,
  config: TerrainConfig = DEFAULT_CONFIG,
): number {
  const scale = config.noiseScale;

  // Multi-octave noise for natural terrain
  const octave1 = Math.sin(x * scale) * Math.cos(z * scale);
  const octave2 = Math.sin(x * scale * 2.5) * Math.cos(z * scale * 2.5) * 0.4;
  const octave3 = Math.sin(x * scale * 5) * Math.cos(z * scale * 5) * 0.15;

  // Create gentle slopes and valleys
  const base = octave1 + octave2 + octave3;

  // Add downhill bias (terrain gets lower as z increases)
  const slopeBias = -z * 0.005;

  return base * config.heightScale + slopeBias;
}

/**
 * Creates a material for a biome
 */
export function createBiomeMaterial(
  scene: Scene,
  biome: BiomeType,
  chunkIndex: number,
): StandardMaterial {
  const biomeData = BIOMES[biome];
  const material = new StandardMaterial(`mat_${biome}_${chunkIndex}`, scene);

  material.diffuseColor = biomeData.color;
  material.specularColor = new Color3(
    biomeData.roughness * 0.3,
    biomeData.roughness * 0.3,
    biomeData.roughness * 0.3,
  );
  material.emissiveColor = biomeData.emissive;
  material.specularPower = 100 * biomeData.roughness;

  // Add subtle procedural noise texture for detail
  if (scene.getEngine()) {
    try {
      const noise = new NoiseProceduralTexture(
        `noise_${chunkIndex}`,
        256,
        scene,
      );
      noise.octaves = 4;
      noise.persistence = 0.5;
      material.bumpTexture = noise;
      material.bumpTexture.level = 0.1;
    } catch {
      // NoiseProceduralTexture may not be available on all platforms
    }
  }

  return material;
}

/**
 * Creates a terrain chunk with height displacement
 */
export function createTerrainChunk(
  scene: Scene,
  chunkIndex: number,
  config: TerrainConfig = DEFAULT_CONFIG,
): TerrainChunk {
  const zPosition = chunkIndex * config.chunkSize;
  const biome = getBiomeForChunk(chunkIndex);

  // Create ground mesh
  const ground = MeshBuilder.CreateGround(
    `terrain_chunk_${chunkIndex}`,
    {
      width: config.chunkSize,
      height: config.chunkSize,
      subdivisions: config.subdivisions,
      updatable: true,
    },
    scene,
  );

  // Apply height displacement
  const positions = ground.getVerticesData("position");
  if (positions) {
    for (let i = 0; i < positions.length; i += 3) {
      const localX = positions[i];
      const localZ = positions[i + 2];
      const worldZ = localZ + zPosition;
      positions[i + 1] = getTerrainHeight(localX, worldZ, config);
    }
    ground.updateVerticesData("position", positions);
    ground.refreshBoundingInfo();

    // Recompute normals for proper lighting
    const normals: number[] = [];
    VertexData.ComputeNormals(positions, ground.getIndices() || [], normals);
    ground.updateVerticesData("normal", normals);
  }

  // Position chunk in world
  ground.position.z = zPosition + config.chunkSize / 2;

  // Apply biome material
  ground.material = createBiomeMaterial(scene, biome, chunkIndex);
  ground.receiveShadows = true;

  // Generate obstacles for this chunk
  const obstacles = generateObstacles(scene, chunkIndex, biome, config);

  return {
    mesh: ground,
    zPosition,
    biome,
    chunkIndex,
    obstacles,
  };
}

/**
 * Generates obstacles (rocks, ice blocks, trees) for a chunk
 */
function generateObstacles(
  scene: Scene,
  chunkIndex: number,
  biome: BiomeType,
  config: TerrainConfig,
): Mesh[] {
  const obstacles: Mesh[] = [];
  const biomeData = BIOMES[biome];
  const zPosition = chunkIndex * config.chunkSize;

  // Reset RNG for deterministic obstacle placement
  TerrainRNG.reset(chunkIndex * 7919 + 13);

  const numObstacles = Math.floor(
    TerrainRNG.range(3, 8) * biomeData.hazardChance * 10,
  );

  for (let i = 0; i < numObstacles; i++) {
    const x = TerrainRNG.range(
      -config.chunkSize / 2 + 5,
      config.chunkSize / 2 - 5,
    );
    const z = TerrainRNG.range(5, config.chunkSize - 5);
    const worldZ = z + zPosition;
    const y = getTerrainHeight(x, worldZ, config);

    // Create obstacle based on biome
    let obstacle: Mesh;

    if (biome === "ice_cave" || biome === "frozen_rink") {
      // Ice crystal
      obstacle = MeshBuilder.CreateCylinder(
        `ice_${chunkIndex}_${i}`,
        {
          diameterTop: 0,
          diameterBottom: TerrainRNG.range(1, 3),
          height: TerrainRNG.range(2, 5),
          tessellation: 6,
        },
        scene,
      );
      const iceMat = new StandardMaterial(`iceMat_${chunkIndex}_${i}`, scene);
      iceMat.diffuseColor = new Color3(0.6, 0.9, 1.0);
      iceMat.alpha = 0.8;
      iceMat.specularColor = Color3.White();
      obstacle.material = iceMat;
    } else if (biome === "summit") {
      // Rock
      obstacle = MeshBuilder.CreatePolyhedron(
        `rock_${chunkIndex}_${i}`,
        {
          type: TerrainRNG.rangeInt(0, 3),
          size: TerrainRNG.range(1, 2.5),
        },
        scene,
      );
      const rockMat = new StandardMaterial(`rockMat_${chunkIndex}_${i}`, scene);
      rockMat.diffuseColor = new Color3(0.4, 0.4, 0.45);
      obstacle.material = rockMat;
    } else {
      // Snow mound
      obstacle = MeshBuilder.CreateSphere(
        `mound_${chunkIndex}_${i}`,
        {
          diameter: TerrainRNG.range(2, 4),
          segments: 8,
        },
        scene,
      );
      obstacle.scaling.y = 0.4;
      const snowMat = new StandardMaterial(`snowMat_${chunkIndex}_${i}`, scene);
      snowMat.diffuseColor = new Color3(0.95, 0.95, 1.0);
      obstacle.material = snowMat;
    }

    obstacle.position = new Vector3(x, y + 0.5, zPosition + z);
    obstacle.rotation.y = TerrainRNG.range(0, Math.PI * 2);
    obstacles.push(obstacle);
  }

  return obstacles;
}

/**
 * Terrain Manager - handles chunk streaming
 */
export class TerrainManager {
  private scene: Scene;
  private config: TerrainConfig;
  private chunks: Map<number, TerrainChunk> = new Map();
  private currentChunkIndex = 0;

  constructor(scene: Scene, config: Partial<TerrainConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize terrain with initial chunks
   */
  initialize(): void {
    for (let i = 0; i < this.config.visibleChunks; i++) {
      this.createChunk(i);
    }
  }

  /**
   * Update terrain based on player position
   */
  update(playerZ: number): void {
    const newChunkIndex = Math.floor(playerZ / this.config.chunkSize);

    if (newChunkIndex !== this.currentChunkIndex) {
      this.currentChunkIndex = newChunkIndex;

      // Create new chunks ahead
      for (let i = 0; i < this.config.visibleChunks; i++) {
        const chunkIdx = newChunkIndex + i;
        if (!this.chunks.has(chunkIdx)) {
          this.createChunk(chunkIdx);
        }
      }

      // Remove old chunks behind
      const minChunk = newChunkIndex - 2;
      for (const [idx, chunk] of this.chunks) {
        if (idx < minChunk) {
          this.disposeChunk(chunk);
          this.chunks.delete(idx);
        }
      }
    }
  }

  private createChunk(index: number): void {
    const chunk = createTerrainChunk(this.scene, index, this.config);
    this.chunks.set(index, chunk);
  }

  private disposeChunk(chunk: TerrainChunk): void {
    chunk.mesh.dispose();
    for (const o of chunk.obstacles) {
      o.dispose();
    }
  }

  /**
   * Get all current chunks
   */
  getChunks(): TerrainChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Get terrain height at world position
   */
  getHeightAt(x: number, z: number): number {
    return getTerrainHeight(x, z, this.config);
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    for (const chunk of this.chunks.values()) {
      this.disposeChunk(chunk);
    }
    this.chunks.clear();
  }
}
