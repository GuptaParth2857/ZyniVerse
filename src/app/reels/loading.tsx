/**
 * Route-level skeleton for the reels feed.
 *
 * The feed is server-rendered from a remote DB, so the first paint can take a
 * while on a cold cache — previously the user stared at a blank screen until
 * the whole page resolved. This renders immediately (no JS required) and
 * mirrors the client skeleton in `client.tsx` so the handoff is seamless.
 */
export default function ReelsLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="relative mx-auto h-[calc(100dvh-10.5rem)] w-full max-w-sm overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60"
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-white/5 via-white/10 to-white/5" />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-5">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
