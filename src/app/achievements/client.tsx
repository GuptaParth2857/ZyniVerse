"use client";

import { PageTransition } from "@/components/PageTransition";
import UserLevelCard from "@/components/UserLevelCard";
import AchievementGrid from "@/components/AchievementGrid";

export default function AchievementClient() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">// Achievements</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Achievements & Badges</h1>

        {/* Level Card */}
        <div className="mt-8 max-w-xs">
          <UserLevelCard />
        </div>

        {/* Achievement Grid */}
        <div className="mt-8">
          <AchievementGrid />
        </div>
      </div>
    </PageTransition>
  );
}
