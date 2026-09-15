export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mx-auto mb-10 h-10 w-64 rounded bg-[var(--color-panel)] animate-pulse" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-56 shrink-0 space-y-3">
            <div className="h-6 w-24 rounded bg-[var(--color-panel)] animate-pulse" />
            <div className="h-48 rounded-2xl bg-[var(--color-panel)] animate-pulse" />
            <div className="h-48 rounded-2xl bg-[var(--color-panel)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}