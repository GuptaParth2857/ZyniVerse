"use client";

import { useState, useEffect } from "react";

interface LevelData {
  points: number;
  level: number;
  nextLevel: { current: number; needed: number };
}

export default function UserLevelCard() {
  const [data, setData] = useState<LevelData | null>(null);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        setData({
          points: d.points || 0,
          level: d.level || 1,
          nextLevel: d.nextLevel || { current: 0, needed: 100 },
        });
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  const progress = data.nextLevel.needed > 0
    ? Math.min(100, Math.round((data.nextLevel.current / data.nextLevel.needed) * 100))
    : 100;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
      <div className="text-4xl font-bold font-mono text-[var(--color-violet)]">
        {data.level}
      </div>
      <div className="text-xs text-[var(--color-mute)] uppercase tracking-wider mt-1">Level</div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[var(--color-mute)] mb-1">
          <span>XP</span>
          <span>{data.nextLevel.current} / {data.nextLevel.needed}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--color-line)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-magenta)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-sm font-semibold text-[var(--color-mute)]">
        {data.points.toLocaleString()} total points
      </div>

      <div className="mt-1 text-[10px] text-[var(--color-mute)]">
        Next level: {progress}% complete
      </div>
    </div>
  );
}
