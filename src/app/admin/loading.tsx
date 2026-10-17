/**
 * Shown while the admin subtree resolves (auth check + JS chunk).
 *
 * Without this the admin layout's session check blocks the whole segment with
 * a blank screen; this gives the user something to look at immediately.
 */
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="h-8 w-8 rounded-lg bg-white/10" />
            <div className="mt-4 h-3 w-24 rounded bg-white/10" />
            <div className="mt-2 h-7 w-16 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
