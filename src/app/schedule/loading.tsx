// Streamed while the schedule page awaits its server-side AniList fetch on a
// cold render (see `page.tsx` — `export const dynamic = "force-dynamic"`).
// The same skeleton is used in-page while navigating between weeks.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-3xl border border-white/5 bg-[var(--color-panel)]/60 p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="h-40 w-28 rounded-2xl bg-white/5 sm:h-48 sm:w-32" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="h-7 w-3/4 rounded-lg bg-white/10" />
            <div className="h-4 w-1/2 rounded-full bg-white/5" />
          </div>
          <div className="h-20 w-48 rounded-2xl bg-white/5" />
        </div>
      </div>
      <div className="flex gap-5 overflow-hidden">
        {[0, 1, 2].map((c) => (
          <div key={c} className="w-[85vw] max-w-sm shrink-0 rounded-2xl border border-white/5 bg-[var(--color-panel)]/60 p-4">
            <div className="mb-4 h-6 w-32 rounded-lg bg-white/10" />
            <div className="space-y-3">
              {[0, 1, 2, 3].map((r) => (
                <div key={r} className="h-[72px] rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}