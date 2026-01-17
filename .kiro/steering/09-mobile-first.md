---
inclusion: always
---

# Mobile-First Development

## Overview

Overcast: Glaciers! is designed mobile-first with React Native + Expo for true native deployment.

## Target Platforms

1. **iOS** - EAS Build for App Store / TestFlight
2. **Android** - EAS Build for Play Store
3. **Web** - DEPRECATED (legacy Capacitor version)

## Screen Orientation

**Vertical (Portrait) only**

```json
// app.json
{
  "expo": {
    "orientation": "portrait"
  }
}
```

Test on actual devices or Expo Go for accurate behavior.

## Touch Controls

Left/Right screen halves mapped to actions in React Native:

```typescript
import { TouchableOpacity, View } from "react-native";

function TouchControls({ onJump, onShoot }) {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        style={styles.leftHalf}
        onPress={onJump}
      />
      <TouchableOpacity
        style={styles.rightHalf}
        onPress={onShoot}
      />
    </View>
  );
}
```

## Motion Controls (Tilt Steering)

Expo Sensors API provides device orientation:

```typescript
import { Accelerometer } from "expo-sensors";

useEffect(() => {
  const subscription = Accelerometer.addListener(({ x, y, z }) => {
    // x: Left/right tilt (-1 to 1)
    // Map x to lateral velocity
    const tilt = x * 2; // Scale as needed
    player.velocity.x = tilt * LATERAL_SPEED;
  });

  Accelerometer.setUpdateInterval(16); // ~60fps

  return () => subscription.remove();
}, []);
```

## Haptic Feedback

```typescript
import * as Haptics from "expo-haptics";

// On enemy hit
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// On power-up collect
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// On menu button press
await Haptics.selectionAsync();
```

## Performance Considerations

### Native GPU via Babylon.js

- Babylon.js React Native renders directly to OpenGL/Metal
- No WebView overhead
- True native performance

### Mobile GPU Limits

- Keep draw calls low (< 100)
- Use instanced meshes for repeated objects (snow, enemies)
- Limit post-processing effects
- Target 60 FPS

### Memory

- Despawn entities behind player
- Pool frequently created objects (projectiles)
- Avoid allocations in render loop

### Battery

- Reduce particle counts on mobile
- Consider lower simulation fidelity when backgrounded

## UI Guidelines

### Touch Targets

- Minimum 44x44 points
- Generous padding on interactive elements
- No hover-dependent interactions

### Safe Areas

Account for notches and system UI:

```typescript
import { SafeAreaView } from "react-native";

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <GameScene />
      <GameHUD />
    </SafeAreaView>
  );
}
```

### Text Legibility

- Minimum 16px font size
- High contrast (see BRANDING.md colors)
- Use system fonts or custom fonts via expo-font

## EAS Build Commands

```bash
# Development build (includes dev client)
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build (internal distribution)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Testing Checklist

- [ ] Test on actual mobile device (not just simulator)
- [ ] Verify touch controls respond correctly
- [ ] Test tilt steering with expo-sensors
- [ ] Check haptic feedback fires
- [ ] Verify performance at 60 FPS
- [ ] Test in bright sunlight conditions (contrast)
- [ ] Test with system font size scaled up
- [ ] Test on older devices (iPhone 8, mid-tier Android)
