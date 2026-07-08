"use client";

import { useState, useEffect } from "react";
import AchievementBadge from "./AchievementBadge";
import { CardSkeleton } from "./Loader";

interface AchievementItem {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  criteria: { type: string; value: number };
  isHidden?: boolean;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "watching", label: "Watching" },
  { key: "reading", label: "Reading" },
  { key: "community", label: "Community" },
  { key: "social", label: "Social" },
  { key: "milestone", label: "Milestone" },
];

export default function AchievementGrid() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        setAchievements(d.achievements || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = achievements
    .filter((a) => filter === "all" || a.category === filter)
    .filter((a) => !a.isHidden || a.earned)
    .sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      if (a.progress > 0 && b.progress === 0) return -1;
      if (a.progress === 0 && b.progress > 0) return 1;
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === c.key
                ? "bg-[var(--color-violet)]/10 text-[var(--color-violet)]"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-mute)] py-10">No achievements found.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((a) => (
            <AchievementBadge key={a.code} achievement={a} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[var(--color-mute)] mt-6">
        {achievements.filter((a) => a.earned).length} / {achievements.length} achievements unlocked
      </p>
    </div>
  );
}
