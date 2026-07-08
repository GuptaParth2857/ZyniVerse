import type { Metadata } from "next";
import ActivityFeed from "@/components/ActivityFeed";

export const metadata: Metadata = {
  title: "Activity Feed — Follow Your Friends | ZyniVerse",
  description: "See what your friends and favorite anime fans are watching, completing, and reviewing.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black tracking-tight">Activity Feed</h1>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          See what your friends and favorite anime fans are watching, completing, and reviewing.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
