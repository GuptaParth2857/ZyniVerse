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
        <div className="neon-rgb-border rounded-xl px-5 py-3 inline-block">
          <h1 className="font-display text-3xl font-bold sm:text-4xl bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-violet)] bg-clip-text text-transparent">
            Activity Feed
          </h1>
        </div>
        <p className="mt-3 text-sm text-[var(--color-mute)] max-w-xl">
          See what your friends and the community are watching, completing, and reviewing — all in one place.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
