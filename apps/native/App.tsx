import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import type React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useGameStore } from "./src/stores/useGameStore";

// import { GameScene } from "./src/scenes/GameScene";

// Temporarily use a placeholder until Babylon.js is fully integrated
const GameScenePlaceholder: React.FC = () => (
  <View style={styles.scenePlaceholder}>
    <Text style={styles.placeholderText}>Babylon.js Scene Loading...</Text>
  </View>
);

const MainMenu: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const highScore = useGameStore((state) => state.highScore);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGameState("playing");
  };

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>OVERCAST:</Text>
      <Text style={styles.subtitle}>GLACIERS!</Text>

      <Text style={styles.tagline}>A kung-fu kitten vs. the digital frost</Text>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>ENTER SIMULATION</Text>
      </TouchableOpacity>

      {highScore > 0 && (
        <Text style={styles.highScore}>HIGH SCORE: {highScore}</Text>
      )}

      <Text style={styles.version}>v2.0.0-alpha (React Native)</Text>
    </View>
  );
};

const GameHUD: React.FC = () => {
  const score = useGameStore((state) => state.score);
  const warmth = useGameStore((state) => state.warmth);
  const playerForm = useGameStore((state) => state.playerForm);
  const setGameState = useGameStore((state) => state.setGameState);

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGameState("paused");
  };

  return (
    <View style={styles.hudContainer}>
      <View style={styles.hudTop}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{Math.floor(score)}</Text>
        </View>

        <TouchableOpacity onPress={handlePause} style={styles.pauseButton}>
          <Text style={styles.pauseButtonText}>⏸</Text>
        </TouchableOpacity>

        <View style={styles.warmthContainer}>
          <Text style={styles.warmthLabel}>WARMTH</Text>
          <View style={styles.warmthBar}>
            <View style={[styles.warmthFill, { width: `${warmth}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.hudBottom}>
        <Text style={styles.formIndicator}>
          {playerForm === "kitten" ? "🐱" : "⛄"}
        </Text>
      </View>
    </View>
  );
};

const PauseMenu: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <View style={styles.pauseOverlay}>
      <View style={styles.pauseMenu}>
        <Text style={styles.pauseTitle}>PAUSED</Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setGameState("playing")}
        >
          <Text style={styles.menuButtonText}>RESUME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            resetGame();
          }}
        >
          <Text style={styles.menuButtonText}>QUIT TO MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GameOverScreen: React.FC = () => {
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const resetGame = useGameStore((state) => state.resetGame);

  const isNewHighScore = score >= highScore && score > 0;

  return (
    <View style={styles.gameOverOverlay}>
      <Text style={styles.gameOverTitle}>SIMULATION ENDED</Text>

      {isNewHighScore && (
        <Text style={styles.newHighScore}>NEW HIGH SCORE!</Text>
      )}

      <Text style={styles.finalScore}>SCORE: {Math.floor(score)}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
        <Text style={styles.retryButtonText}>TRY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Game Scene - always rendered */}
      <GameScenePlaceholder />

      {/* UI Overlays based on game state */}
      {(gameState === "initial" || gameState === "menu") && <MainMenu />}
      {gameState === "playing" && <GameHUD />}
      {gameState === "paused" && <PauseMenu />}
      {gameState === "gameover" && <GameOverScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  // Scene placeholder
  scenePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#7DD3FC",
    fontSize: 18,
    fontWeight: "600",
  },

  // Menu styles
  menuContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#7DD3FC",
    letterSpacing: 2,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 14,
    color: "#7DD3FC",
    opacity: 0.8,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: "#7DD3FC",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 2,
  },
  highScore: {
    fontSize: 16,
    color: "#F8FAFC",
    opacity: 0.6,
    marginTop: 20,
  },
  version: {
    position: "absolute",
    bottom: 40,
    fontSize: 12,
    color: "#7DD3FC",
    opacity: 0.5,
  },

  // HUD styles
  hudContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
    pointerEvents: "box-none",
  },
  hudTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scoreContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.3)",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#7DD3FC",
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  pauseButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.3)",
  },
  pauseButtonText: {
    fontSize: 20,
    color: "#F8FAFC",
  },
  warmthContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.3)",
    width: 120,
  },
  warmthLabel: {
    fontSize: 10,
    color: "#7DD3FC",
    letterSpacing: 1,
    marginBottom: 4,
  },
  warmthBar: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    overflow: "hidden",
  },
  warmthFill: {
    height: "100%",
    backgroundColor: "#EF4444",
    borderRadius: 4,
  },
  hudBottom: {
    alignItems: "center",
  },
  formIndicator: {
    fontSize: 32,
  },

  // Pause menu styles
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseMenu: {
    alignItems: "center",
  },
  pauseTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: 4,
    marginBottom: 40,
  },
  menuButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#7DD3FC",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
    alignItems: "center",
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7DD3FC",
    letterSpacing: 1,
  },

  // Game over styles
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: 2,
    marginBottom: 20,
  },
  newHighScore: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: "#7DD3FC",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 2,
  },
});
