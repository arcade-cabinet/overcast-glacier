import { useGameStore } from "../../stores/useGameStore";

export const MainMenu = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const score = useGameStore((state) => state.score);

  if (gameState !== "menu") return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/40 backdrop-blur-sm">
      <h1 className="text-5xl font-heading text-white mb-8 drop-shadow-lg text-center">
        READY TO
        <br />
        GLITCH?
      </h1>

      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => {
            console.log("Entering simulation...");
            setGameState("playing");
          }}
          className="bg-accent-ice hover:bg-frost-highlight text-primary font-heading font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(125,211,252,0.6)] transform hover:scale-105 transition-all"
        >
          ENTER SIMULATION
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 text-white font-body py-2 rounded-lg border border-gray-600">
          SETTINGS
        </button>
      </div>

      <div className="mt-8 text-white font-body">
        LAST RUN: {Math.floor(score)}
      </div>
    </div>
  );
};
