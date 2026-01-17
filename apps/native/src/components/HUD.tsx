import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useGameStore } from "../stores/useGameStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WarmthBarProps {
  warmth: number;
  maxWarmth: number;
}

/**
 * Animated warmth bar with gradient effect
 */
function WarmthBar({ warmth, maxWarmth }: WarmthBarProps) {
  const percentage = Math.max(0, Math.min(100, (warmth / maxWarmth) * 100));

  // Color transitions from blue (cold) to orange (warm)
  const getBarColor = () => {
    if (percentage > 60) return "#FF8C42"; // Warm orange
    if (percentage > 30) return "#FFD166"; // Yellow
    if (percentage > 15) return "#06D6A0"; // Cyan
    return "#118AB2"; // Cold blue
  };

  return (
    <View style={styles.warmthContainer}>
      <Text style={styles.warmthLabel}>WARMTH</Text>
      <View style={styles.warmthBarBg}>
        <View
          style={[
            styles.warmthBarFill,
            {
              width: `${percentage}%`,
              backgroundColor: getBarColor(),
            },
          ]}
        />
        {/* Segment markers */}
        <View style={[styles.segmentMarker, { left: "25%" }]} />
        <View style={[styles.segmentMarker, { left: "50%" }]} />
        <View style={[styles.segmentMarker, { left: "75%" }]} />
      </View>
      <Text style={styles.warmthValue}>{Math.round(warmth)}</Text>
    </View>
  );
}

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

/**
 * Score display with high score indicator
 */
function ScoreDisplay({ score, highScore }: ScoreDisplayProps) {
  const isNewHighScore = score > 0 && score >= highScore;

  return (
    <View style={styles.scoreContainer}>
      <Text style={styles.scoreLabel}>SCORE</Text>
      <Text style={[styles.scoreValue, isNewHighScore && styles.newHighScore]}>
        {score.toLocaleString()}
      </Text>
      {isNewHighScore && <Text style={styles.highScoreIndicator}>NEW!</Text>}
    </View>
  );
}

interface ComboDisplayProps {
  combo: number;
  comboMultiplier: number;
}

/**
 * Combo counter with multiplier
 */
function ComboDisplay({ combo, comboMultiplier }: ComboDisplayProps) {
  if (combo < 2) return null;

  return (
    <View style={styles.comboContainer}>
      <Text style={styles.comboCount}>{combo}</Text>
      <Text style={styles.comboLabel}>COMBO</Text>
      <Text style={styles.comboMultiplier}>x{comboMultiplier.toFixed(1)}</Text>
    </View>
  );
}

interface BiomeIndicatorProps {
  biome: string;
}

/**
 * Current biome indicator
 */
function BiomeIndicator({ biome }: BiomeIndicatorProps) {
  const biomeNames: Record<string, string> = {
    open_slope: "OPEN SLOPE",
    ice_cave: "ICE CAVE",
    frozen_rink: "FROZEN RINK",
    cocoa_valley: "COCOA VALLEY",
    summit: "SUMMIT",
  };

  const biomeColors: Record<string, string> = {
    open_slope: "#F8F9FA",
    ice_cave: "#7DD3FC",
    frozen_rink: "#BAE6FD",
    cocoa_valley: "#8B4513",
    summit: "#9CA3AF",
  };

  return (
    <View
      style={[
        styles.biomeContainer,
        { borderColor: biomeColors[biome] || "#FFFFFF" },
      ]}
    >
      <Text style={styles.biomeLabel}>
        {biomeNames[biome] || biome.toUpperCase()}
      </Text>
    </View>
  );
}

interface SpeedIndicatorProps {
  speed: number;
}

/**
 * Speed/velocity indicator
 */
function SpeedIndicator({ speed }: SpeedIndicatorProps) {
  return (
    <View style={styles.speedContainer}>
      <Text style={styles.speedValue}>{Math.round(speed)}</Text>
      <Text style={styles.speedUnit}>KM/H</Text>
    </View>
  );
}

/**
 * Pause button overlay
 */
function PauseButton({ onPause }: { onPause: () => void }) {
  return (
    <View style={styles.pauseButton} onTouchEnd={onPause}>
      <Text style={styles.pauseIcon}>⏸</Text>
    </View>
  );
}

/**
 * Game Over overlay
 */
function GameOverOverlay() {
  const { score, highScore, resetGame } = useGameStore();

  return (
    <View style={styles.gameOverContainer} onTouchEnd={resetGame}>
      <Text style={styles.gameOverTitle}>GAME OVER</Text>
      <View style={styles.gameOverStats}>
        <Text style={styles.gameOverScore}>
          Score: {score.toLocaleString()}
        </Text>
        <Text style={styles.gameOverHighScore}>
          Best: {highScore.toLocaleString()}
        </Text>
      </View>
      <Text style={styles.gameOverHint}>Tap to restart</Text>
    </View>
  );
}

/**
 * Pause menu overlay
 */
function PauseOverlay() {
  const { resumeGame } = useGameStore();

  return (
    <View style={styles.pauseOverlay} onTouchEnd={resumeGame}>
      <Text style={styles.pauseTitle}>PAUSED</Text>
      <Text style={styles.pauseHint}>Tap to continue</Text>
    </View>
  );
}

/**
 * Main HUD Component
 */
export function HUD() {
  const {
    gameState,
    score,
    highScore,
    warmth,
    maxWarmth,
    combo,
    comboMultiplier,
    currentBiome,
    velocity,
    pauseGame,
  } = useGameStore();

  // Don't show HUD in menu state
  if (gameState === "menu") {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top bar */}
      <View style={styles.topBar}>
        <WarmthBar warmth={warmth} maxWarmth={maxWarmth} />
        <ScoreDisplay score={score} highScore={highScore} />
      </View>

      {/* Left side indicators */}
      <View style={styles.leftPanel}>
        <BiomeIndicator biome={currentBiome} />
        <SpeedIndicator speed={velocity} />
      </View>

      {/* Right side combo */}
      <View style={styles.rightPanel}>
        <ComboDisplay combo={combo} comboMultiplier={comboMultiplier} />
      </View>

      {/* Pause button */}
      {gameState === "playing" && (
        <View style={styles.pauseButtonContainer}>
          <PauseButton onPause={pauseGame} />
        </View>
      )}

      {/* Overlays */}
      {gameState === "paused" && <PauseOverlay />}
      {gameState === "gameover" && <GameOverOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // Warmth bar
  warmthContainer: {
    alignItems: "flex-start",
  },
  warmthLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  warmthBarBg: {
    width: SCREEN_WIDTH * 0.4,
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  warmthBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  segmentMarker: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  warmthValue: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Score
  scoreContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 4,
  },
  scoreLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scoreValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  newHighScore: {
    color: "#FFD166",
  },
  highScoreIndicator: {
    color: "#FFD166",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },

  // Combo
  comboContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 140, 66, 0.3)",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FF8C42",
    padding: 8,
  },
  comboCount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    textShadowColor: "rgba(255, 140, 66, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  comboLabel: {
    color: "#FF8C42",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  comboMultiplier: {
    color: "#FFD166",
    fontSize: 14,
    fontWeight: "700",
  },

  // Biome indicator
  biomeContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  biomeLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
  },

  // Speed indicator
  speedContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  speedValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  speedUnit: {
    color: "#9CA3AF",
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 1,
  },

  // Side panels
  leftPanel: {
    position: "absolute",
    left: 16,
    top: "40%",
  },
  rightPanel: {
    position: "absolute",
    right: 16,
    top: "40%",
  },

  // Pause button
  pauseButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  pauseIcon: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  // Overlays
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseTitle: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 8,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  pauseHint: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 16,
  },

  gameOverContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  gameOverTitle: {
    color: "#EF4444",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: "rgba(239, 68, 68, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  gameOverStats: {
    marginTop: 24,
    alignItems: "center",
  },
  gameOverScore: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  gameOverHighScore: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 8,
  },
  gameOverHint: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 32,
  },
});

export default HUD;
