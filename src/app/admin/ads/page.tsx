import type { Metadata } from "next";
import AdManager from "@/components/AdManager";

export const metadata: Metadata = {
  title: "Ad Management — ZyniVerse Admin",
  robots: { index: false, follow: false },
};

export default function AdminAdsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          Admin
        </p>
        <h1 className="font-display text-3xl font-bold mt-1">Ad Management</h1>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          Manage ad placements, view statistics, and configure ad networks.
        </p>
      </div>
      <AdManager />
    </div>
  );
}
