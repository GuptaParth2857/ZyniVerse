import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-[120px] font-bold leading-none tracking-tighter text-[var(--color-magenta)] opacity-20">
        404
      </div>
      <h1 className="font-display text-3xl font-bold -mt-6">Lost in the void</h1>
      <p className="mt-3 text-sm text-[var(--color-mute)]">
        This page doesn&apos;t exist. Maybe it was never animated, or it got filler treatment.
      </p>
      <Link href="/"
        className="mt-8 rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105"
      >Back to Home</Link>
    </div>
  );
}
