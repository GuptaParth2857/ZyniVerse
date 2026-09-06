"use client";

import { logError } from "@/lib/logger";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  logError(error, "global-error");

  return (
    <html lang="en">
      <body className="bg-[var(--color-void)] text-[var(--color-ink)] antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="font-display text-[80px] font-bold leading-none tracking-tighter text-red-500/20">
            !
          </div>
          <h1 className="font-display -mt-4 text-3xl font-bold">Signal lost</h1>
          <p className="mt-3 text-sm text-[var(--color-mute)]">
            {error.message || "Something went wrong."}
          </p>
          <button
            onClick={reset}
            className="mt-8 rounded-full border border-[var(--color-cyan)] px-6 py-3 text-sm font-bold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/10"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}