import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/useGameStore';
import { world } from './world';
import * as THREE from 'three';
import { getHeightAt, getBiomeAt } from '../lib/procedural';

// --- PHYSICS SYSTEM ---
export const PhysicsSystem = () => {
    useFrame((state, delta) => {
        const dt = Math.min(delta, 0.1);

        // Query entities with position and velocity
        const movingEntities = world.with('position', 'velocity');

        for (const entity of movingEntities) {
            // Apply Gravity
            if (entity.gravity) {
                const biome = getBiomeAt(entity.position.z);
                const terrainHeight = getHeightAt(entity.position.x, entity.position.z, biome);

                if (entity.position.y > terrainHeight) {
                    entity.velocity.y -= 30 * dt;
                } else if (entity.velocity.y < 0) {
                     // Ground collision
                     entity.velocity.y = 0;
                     entity.position.y = terrainHeight;
                }
            }

            // Move
            entity.position.addScaledVector(entity.velocity, dt);

            // Cleanup Projectiles
            if (entity.tag === 'projectile' && entity.position.y < -50) {
                world.remove(entity);
            }
        }
    });
    return null;
};

// --- COLLISION SYSTEM ---
export const CollisionSystem = () => {
    const decreaseWarmth = useGameStore(state => state.decreaseWarmth);
    const increaseWarmth = useGameStore(state => state.increaseWarmth);
    const addScore = useGameStore(state => state.addScore);
    const setPlayerForm = useGameStore(state => state.setPlayerForm);
    const playerForm = useGameStore(state => state.playerForm);

    useFrame(() => {
        const player = world.with('tag', 'position', 'radius').where(e => e.tag === 'player').first;
        if (!player) return;

        // Player vs Enemies
        const enemies = world.with('tag', 'position', 'radius').where(e => e.tag === 'enemy');
        for (const enemy of enemies) {
            if (player.position.distanceTo(enemy.position) < (player.radius! + enemy.radius!)) {
                // Collision!
                if (playerForm === 'snowman') {
                    // Crush enemy
                    world.remove(enemy);
                    addScore(200);
                } else {
                    // Hit player
                    decreaseWarmth(15);
                    world.remove(enemy); // Enemy dies on impact
                    if (enemy.enemyType === 'snowman' && Math.random() > 0.5) {
                        setPlayerForm('snowman');
                    }
                }
            }
        }

        // Player vs Collectibles
        const collectibles = world.with('tag', 'position', 'radius').where(e => e.tag === 'collectible');
        for (const item of collectibles) {
             if (player.position.distanceTo(item.position) < (player.radius! + item.radius!)) {
                 if (item.collectibleType === 'cocoa') {
                     increaseWarmth(30);
                     if (playerForm === 'snowman') {
                         setPlayerForm('kitten');
                         addScore(500);
                     }
                 }
                 world.remove(item);
                 addScore(50);
             }
        }

        // Projectiles vs Enemies
        const projectiles = world.with('tag', 'position', 'radius').where(e => e.tag === 'projectile');
        for (const p of projectiles) {
            for (const e of enemies) {
                if (p.position.distanceTo(e.position) < (p.radius! + e.radius!)) {
                    world.remove(e);
                    world.remove(p);
                    addScore(100);
                    break;
                }
            }
        }
    });
    return null;
};
