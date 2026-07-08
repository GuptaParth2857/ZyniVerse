"use client";

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
      <div className="aspect-[2/3] bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-2 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[70vh] w-full animate-pulse bg-[var(--color-panel)]">
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-10 w-2/3 rounded bg-white/10" />
        <div className="h-6 w-1/3 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative min-h-[60vh] bg-[var(--color-panel)]" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-1/4 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
          <div className="h-3 w-4/6 rounded bg-white/5" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] p-3">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-3/4 rounded bg-white/10" />
                <div className="h-2 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 w-44 animate-pulse">
          <div className="aspect-[2/3] rounded-xl bg-white/5" />
          <div className="mt-2 space-y-1.5">
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-2 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="h-3 w-16 rounded bg-white/10" />
          <div className="h-6 w-48 rounded bg-white/10" />
        </div>
        <div className="h-4 w-20 rounded bg-white/5" />
      </div>
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 w-36">
            <div className="aspect-[2/3] rounded-xl bg-white/5" />
            <div className="mt-2 space-y-1">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-2 w-1/3 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <RowSkeleton />
    </section>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] p-3">
          <div className="h-14 w-14 rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-white/10" />
            <div className="h-2 w-1/4 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
