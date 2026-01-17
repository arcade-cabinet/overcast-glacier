export const Loader = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading simulation"
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-primary text-accent-ice"
    >
      <div className="w-16 h-16 border-4 border-accent-ice border-t-transparent rounded-full animate-spin mb-4" />
      <div className="font-heading text-xl tracking-widest animate-pulse">
        LOADING SIMULATION...
      </div>
    </div>
  );
};
