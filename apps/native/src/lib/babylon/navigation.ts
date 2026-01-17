/**
 * AI Navigation System using Babylon.js Navigation Plugin V2
 * Replaces Yuka with native Babylon crowd simulation + pathfinding
 */
import {
  type AbstractMesh,
  Color3,
  type Mesh,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  type TransformNode,
  Vector3,
} from "@babylonjs/core";
import { GameRNG } from "../rng";

// Navigation types (Navigation Plugin V2 may not be available on React Native yet)
// We implement a simplified crowd simulation that works on all platforms

export interface Agent {
  id: string;
  node: TransformNode;
  position: Vector3;
  velocity: Vector3;
  target: Vector3 | null;
  speed: number;
  radius: number;
  state: AgentState;
  health: number;
  maxHealth: number;
}

export type AgentState =
  | "idle"
  | "pursuing"
  | "attacking"
  | "fleeing"
  | "stunned";

export interface CrowdConfig {
  maxAgents: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  neighborRadius: number;
}

const DEFAULT_CROWD_CONFIG: CrowdConfig = {
  maxAgents: 20,
  separationWeight: 2.0,
  alignmentWeight: 0.5,
  cohesionWeight: 0.3,
  maxSpeed: 8,
  neighborRadius: 5,
};

/**
 * Simplified Crowd Simulation for React Native
 * Uses steering behaviors similar to Yuka but built on Babylon primitives
 */
export class CrowdManager {
  private scene: Scene;
  private config: CrowdConfig;
  private agents: Map<string, Agent> = new Map();
  private agentCounter = 0;

  constructor(scene: Scene, config: Partial<CrowdConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CROWD_CONFIG, ...config };
  }

  /**
   * Add an agent to the crowd
   */
  addAgent(
    position: Vector3,
    options: {
      speed?: number;
      radius?: number;
      health?: number;
      mesh?: AbstractMesh;
    } = {},
  ): Agent {
    const id = `agent_${this.agentCounter++}`;

    const node = options.mesh
      ? (options.mesh as unknown as TransformNode)
      : this.createDefaultAgentMesh(id);

    node.position = position.clone();

    const agent: Agent = {
      id,
      node,
      position: position.clone(),
      velocity: Vector3.Zero(),
      target: null,
      speed: options.speed ?? 5,
      radius: options.radius ?? 1,
      state: "idle",
      health: options.health ?? 3,
      maxHealth: options.health ?? 3,
    };

    this.agents.set(id, agent);
    return agent;
  }

  /**
   * Create a default enemy mesh (placeholder)
   */
  private createDefaultAgentMesh(id: string): Mesh {
    const mesh = MeshBuilder.CreateSphere(
      id,
      { diameter: 1.5, segments: 8 },
      this.scene,
    );

    const material = new StandardMaterial(`${id}_mat`, this.scene);
    material.diffuseColor = new Color3(1, 1, 1); // White (snowman enemy)
    material.emissiveColor = new Color3(0.1, 0.1, 0.2);
    mesh.material = material;

    return mesh;
  }

  /**
   * Remove an agent
   */
  removeAgent(id: string): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.node.dispose();
      this.agents.delete(id);
    }
  }

  /**
   * Set target for an agent (enables pursuit)
   */
  setAgentTarget(id: string, target: Vector3 | null): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.target = target?.clone() ?? null;
      agent.state = target ? "pursuing" : "idle";
    }
  }

  /**
   * Update all agents (call in render loop)
   */
  update(deltaTime: number, playerPosition: Vector3): void {
    const dt = Math.min(deltaTime, 0.1); // Cap delta to prevent tunneling

    for (const agent of this.agents.values()) {
      if (agent.state === "stunned") continue;

      // Calculate steering forces
      const steering = this.calculateSteering(agent, playerPosition);

      // Apply steering to velocity
      agent.velocity.addInPlace(steering.scale(dt));

      // Clamp velocity to max speed
      if (agent.velocity.length() > agent.speed) {
        agent.velocity.normalize().scaleInPlace(agent.speed);
      }

      // Update position
      agent.position.addInPlace(agent.velocity.scale(dt));

      // Keep on ground (simplified - in full impl, raycast to terrain)
      agent.position.y = Math.max(0.75, agent.position.y);

      // Sync mesh position
      agent.node.position.copyFrom(agent.position);

      // Face movement direction
      if (agent.velocity.length() > 0.1) {
        const lookDir = agent.velocity.clone();
        lookDir.y = 0;
        if (lookDir.length() > 0.01) {
          agent.node.rotation.y = Math.atan2(lookDir.x, lookDir.z);
        }
      }

      // Update state based on distance to player
      const distToPlayer = Vector3.Distance(agent.position, playerPosition);
      if (distToPlayer < 2.5) {
        agent.state = "attacking";
      } else if (distToPlayer < 15) {
        agent.state = "pursuing";
      }
    }
  }

  /**
   * Calculate steering forces for an agent
   */
  private calculateSteering(agent: Agent, playerPosition: Vector3): Vector3 {
    const steering = Vector3.Zero();

    // Seek/Pursue player
    if (agent.target || agent.state === "pursuing") {
      const target = agent.target ?? playerPosition;
      const desired = target.subtract(agent.position);
      const distance = desired.length();

      if (distance > 0.5) {
        desired.normalize();

        // Arrival behavior - slow down when close
        const arrivalRadius = 5;
        if (distance < arrivalRadius) {
          desired.scaleInPlace(agent.speed * (distance / arrivalRadius));
        } else {
          desired.scaleInPlace(agent.speed);
        }

        const seek = desired.subtract(agent.velocity);
        steering.addInPlace(seek);
      }
    }

    // Separation from other agents
    const separation = this.calculateSeparation(agent);
    steering.addInPlace(separation.scale(this.config.separationWeight));

    return steering;
  }

  /**
   * Calculate separation force from nearby agents
   */
  private calculateSeparation(agent: Agent): Vector3 {
    const separation = Vector3.Zero();
    let neighborCount = 0;

    for (const other of this.agents.values()) {
      if (other.id === agent.id) continue;

      const distance = Vector3.Distance(agent.position, other.position);
      if (distance < this.config.neighborRadius && distance > 0) {
        const diff = agent.position.subtract(other.position);
        diff.normalize();
        diff.scaleInPlace(1 / distance); // Stronger when closer
        separation.addInPlace(diff);
        neighborCount++;
      }
    }

    if (neighborCount > 0) {
      separation.scaleInPlace(1 / neighborCount);
    }

    return separation;
  }

  /**
   * Damage an agent
   */
  damageAgent(id: string, amount: number): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;

    agent.health -= amount;
    agent.state = "stunned";

    // Knockback
    const knockback = agent.velocity.clone().normalize().scale(-5);
    agent.velocity.addInPlace(knockback);

    // Recover from stun after delay
    setTimeout(() => {
      const recoveredAgent = this.agents.get(id);
      if (recoveredAgent) {
        recoveredAgent.state = "pursuing";
      }
    }, 500);

    return agent.health <= 0;
  }

  /**
   * Get all agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get agents within range of a position
   */
  getAgentsInRange(position: Vector3, range: number): Agent[] {
    return this.getAgents().filter(
      (agent) => Vector3.Distance(agent.position, position) < range,
    );
  }

  /**
   * Spawn a random agent at edge of visible area
   */
  spawnRandomAgent(playerPosition: Vector3, spawnRadius: number): Agent | null {
    if (this.agents.size >= this.config.maxAgents) {
      return null;
    }

    // Spawn at random position around player
    const angle = GameRNG.range(0, Math.PI * 2);
    const distance = GameRNG.range(spawnRadius * 0.8, spawnRadius);

    const spawnPos = new Vector3(
      playerPosition.x + Math.cos(angle) * distance,
      1,
      playerPosition.z + Math.sin(angle) * distance + 10, // Ahead of player
    );

    const agent = this.addAgent(spawnPos, {
      speed: GameRNG.range(3, 6),
      health: GameRNG.rangeInt(2, 4),
    });

    agent.target = playerPosition.clone();
    agent.state = "pursuing";

    return agent;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    for (const agent of this.agents.values()) {
      agent.node.dispose();
    }
    this.agents.clear();
  }
}

/**
 * Enemy Types with different behaviors
 */
export enum EnemyType {
  Snowman = "snowman",
  PolarBear = "polar_bear",
  GlitchImp = "glitch_imp",
}

export interface EnemyConfig {
  type: EnemyType;
  speed: number;
  health: number;
  damage: number;
  radius: number;
  color: Color3;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.Snowman]: {
    type: EnemyType.Snowman,
    speed: 4,
    health: 3,
    damage: 10,
    radius: 1,
    color: new Color3(1, 1, 1),
  },
  [EnemyType.PolarBear]: {
    type: EnemyType.PolarBear,
    speed: 6,
    health: 5,
    damage: 20,
    radius: 1.5,
    color: new Color3(0.95, 0.95, 0.9),
  },
  [EnemyType.GlitchImp]: {
    type: EnemyType.GlitchImp,
    speed: 8,
    health: 1,
    damage: 5,
    radius: 0.6,
    color: new Color3(0.8, 0.2, 0.9),
  },
};

/**
 * Create enemy mesh based on type
 */
export function createEnemyMesh(
  scene: Scene,
  type: EnemyType,
  id: string,
): Mesh {
  const config = ENEMY_CONFIGS[type];
  let mesh: Mesh;

  switch (type) {
    case EnemyType.Snowman: {
      // Stack of spheres
      mesh = MeshBuilder.CreateSphere(
        id,
        { diameter: config.radius * 2, segments: 12 },
        scene,
      );
      const head = MeshBuilder.CreateSphere(
        `${id}_head`,
        { diameter: config.radius * 1.2 },
        scene,
      );
      head.position.y = config.radius * 1.5;
      head.parent = mesh;
      break;
    }

    case EnemyType.PolarBear:
      // Elongated sphere
      mesh = MeshBuilder.CreateSphere(
        id,
        { diameter: config.radius * 2, segments: 12 },
        scene,
      );
      mesh.scaling = new Vector3(1.3, 0.8, 1.5);
      break;

    case EnemyType.GlitchImp:
      // Icosahedron for glitchy look
      mesh = MeshBuilder.CreateIcoSphere(
        id,
        { radius: config.radius, subdivisions: 2 },
        scene,
      );
      break;

    default:
      mesh = MeshBuilder.CreateSphere(id, { diameter: 1 }, scene);
  }

  const material = new StandardMaterial(`${id}_mat`, scene);
  material.diffuseColor = config.color;
  material.emissiveColor = config.color.scale(0.2);
  mesh.material = material;

  return mesh;
}
