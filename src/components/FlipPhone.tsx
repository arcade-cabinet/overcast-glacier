import { useState } from "react";

export const FlipPhone = ({ onClose }: { onClose: () => void }) => {
  const [messages, _setMessages] = useState([
    { sender: "Peng", text: "Wake up, Kicks. The mountain has you." },
    {
      sender: "Peng",
      text: "Don't eat the yellow snow. Or the blue snow. Actually just ski.",
    },
  ]);

  return (
    <div className="w-64 h-96 bg-black border-4 border-gray-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl origin-bottom-right animate-in fade-in slide-in-from-bottom-10">
      {/* Top Screen */}
      <div className="flex-1 p-3 bg-primary border-b-4 border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="bg-glacier-blue/20 p-1 mb-2 rounded text-[10px] font-heading text-accent-ice flex justify-between">
            <span>SIGNAL: 100%</span>
            <span>BAT: 99%</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 font-body text-green-400 text-sm">
            {messages.map((msg, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: No unique ID for static messages
              <div key={i} className="bg-green-900/20 p-1 rounded">
                <span className="font-bold text-green-300">{msg.sender}:</span>{" "}
                {msg.text}
              </div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        </div>
      </div>

      {/* Keypad Area */}
      <div className="h-1/3 bg-gray-900 p-4 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((k) => (
          <button
            type="button"
            key={k}
            className="bg-gray-800 rounded text-gray-400 text-xs font-heading hover:bg-gray-700 active:bg-gray-600"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="col-span-3 mt-1 bg-red-900/50 text-red-400 text-xs py-1 rounded border border-red-500/30 uppercase tracking-widest hover:bg-red-900"
        >
          Close Flip
        </button>
      </div>
    </div>
  );
};
