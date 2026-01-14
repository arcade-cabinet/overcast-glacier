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
*   **Audio:** Web Audio API (Procedural Synthesis).
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
*   **Biomes:** Deterministic noise-based generation using `GAME_CONFIG`.

### 4. Audio Engine
*   **ProceduralAudio:** Singleton managing `AudioContext`.
*   **Atmosphere:** Synthesized Wind (Pink Noise + LFO) and Ice Crackles.
*   **SFX:** Oscillators and envelopes for UI/Gameplay feedback.
*   **Music:** Generative Minor Pentatonic sequencer.

### 5. CI/CD
*   **GitHub Actions:**
    *   `ci.yml`: Lint, Test (Unit + E2E), Build.
    *   `deploy.yml`: Deploy to GitHub Pages + Build Android Debug APK.