import { useGameStore } from "../../stores/useGameStore";

export const MainMenu = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const score = useGameStore((state) => state.score);

  if (gameState !== "menu") return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-500">
      <h1 className="text-5xl sm:text-7xl font-heading text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] text-center leading-tight">
        READY TO
        <br />
        <span className="text-accent-ice">GLITCH?</span>
      </h1>

      <div className="flex flex-col landscape:flex-row gap-6 w-full max-w-xs sm:max-w-sm landscape:max-w-2xl landscape:items-center">
        <button
          type="button"
          onClick={() => {
            setGameState("playing");
          }}
          className="bg-accent-ice text-primary font-heading font-bold text-xl py-6 rounded-2xl shadow-[0_0_30px_rgba(125,211,252,0.4)] active:scale-95 transition-all touch-manipulation relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          ENTER SIMULATION
        </button>

        <button
          type="button"
          className="bg-gray-800/80 text-white font-body text-lg py-4 rounded-xl border border-gray-600 active:bg-gray-700 active:scale-95 transition-all touch-manipulation"
        >
          SETTINGS
        </button>
      </div>

      <div className="mt-12 text-white/70 font-body tracking-widest text-sm">
        LAST RUN:{" "}
        <span className="text-accent-ice font-bold">{Math.floor(score)}</span>
      </div>
    </div>
  );
};
