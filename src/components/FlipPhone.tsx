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
    <div className="w-[80vw] h-[60vh] max-w-sm max-h-[600px] bg-black border-4 border-gray-800 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
      {/* Top Screen */}
      <div className="flex-1 p-4 bg-primary border-b-8 border-gray-800 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        {/* Status Bar */}
        <div className="bg-glacier-blue/20 p-2 mb-3 rounded-lg text-[10px] font-heading text-accent-ice flex justify-between shrink-0">
          <span>SIGNAL: 100%</span>
          <span>BAT: 99%</span>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto space-y-3 font-body text-green-400 text-sm scrollbar-thin scrollbar-thumb-gray-700">
          {messages.map((msg, i) => (
            <div
              key={`msg-${i}-${msg.sender}-${msg.text.substring(0, 20)}`}
              className="bg-green-900/20 p-2 rounded-lg border border-green-500/20"
            >
              <span className="font-bold text-green-300 block text-xs mb-1">
                {msg.sender}:
              </span>
              <span className="leading-snug">{msg.text}</span>
            </div>
          ))}
          <div className="animate-pulse text-green-500">_</div>
        </div>
      </div>

      {/* Keypad Area */}
      <div className="h-[35%] bg-gray-900 p-4 grid grid-cols-3 gap-2 shrink-0">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((k) => (
          <button
            type="button"
            key={k}
            className="bg-gray-800 rounded-xl text-gray-400 text-sm font-heading hover:bg-gray-700 active:bg-gray-600 active:scale-95 transition-all touch-manipulation flex items-center justify-center"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="col-span-3 mt-1 bg-red-900/50 text-red-400 text-xs font-bold py-2 rounded-xl border border-red-500/30 uppercase tracking-widest active:bg-red-900 active:scale-95 transition-all touch-manipulation"
        >
          Close Flip
        </button>
      </div>
    </div>
  );
};
