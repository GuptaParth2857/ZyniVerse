import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline · ZyniVerse",
  robots: { index: false },
};

/**
 * Served by the service worker when a navigation fails.
 *
 * This has to be a real rendered page rather than the worker's inline string
 * fallback. The inline version rendered as an unstyled blank page with no
 * navigation and no way to get back into the app, which is indistinguishable
 * from the site being broken.
 *
 * It is intentionally server-rendered and dependency-free: the whole point is
 * that it works when nothing else can be fetched.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12 text-center">
      <p
        className="mb-2 text-5xl"
        role="img"
        aria-label="No connection"
        style={{ filter: "grayscale(1)", opacity: 0.5 }}
      >
        📡
      </p>

      <h1
        className="mb-3 text-2xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        You are offline
      </h1>

      <p className="mb-6 text-sm" style={{ color: "var(--color-mute)" }}>
        This page has not been saved for offline use. Anything you have already
        opened still works, and pages you visit from now on will be remembered
        for next time.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--color-violet)", color: "#fff" }}
        >
          Back to home
        </Link>
        <a
          href="/offline"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
        >
          Retry
        </a>
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--color-mute)" }}>
        Pages that need a live connection — your watchlist, notifications and
        anything posted from the forum — are the exception. They are never
        cached, so they wait until you are back online.
      </p>
    </main>
  );
}