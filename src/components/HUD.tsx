import { useState } from "react";
import { useGameStore } from "../stores/useGameStore";
import { CameraUI } from "./CameraUI";
import { FlipPhone } from "./FlipPhone";

export const HUD = () => {
  const score = useGameStore((state) => state.score);
  const warmth = useGameStore((state) => state.warmth);
  const gameState = useGameStore((state) => state.gameState);
  const [phoneOpen, setPhoneOpen] = useState(false);

  if (gameState !== "playing") return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none touch-none">
      <CameraUI />

      {/* Top Bar - Responsive Padding */}
      <div className="flex justify-between p-[max(2vh,1rem)] w-full max-w-7xl mx-auto">
        {/* Score Panel */}
        <div className="bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-accent-ice/30 shadow-lg min-w-[120px]">
          <div className="text-[10px] sm:text-xs text-accent-ice font-heading uppercase tracking-wider">
            Score
          </div>
          <div className="text-2xl sm:text-3xl font-body text-white tabular-nums">
            {Math.floor(score)}
          </div>
        </div>

        {/* Warmth Meter */}
        <div className="bg-black/50 backdrop-blur-md p-3 rounded-2xl border border-accent-ice/30 w-[40vw] max-w-xs flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
             <div className="text-[10px] sm:text-xs text-accent-ice font-heading uppercase">
                Warmth
             </div>
             <div className="text-[10px] text-white/80">{Math.round(warmth)}%</div>
          </div>
          <div className="h-3 sm:h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${warmth < 30 ? "bg-warning-red" : "bg-gradient-to-r from-orange-400 to-yellow-300"}`}
              style={{ width: `${warmth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flip Phone Button - Bottom Right */}
      <div className="absolute bottom-[max(4vh,1.5rem)] right-[max(4vw,1.5rem)] pointer-events-auto z-50">
        <button
          type="button"
          onClick={() => setPhoneOpen(!phoneOpen)}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-black/80 border-2 border-accent-ice rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(125,211,252,0.6)] backdrop-blur-sm touch-manipulation"
          aria-label="Open Phone"
        >
          <span className="text-3xl sm:text-4xl">📱</span>
        </button>
      </div>

      {/* Phone Overlay */}
      {phoneOpen && (
        <div className="absolute bottom-[max(12vh,5rem)] right-[max(4vw,1.5rem)] pointer-events-auto z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          <FlipPhone onClose={() => setPhoneOpen(false)} />
        </div>
      )}

      {/* Touch Hints (Optional, visible briefly on start?) */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center opacity-50 pointer-events-none">
        <div className="text-white/50 text-xs font-heading tracking-widest hidden sm:block">
            TILT TO STEER • TAP LEFT TO JUMP • TAP RIGHT TO SHOOT
        </div>
      </div>
    </div>
  );
};