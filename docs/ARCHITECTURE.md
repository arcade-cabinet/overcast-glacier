# Architecture & Tech Stack

## Overview
**Overcast: Glaciers!** is a hybrid mobile game built with web technologies, wrapped in Capacitor for native deployment.

## Stack
*   **Runtime:** Capacitor (Android/iOS/Web).
*   **Framework:** React 19 (SPA Mode).
*   **Build Tool:** Vite.
*   **3D Engine:** React Three Fiber (Three.js).
*   **State Management:** Zustand.
*   **ECS (Entity Component System):** Miniplex.
*   **AI:** Yuka (Steering behaviors, Finite State Machines).
*   **Styling:** Tailwind CSS (v4).
*   **Testing:** Vitest (Unit), Playwright (E2E).

## Key Systems
### 1. ECS (Miniplex)
*   **Entities:** Player, Enemies, Collectibles, Projectiles.
*   **Components:** `position`, `velocity`, `gravity`, `tag`, `radius`, `enemyType`.
*   **Systems:**
    *   `PhysicsSystem`: Handles gravity and velocity integration (Y-axis).
    *   `AISystem`: Bridges Miniplex <-> Yuka. Syncs ECS positions to Yuka vehicles, steps Yuka simulation, applies Yuka velocity to ECS.
    *   `CollisionSystem`: Handles overlaps (Player vs Enemy, Projectile vs Enemy).

### 2. Input Handling
*   **Touch:** Mapped to Jump (Left tap) and Shoot (Right tap).
*   **Motion:** Capacitor Motion API maps device Gamma (tilt) to lateral velocity.

### 3. Procedural Generation
*   **Terrain:** Generated in moving chunks relative to player Z-position.
*   **Biomes:** Determined by Perlin noise or deterministic math functions based on Z-depth.

### 4. Game Loop
*   Driven by R3F `useFrame`.
*   Fixed time-step logic where possible (AI/Physics).
