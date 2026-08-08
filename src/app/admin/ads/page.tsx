import type { Metadata } from "next";
import AdManager from "@/components/AdManager";

export const metadata: Metadata = {
  title: "Ad Management — ZyniVerse Admin",
  robots: { index: false, follow: false },
};

export default function AdminAdsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          Admin · Ads
        </p>
        <h1 className="font-display text-3xl font-bold mt-1 sm:text-4xl">Ad Management</h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-cyan)]" />
          </span>
          Placements, impressions &amp; network config
        </p>
      </div>
      <AdManager />
    </div>
  );
}
