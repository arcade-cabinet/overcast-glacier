# Overcast: Glaciers! - 1.0 Release

**Date:** 2026-01-16
**Status:** React Native Foundation Released
**Branch:** `main`

---

## Executive Summary

v1.0 establishes the **React Native + Babylon.js** foundation for true native mobile deployment. The previous Capacitor-based web version has been **deprecated** after evaluation found it non-viable for App Store releases.

---

## v1.0.0 Scope: React Native Foundation

### What's Included

| Component | Status | Description |
|-----------|--------|-------------|
| **React Native Project** | Complete | Expo 54 + React Native 0.81.5 |
| **Babylon.js Integration** | Complete | @babylonjs/react-native for native 3D |
| **State Management** | Complete | Zustand with AsyncStorage persistence |
| **Deterministic RNG** | Complete | Mulberry32 ported identically from web |
| **Terrain Generation** | Complete | Infinite chunk-based procedural terrain |
| **Game UI** | Complete | Menu, HUD, Pause, Game Over screens |
| **EAS Build Config** | Complete | dev/preview/production profiles |
| **TypeScript** | Complete | Strict mode, all types passing |

### Architecture

```
apps/native/
├── App.tsx                     # Root component with all UI screens
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build profiles
├── index.ts                    # Entry point
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── assets/                     # Icons and splash
└── src/
    ├── lib/
    │   └── rng.ts              # Mulberry32 PRNG (GameRNG, TerrainRNG, AudioRNG)
    ├── scenes/
    │   └── GameScene.tsx       # Babylon.js terrain with infinite chunks
    └── stores/
        └── useGameStore.ts     # Zustand store with full game state
```

### Dependencies

```json
{
  "@babylonjs/core": "^8.46.2",
  "@babylonjs/react-native": "^1.9.0",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "expo": "~54.0.31",
  "expo-av": "^16.0.8",
  "expo-haptics": "^15.0.8",
  "expo-sensors": "^15.0.8",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "zustand": "^5.0.10"
}
```

---

## What's NOT in 1.0 (Porting Backlog)

| System | Priority | Notes |
|--------|----------|-------|
| Touch Input | High | Port using expo-sensors |
| Collision Detection | High | Port from web ECS |
| Enemy AI | High | Port Yuka FSM patterns |
| Enemy Types | High | Snowman, Polar Bear, Glitch Imp |
| Boss Fight | Medium | Snow Emperor 4-phase |
| Audio System | Medium | Replace Web Audio with expo-av |
| Photography | Low | Camera mechanic |
| Film/Matches | Low | Collectibles |

---

## Deprecated: Web/Capacitor Version

The `apps/web/` directory contains the legacy Capacitor version. **DO NOT develop further.**

### Why Capacitor Was Rejected

| Issue | Impact |
|-------|--------|
| WebGL in WebView | Performance ceiling, memory overhead |
| App Store Compliance | High rejection risk for WebView wrappers |
| Native Feel | Web-like latency, not true native |
| Battery Impact | WebGL + Web Audio synthesis is power-hungry |
| Bundle Size | 1.3MB JS bundle |

**Verdict:** Capacitor is viable for web deployment only. Not viable for production App Store releases.

---

## v1.1 Roadmap: Core Gameplay Port

### Priority 1: Input & Movement
- [ ] Port touch input using expo-sensors
- [ ] Port tilt controls using Accelerometer
- [ ] Implement haptic feedback with expo-haptics

### Priority 2: Collision & Combat
- [ ] Port collision detection system
- [ ] Port player-enemy interactions
- [ ] Port warmth/frost mechanics

### Priority 3: Enemies
- [ ] Port Yuka AI steering behaviors
- [ ] Implement 3 enemy types
- [ ] Port spawn system

### Priority 4: Audio
- [ ] Implement procedural audio with expo-av
- [ ] Port wind and ambient sounds
- [ ] Port music generation

---

## v1.2 Roadmap: Boss & Polish

- [ ] Port Snow Emperor boss fight
- [ ] Port photography mechanic
- [ ] Port collectible system
- [ ] Performance optimization pass
- [ ] UI polish and animations

---

## v2.0 Roadmap: App Store Release

- [ ] EAS Build for TestFlight
- [ ] EAS Build for Play Store Internal Track
- [ ] App Store metadata and screenshots
- [ ] Beta testing program
- [ ] Production submission

---

## Reference Projects

### wheres-ball-though (React Native Architecture)
- Path: `/Users/jbogaty/src/arcade-cabinet/wheres-ball-though`
- Stack: Expo + React Native + Skia
- Relevance: Project structure, EAS config, testing patterns

### neo-tokyo-rival-academies (Babylon.js Patterns)
- Path: `/Users/jbogaty/src/arcade-cabinet/neo-tokyo-rival-academies`
- Reference: `Grok-BabylonJS_Isometric_Diorama_Creation.md`
- Relevance: Babylon.js patterns, isometric rendering, mobile optimization

---

## Commands

```bash
# Install dependencies
cd apps/native && npm install

# Start Expo dev server
npx expo start

# Type check
npx tsc --noEmit

# Build for iOS (requires EAS CLI)
eas build --platform ios --profile development

# Build for Android
eas build --platform android --profile development
```
