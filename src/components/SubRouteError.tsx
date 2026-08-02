"use client";

export default function SubRouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-[60px] font-bold leading-none tracking-tighter text-red-500/20">!</div>
      <h2 className="font-display text-2xl font-bold -mt-2">Something went wrong</h2>
      <p className="mt-2 text-sm text-[var(--color-mute)] max-w-md">
        {error.message || "This section hit an unexpected error. Try again or go back."}
      </p>
      <button onClick={reset}
        className="mt-6 rounded-full border border-[var(--color-cyan)] px-5 py-2.5 text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-all"
      >Try again</button>
    </div>
  );
}
