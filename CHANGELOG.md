# Changelog

All notable changes to ["Overcast: Glaciers!"](https://github.com/arcade-cabinet/overcast-glacier) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-13

### Added

- **Mobile-First Architecture:** Migrated to Capacitor + Vite for native Android/iOS support.
- **Procedural Audio:** Replaced all static assets with Web Audio API synthesis (Wind, Snow, Music, SFX).
- **Advanced AI:** Implemented Yuka.js steering behaviors and Finite State Machines for enemies.
- **Boss Battle:** Added the "Snow Emperor," a 4-phase boss fight with dynamic environmental hazards.
- **Input System:** Tilt-to-steer (Motion API) and touch gestures for mobile gameplay.
- **Production CI/CD:** Automated pipelines for Linting, Testing (Vitest/Playwright), and Android APK building.
- **Documentation:** Comprehensive Vision, Branding, and Architecture docs.

### Changed

- **Tech Stack:** Removed Astro in favor of a pure React SPA for better Capacitor compatibility.
- **RNG:** Replaced `Math.random()` with a seeded Mulberry32 PRNG for deterministic gameplay.
- **UI:** Overhauled HUD and Menus for responsive design and touch targets.

### Fixed

- **Determinism:** Fixed non-deterministic enemy spawning and behavior.
- **Testing:** Resolved blank screenshots in E2E tests by enabling `preserveDrawingBuffer`.
