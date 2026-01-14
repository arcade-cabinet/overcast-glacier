# Game Design Document

## Core Loop
1.  **Ski:** Infinite downhill procedural generation. Tilt to steer.
2.  **Fight:** Kung-fu combo enemies or throw snowballs.
3.  **Survive:** Maintain warmth (fires/cocoa) and avoid "Frost Curse".
4.  **Capture:** Take photos of glitches/enemies to gain power-ups.

## Enemies
*   **Snowman:** Basic grunt. Throws arms. Vulnerable to melee.
*   **Polar Bear:** Tank. Charges player. Needs to be dodged or heavy-hit.
*   **Glitch Imp:** Flying pest. Moves erratically (Patrol state). Hard to hit.
*   **Boss:** **The Snow Emperor**.
    *   *Phase 1:* Avalanche attacks.
    *   *Phase 2:* Morphs into giant snowman.
    *   *Phase 3:* Matrix code rain.
    *   *Phase 4:* Shattered Core (Frenzy).

## Mechanics
*   **Motion Steering:** Tilt device to move Left/Right.
*   **Touch Controls:** Tap Left (Jump), Tap Right (Fire/Kick).
*   **Photography:** Auto-snap or dedicated button to capture specific "moments" for score/power-ups.
*   **Warmth:** Decreases over time/blizzard. Restored by Cocoa/Fire.
*   **Frost Curse:** Taking damage from Snowmen can morph player into a Snowman (tanky, slow, no jump). Cured by Cocoa.

## Procedural Generation
*   **Chunks:** Terrain is generated in linear chunks (Slope, Cave, Rink, Plateau).
*   **Biomes:** Affect texture, enemy types, and obstacle density.
*   **Spawning:** Yuka-driven AI spawns ahead of player. Logic handles "Waves" and "Ambushes".
