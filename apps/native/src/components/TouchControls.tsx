/**
 * Touch and Tilt Input Controls
 * Handles player input via touch gestures and device tilt
 */

import * as Haptics from "expo-haptics";
import { Accelerometer, type AccelerometerMeasurement } from "expo-sensors";
import { useCallback, useEffect, useRef } from "react";
import {
  type GestureResponderEvent,
  PanResponder,
  type PanResponderGestureState,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useGameStore } from "../stores/useGameStore";

// Input configuration
const INPUT_CONFIG = {
  // Tilt sensitivity (lower = more sensitive)
  tiltSensitivity: 0.15,
  // Tilt deadzone (ignore small movements)
  tiltDeadzone: 0.05,
  // Maximum tilt angle considered (radians)
  maxTiltAngle: 0.4,
  // Swipe threshold for jump/kick
  swipeThreshold: 50,
  // Swipe velocity threshold
  swipeVelocityThreshold: 0.3,
  // Double tap threshold (ms)
  doubleTapThreshold: 300,
  // Haptic feedback intensity
  hapticEnabled: true,
};

export interface InputState {
  // Horizontal movement (-1 to 1)
  horizontal: number;
  // Vertical movement (-1 to 1, for speed control)
  vertical: number;
  // Jump triggered this frame
  jump: boolean;
  // Kick/attack triggered this frame
  kick: boolean;
  // Brake/slow down
  brake: boolean;
}

interface TouchControlsProps {
  onInput?: (input: InputState) => void;
  disabled?: boolean;
}

/**
 * Touch Controls Component
 * Provides touch and tilt input for game control
 */
export function TouchControls({
  onInput,
  disabled = false,
}: TouchControlsProps) {
  const inputRef = useRef<InputState>({
    horizontal: 0,
    vertical: 0,
    jump: false,
    kick: false,
    brake: false,
  });

  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const accelerometerSubscription = useRef<ReturnType<
    typeof Accelerometer.addListener
  > | null>(null);

  const { gameState, resumeGame, resetGame } = useGameStore();

  /**
   * Handle accelerometer data for tilt controls
   */
  const handleAccelerometer = useCallback(
    (data: AccelerometerMeasurement) => {
      if (disabled || gameState !== "playing") return;

      // x is left/right tilt, y is forward/backward
      const { x } = data;

      // Apply deadzone
      let horizontal = 0;
      if (Math.abs(x) > INPUT_CONFIG.tiltDeadzone) {
        // Normalize and clamp
        horizontal = Math.max(
          -1,
          Math.min(
            1,
            (x - Math.sign(x) * INPUT_CONFIG.tiltDeadzone) /
              INPUT_CONFIG.tiltSensitivity,
          ),
        );
      }

      inputRef.current.horizontal = -horizontal; // Invert for natural feel

      onInput?.(inputRef.current);
    },
    [disabled, gameState, onInput],
  );

  /**
   * Set up accelerometer listener
   */
  useEffect(() => {
    // Set update interval (60 FPS)
    Accelerometer.setUpdateInterval(16);

    accelerometerSubscription.current =
      Accelerometer.addListener(handleAccelerometer);

    return () => {
      accelerometerSubscription.current?.remove();
    };
  }, [handleAccelerometer]);

  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if (!INPUT_CONFIG.hapticEnabled) return;

      switch (type) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    },
    [],
  );

  /**
   * Handle tap for game state transitions
   */
  const handleTap = useCallback(() => {
    if (gameState === "paused") {
      resumeGame();
      triggerHaptic("light");
    } else if (gameState === "gameover") {
      resetGame();
      triggerHaptic("medium");
    }
  }, [gameState, resumeGame, resetGame, triggerHaptic]);

  /**
   * Detect swipe gestures
   */
  const handleSwipe = useCallback(
    (dx: number, dy: number, vx: number, vy: number) => {
      if (disabled || gameState !== "playing") return;

      // Upward swipe = jump
      if (
        dy < -INPUT_CONFIG.swipeThreshold &&
        Math.abs(vy) > INPUT_CONFIG.swipeVelocityThreshold
      ) {
        inputRef.current.jump = true;
        triggerHaptic("medium");
        onInput?.(inputRef.current);

        // Reset jump flag after one frame
        setTimeout(() => {
          inputRef.current.jump = false;
        }, 50);
      }

      // Downward swipe = brake
      if (
        dy > INPUT_CONFIG.swipeThreshold &&
        Math.abs(vy) > INPUT_CONFIG.swipeVelocityThreshold
        // Reset jump flag after one frame
        /* setTimeout(() => {
          inputRef.current.jump = false;
        }, 50); */
        triggerHaptic("light");
        onInput?.(inputRef.current);

        setTimeout(() => {
          inputRef.current.brake = false;
        }, 50);
      }

      // Horizontal swipe = kick (in direction of swipe)
      if (
        Math.abs(dx) > INPUT_CONFIG.swipeThreshold &&
        Math.abs(vx) > INPUT_CONFIG.swipeVelocityThreshold
        /* setTimeout(() => {
          inputRef.current.brake = false;
        }, 50); */
        onInput?.(inputRef.current);

        setTimeout(() => {
          inputRef.current.kick = false;
        }, 50);
      }
    },
    [disabled, gameState, onInput, triggerHaptic],
  );

  /**
   * Handle double tap for special action
   */
  const handleDoubleTap = useCallback(() => {
    if (disabled || gameState !== "playing") return;

    // Double tap triggers kick/attack
        /* setTimeout(() => {
          inputRef.current.kick = false;
        }, 50); */
    setTimeout(() => {
      inputRef.current.kick = false;
    }, 50);
  }, [disabled, gameState, onInput, triggerHaptic]);

  /**
   * Pan responder for touch gestures
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        touchStartRef.current = { x: locationX, y: locationY };

        // Check for double tap
        const now = Date.now();
        if (now - lastTapRef.current < INPUT_CONFIG.doubleTapThreshold) {
          handleDoubleTap();
        }
        lastTapRef.current = now;
      },

      onPanResponderMove: (
        _event: GestureResponderEvent,
        _gestureState: PanResponderGestureState,
      ) => {
        // Track movement for potential swipe
      },

      onPanResponderRelease: (
        _event: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx, dy, vx, vy } = gestureState;

        // Check if this was a swipe
        if (
          Math.abs(dx) > INPUT_CONFIG.swipeThreshold ||
          Math.abs(dy) > INPUT_CONFIG.swipeThreshold
        ) {
          handleSwipe(dx, dy, vx, vy);
        } else {
          // Simple tap
          handleTap();
        }

        touchStartRef.current = null;
      },
    }),
  ).current;

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
      pointerEvents={disabled ? "none" : "auto"}
    >
      {/* Visual touch indicators (optional, for debugging) */}
      {__DEV__ && (
        <View style={styles.debugOverlay}>
          <View style={styles.leftZone} />
          <View style={styles.centerZone} />
          <View style={styles.rightZone} />
        </View>
      )}
    </View>
  );
}

/**
 * Virtual joystick component (alternative input method)
 */
export function VirtualJoystick({
  onMove,
  size = 120,
}: {
  onMove: (x: number, y: number) => void;
  size?: number;
}) {
  const knobRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (
        _event: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const maxDistance = size / 2 - 20;
        let { dx, dy } = gestureState;

        // Clamp to circle
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) {
          dx = (dx / distance) * maxDistance;
          dy = (dy / distance) * maxDistance;
        }

        knobRef.current = { x: dx, y: dy };

        // Normalize to -1 to 1
        const normalX = dx / maxDistance;
        const normalY = dy / maxDistance;
        onMove(normalX, normalY);
      },

      onPanResponderRelease: () => {
        knobRef.current = { x: 0, y: 0 };
        onMove(0, 0);
      },
    }),
  ).current;

  return (
    <View
      style={[
        styles.joystickBase,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.joystickKnob,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            transform: [
              { translateX: knobRef.current.x },
              { translateY: knobRef.current.y },
            ],
          },
        ]}
      />
    </View>
  );
}

/**
 * Action button component
 */
export function ActionButton({
  onPress,
  label,
  color = "#FF8C42",
  size = 60,
}: {
  onPress: () => void;
  label: string;
  color?: string;
  size?: number;
}) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <View
      style={[
        styles.actionButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
      onTouchEnd={handlePress}
    >
      <View style={styles.actionButtonInner}>
        <View style={styles.actionButtonLabel}>
          <Text style={styles.actionButtonText}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },

  // Debug overlay
  debugOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    opacity: 0.1,
  },
  leftZone: {
    flex: 1,
    backgroundColor: "#FF0000",
  },
  centerZone: {
    flex: 2,
    backgroundColor: "#00FF00",
  },
  rightZone: {
    flex: 1,
    backgroundColor: "#0000FF",
  },

  // Virtual joystick
  joystickBase: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  joystickKnob: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Action button
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonInner: {
    width: "80%",
    height: "80%",
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonLabel: {
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default TouchControls;
