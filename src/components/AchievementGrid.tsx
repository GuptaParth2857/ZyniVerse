"use client";

import { useState, useEffect } from "react";
import AchievementBadge from "./AchievementBadge";

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

const CATEGORY_COLORS: Record<string, string> = {
  watching: "#ff3366",
  reading: "#00ffff",
  community: "#ffd700",
  social: "#ff69b4",
  milestone: "#8a2be2",
};

const CATEGORIES = [
  { key: "all", label: "All", icon: "🎯" },
  { key: "watching", label: "Watching", icon: "🎬" },
  { key: "reading", label: "Reading", icon: "📖" },
  { key: "community", label: "Community", icon: "💬" },
  { key: "social", label: "Social", icon: "🦋" },
  { key: "milestone", label: "Milestone", icon: "🏆" },
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
      return b.points - a.points;
    });

  const earnedCount = achievements.filter((a) => a.earned).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white/5 animate-pulse h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const isActive = filter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className="neon-premium rounded-xl transition-all"
            >
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content px-4 py-2.5 flex items-center gap-2" style={{
                background: isActive ? `${CATEGORY_COLORS[c.key] || "#8a2be2"}10` : undefined,
              }}>
                <span className="text-sm">{c.icon}</span>
                <span className="text-xs font-bold" style={{
                  color: isActive ? (CATEGORY_COLORS[c.key] || "#8a2be2") : "var(--color-mute)",
                }}>
                  {c.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-mute)] py-10">No achievements found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((a) => (
            <AchievementBadge key={a.code} achievement={a} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[var(--color-mute)] mt-4">
        {earnedCount} / {achievements.length} achievements unlocked
      </p>
    </div>
  );
}
