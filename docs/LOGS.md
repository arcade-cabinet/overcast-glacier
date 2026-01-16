# Project Logs

## Evolution

*   **Phase 1:** Concept (Grok). Winter themed Matrix game.
*   **Phase 2:** Prototype (Astro + R3F). Basic infinite runner.
*   **Phase 3:** Production Web (Capacitor + Vite). Web-focused hybrid app.
    *   Removed Astro (simplify build pipeline).
    *   Added Capacitor Motion/Haptics.
    *   Implemented Yuka AI.
    *   Added End-to-End testing (Playwright).
    *   **DEPRECATED:** Capacitor approach found non-viable for App Store.
*   **Phase 4:** v1.0.0 Native Migration (2026-01-16).
    *   **PIVOT:** Abandoned Capacitor for true native React Native.
    *   React Native + Expo 54 + Babylon.js React Native foundation.
    *   Ported deterministic RNG system (Mulberry32).
    *   Ported Zustand state management with AsyncStorage persistence.
    *   Ported terrain generation with infinite chunks.
    *   Full UI flow: menu, HUD, pause, game over screens.
    *   EAS Build configuration for iOS/Android.

## Current Status (v1.0.0)

*   **Version:** 1.0.0 (React Native Foundation)
*   **Architecture:** React Native + Expo + Babylon.js React Native
*   **State Management:** Zustand with AsyncStorage persistence
*   **RNG:** Deterministic seeded Mulberry32 (ported from web)
*   **Build System:** EAS Build for iOS/Android
*   **Web Version:** Legacy at `apps/web/` (Capacitor - deprecated)
*   **Native Version:** Active at `apps/native/`

## Architecture

```
apps/
├── native/          # v1.0+ React Native + Babylon.js (ACTIVE)
│   ├── src/
│   │   ├── lib/rng.ts              # Deterministic PRNG
│   │   ├── stores/useGameStore.ts  # Zustand state
│   │   └── scenes/GameScene.tsx    # Babylon.js terrain
│   ├── App.tsx                     # Full UI (menu, HUD, etc.)
│   ├── app.json                    # Expo config
│   └── eas.json                    # EAS Build config
│
└── web/             # Legacy Capacitor version (DEPRECATED)
    └── ...          # Do not develop further
```

## Migration Status

| System | Web (Legacy) | Native (1.0) | Notes |
|--------|-------------|--------------|-------|
| Rendering | Three.js/R3F | Babylon.js React Native | Native GPU |
| State | Zustand | Zustand + AsyncStorage | Ported |
| RNG | Mulberry32 | Mulberry32 | Identical |
| Terrain | Chunk-based | Chunk-based | Ported |
| AI | Yuka | Not ported | TODO |
| ECS | Miniplex | Not ported | TODO |
| Audio | Web Audio | expo-av | TODO |
| Input | Touch/Tilt | expo-sensors | TODO |
| Haptics | Capacitor | expo-haptics | Integrated |

## Next Steps

1. Port touch input controls from expo-sensors
2. Port collision detection system
3. Port enemy spawning and AI (Yuka patterns)
4. Port audio system with expo-av
5. Create EAS builds for TestFlight/Play Store
6. Submit to App Stores

## Why React Native Over Capacitor

The Capacitor approach was evaluated and rejected for 1.0:

| Factor | Capacitor | React Native |
|--------|-----------|--------------|
| Rendering | WebGL in WebView | Native OpenGL/Metal |
| Performance | 60 FPS ceiling, memory overhead | Native performance |
| App Store | High rejection risk (WebView wrapper) | Native compliant |
| Native Feel | Web-like latency | True native response |
| Battery | WebGL + audio synthesis = power hungry | Optimized |

**Decision:** True native via React Native + Babylon.js is the only viable path for production App Store releases.
