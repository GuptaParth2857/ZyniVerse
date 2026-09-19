import Link from "next/link";

export default function AnimeUnavailableCard({ href = "/" }: { href?: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="animate-pulse font-display text-[96px] font-bold leading-none tracking-tighter text-[var(--color-violet)] opacity-30">
        Zzz
      </div>
      <h1 className="font-display text-2xl font-bold">AniList is catching its breath</h1>
      <p className="mt-3 text-sm text-[var(--color-mute)]">
        We couldn&apos;t reach the anime database just now (it rate-limits shared connections).
        This is temporary — hit refresh or come back in a minute.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={href}
          className="rounded-full bg-[var(--color-violet)] px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105"
        >
          Try Again
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[var(--color-mute)]/40 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}