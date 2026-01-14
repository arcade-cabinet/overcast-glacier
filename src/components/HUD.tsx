import { useGameStore } from '../stores/useGameStore';
import { FlipPhone } from './FlipPhone';
import { CameraUI } from './CameraUI';
import { useState } from 'react';

export const HUD = () => {
    const score = useGameStore(state => state.score);
    const warmth = useGameStore(state => state.warmth);
    const gameState = useGameStore(state => state.gameState);
    const [phoneOpen, setPhoneOpen] = useState(false);

    if (gameState !== 'playing') return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            <CameraUI />

            {/* Top Bar */}
            <div className="flex justify-between p-4">
                <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-accent-ice/30">
                    <div className="text-xs text-accent-ice font-heading uppercase">Score</div>
                    <div className="text-2xl font-body text-white">{Math.floor(score)}</div>
                </div>

                <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-accent-ice/30 w-32">
                     <div className="text-xs text-accent-ice font-heading uppercase mb-1">Warmth</div>
                     <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${warmth < 30 ? 'bg-warning-red' : 'bg-orange-400'}`}
                            style={{ width: `${warmth}%` }}
                        />
                     </div>
                </div>
            </div>

            {/* Flip Phone Button */}
            <div className="absolute bottom-6 right-6 pointer-events-auto">
                <button
                    onClick={() => setPhoneOpen(!phoneOpen)}
                    className="w-16 h-16 bg-black border-2 border-accent-ice rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(125,211,252,0.5)]"
                >
                    <span className="text-2xl">📱</span>
                </button>
            </div>

            {/* Phone Overlay */}
            {phoneOpen && (
                <div className="absolute bottom-24 right-6 pointer-events-auto">
                    <FlipPhone onClose={() => setPhoneOpen(false)} />
                </div>
            )}

            {/* Crosshair for Camera (simple) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full absolute"></div>
            </div>
        </div>
    );
};
