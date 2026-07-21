import type { Metadata } from "next";
import ActivityFeed from "@/components/ActivityFeed";

export const metadata: Metadata = {
  title: "Activity Feed — Follow Your Friends | ZyniVerse",
  description: "See what your friends and favorite anime fans are watching, completing, and reviewing.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
          {"// Live Activity"}
        </p>
        <h1 className="font-display text-3xl font-black tracking-tight mt-1">
          Activity Feed
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)] max-w-xl">
          See what your friends and the community are watching, completing, and reviewing — all in one place.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
