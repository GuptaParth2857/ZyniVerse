"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-[80px] font-bold leading-none tracking-tighter text-red-500/20">
        !
      </div>
      <h1 className="font-display text-3xl font-bold -mt-4">Signal lost</h1>
      <p className="mt-3 text-sm text-[var(--color-mute)]">
        {error.message || "Something went wrong."}
      </p>
      <button onClick={reset}
        className="mt-8 rounded-full border border-[var(--color-cyan)] px-6 py-3 text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-all"
      >Try again</button>
    </div>
  );
}
