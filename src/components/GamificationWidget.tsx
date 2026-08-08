"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const RANKS = [
  { name: "Bronze", icon: "🥉", at: 0 },
  { name: "Silver", icon: "🪙", at: 100 },
  { name: "Gold", icon: "🥇", at: 500 },
  { name: "Platinum", icon: "💠", at: 1000 },
  { name: "Diamond", icon: "💎", at: 2500 },
  { name: "Heroic", icon: "🔥", at: 5000 },
  { name: "Grandmaster", icon: "👑", at: 10000 },
];

function getRankInfo(points: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (points >= r.at) rank = r;
  }
  return rank;
}

interface AchievementApiResponse {
  points: number;
  level: number;
  nextLevel: { current: number; needed: number };
  achievements: { earned: boolean }[];
}

export default function GamificationWidget() {
  const { data: session } = useSession();
  const [data, setData] = useState<AchievementApiResponse | null>(null);
  const [dataUserId, setDataUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    fetch("/api/achievements")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setDataUserId(session.user?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setDataUserId(null);
        }
      });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  if (!session?.user?.id) {
    return (
      <Link href="/achievements"
        className="group flex items-center justify-between gap-4 rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 px-5 py-4 transition-colors hover:bg-[var(--color-panel)]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-magenta)]/10 text-xl">🎮</span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold truncate">Level up your anime journey</p>
            <p className="text-xs text-[var(--color-mute)] truncate">Earn XP, unlock badges &amp; climb the leaderboard</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black transition-transform group-hover:scale-105">
          Explore →
        </span>
      </Link>
    );
  }

  if (!data || dataUserId !== session.user.id) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-magenta)]/10 text-xl">🎮</span>
          <div>
            <p className="font-display text-sm font-bold">Loading your XP...</p>
            <p className="text-xs text-[var(--color-mute)]">Earn badges by exploring anime</p>
          </div>
        </div>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
      </div>
    );
  }

  const rank = getRankInfo(data.points);
  const earned = data.achievements.filter((a) => a.earned).length;
  const total = data.achievements.length;
  const progress = data.nextLevel && data.nextLevel.needed > 0
    ? Math.min(100, Math.round((data.nextLevel.current / data.nextLevel.needed) * 100))
    : 0;

  return (
    <Link href="/achievements"
      className="group flex items-center justify-between gap-4 rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 px-5 py-4 transition-colors hover:bg-[var(--color-panel)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-magenta)]/10 text-xl">
          {rank.icon}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-bold">
              {rank.name} · Lv.{data.level}
            </p>
          </div>
          <p className="text-xs text-[var(--color-mute)] truncate">
            {earned}/{total} badges · {data.points.toLocaleString()} XP
          </p>
        </div>
      </div>
      <div className="hidden sm:block w-40 shrink-0">
        <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--color-mute)]">
          <span>{data.nextLevel.current.toLocaleString()} / {data.nextLevel.needed.toLocaleString()} XP</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="shrink-0 text-xs font-bold text-[var(--color-cyan)] group-hover:underline">View all →</span>
    </Link>
  );
}
