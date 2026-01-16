---
inclusion: always
---

# Mobile-First Development

## Overview

Overcast: Glaciers! is designed mobile-first with Capacitor for native deployment.

## Target Platforms

1. **Web** (primary) - GitHub Pages deployment
2. **Android** - Capacitor APK
3. **iOS** - Capacitor (future)

## Screen Orientation

**Vertical (Portrait) only**

```typescript
// Capacitor config locks orientation
// capacitor.config.ts
{
  plugins: {
    ScreenOrientation: {
      // Lock to portrait
    }
  }
}
```

Test in browser DevTools mobile view (iPhone/Pixel portrait).

## Touch Controls

Left/Right screen halves mapped to actions:

```typescript
function handleTouchStart(e: TouchEvent) {
  const x = e.touches[0].clientX;
  const screenMid = window.innerWidth / 2;

  if (x < screenMid) {
    // Left half - Jump
    jump();
  } else {
    // Right half - Shoot/Kick
    shoot();
  }
}
```

## Motion Controls (Tilt Steering)

Capacitor Motion API provides device orientation:

```typescript
import { Motion } from "@capacitor/motion";

Motion.addListener("orientation", (event) => {
  // event.gamma: Left/right tilt (-90 to 90)
  // Map gamma to lateral velocity
  const tilt = event.gamma / 45; // Normalize to -2 to 2
  player.velocity.x = tilt * LATERAL_SPEED;
});
```

### Fallback for Web

Without device motion, use keyboard arrows or pointer position.

## Haptic Feedback

```typescript
import { Haptics, ImpactStyle } from "@capacitor/haptics";

// On enemy hit
await Haptics.impact({ style: ImpactStyle.Medium });

// On power-up collect
await Haptics.impact({ style: ImpactStyle.Light });
```

## Performance Considerations

### Mobile GPU Limits

- Keep draw calls low (< 100)
- Use instanced meshes for repeated objects (snow, enemies)
- Limit post-processing effects
- Target 60 FPS (monitor with `useFrame` delta)

### Memory

- Despawn entities behind player
- Pool frequently created objects (projectiles)
- Avoid allocations in render loop

### Battery

- Reduce particle counts on mobile
- Consider lower simulation fidelity when backgrounded

## UI Guidelines

### Touch Targets

- Minimum 44x44 CSS pixels
- Generous padding on interactive elements
- No hover-dependent interactions

### Safe Areas

Account for notches and system UI:

```css
.hud {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Text Legibility

- Minimum 16px font size
- High contrast (see BRANDING.md colors)
- Use `Orbitron` for headings, `VT323` for HUD text

## Testing Checklist

- [ ] Test on actual mobile device (not just emulator)
- [ ] Verify touch controls respond correctly
- [ ] Test tilt steering with device motion
- [ ] Check haptic feedback fires
- [ ] Verify performance at 60 FPS
- [ ] Test in bright sunlight conditions (contrast)
- [ ] Test with system font size scaled up
