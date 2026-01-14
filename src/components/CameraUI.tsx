import { useGameStore } from "../stores/useGameStore";

export const CameraUI = () => {
  const photos = useGameStore((state) => state.inventory.photos);
  const filmRolls = useGameStore((state) => state.inventory.filmRolls);

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end pointer-events-none">
      {/* Film Count */}
      <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-accent-ice/30 mb-2 flex items-center gap-2">
        <span className="text-2xl">🎞️</span>
        <span className="text-xl font-heading text-white">{filmRolls}</span>
      </div>

      {/* Developing Queue */}
      <div className="flex flex-col gap-2">
        {photos
          .slice(-5)
          .reverse()
          .map((photo) => (
            <div
              key={photo.id}
              className="w-16 h-12 bg-gray-900 border border-gray-600 rounded relative overflow-hidden"
            >
              {photo.status === "developed" ? (
                <div
                  className={`w-full h-full flex items-center justify-center text-xs text-center ${
                    photo.type === "enemy"
                      ? "bg-red-900/50 text-red-200"
                      : "bg-blue-900/50 text-blue-200"
                  }`}
                >
                  {photo.type}
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-300"
                    style={{ width: `${photo.progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                    DEV...
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
