import { useEffect, useState } from "react";
import { useGameStore } from "../../stores/useGameStore";

export const SplashScreen = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let innerTimer: NodeJS.Timeout;
    const outerTimer = setTimeout(() => {
      setVisible(false);
      innerTimer = setTimeout(() => setGameState("menu"), 1000);
    }, 3000);
    return () => {
      clearTimeout(outerTimer);
      clearTimeout(innerTimer);
    };
  }, [setGameState]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-primary flex flex-col items-center justify-center z-50 animate-out fade-out duration-1000">
      <h1 className="text-6xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-accent-ice to-frost-highlight animate-pulse drop-shadow-[0_0_10px_rgba(125,211,252,0.8)]">
        OVERCAST
      </h1>
      <h2 className="text-2xl font-body text-snow-white mt-2 tracking-widest">
        GLACIERS
      </h2>
      <div className="mt-8 text-matrix-green font-body text-sm animate-bounce">
        INITIALIZING SIMULATION...
      </div>
    </div>
  );
};
