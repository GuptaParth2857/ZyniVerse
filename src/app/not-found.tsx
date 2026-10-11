import type { Metadata } from "next";
import Link from "next/link";

// This Next version can serve streamed not-found responses with HTTP 200
// (see the not-found.js docs: 404 is only guaranteed for non-streamed
// responses). Next auto-injects noindex ONLY for real 404 statuses, so set
// it explicitly to make sure a streamed 200 404-page can never be indexed.
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

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
