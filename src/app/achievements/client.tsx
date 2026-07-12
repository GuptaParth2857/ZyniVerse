"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

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

interface LevelData {
  points: number;
  level: number;
  nextLevel: { current: number; needed: number };
  achievements: AchievementItem[];
}

const CATEGORIES = [
  { key: "all", label: "All", icon: "🎯" },
  { key: "watching", label: "Watching", icon: "🎬" },
  { key: "reading", label: "Reading", icon: "📖" },
  { key: "community", label: "Community", icon: "💬" },
  { key: "social", label: "Social", icon: "🦋" },
  { key: "milestone", label: "Milestone", icon: "🏆" },
];

const CATEGORY_COLORS: Record<string, string> = {
  watching: "#ff3366",
  reading: "#00ffff",
  community: "#ffd700",
  social: "#ff69b4",
  milestone: "#8a2be2",
};

function XPProgressRing({ progress, size = 160, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="url(#xpGradient)" strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff00ff" />
          <stop offset="50%" stopColor="#8a2be2" />
          <stop offset="100%" stopColor="#00ffff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="neon-premium rounded-xl">
      <div className="neon-premium-track rounded-xl" />
      <div className="neon-premium-overlay rounded-[10.5px]" />
      <div className="neon-premium-content p-4 text-center">
        <span className="text-xl block">{icon}</span>
        <div className="text-xl font-bold font-mono mt-1" style={{ color }}>{value}</div>
        <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function AchievementCard({ a }: { a: AchievementItem }) {
  const color = CATEGORY_COLORS[a.category] || "#8a2be2";
  return (
    <motion.div {...FADE_UP} className="group relative">
      <div className={`neon-premium rounded-xl transition-all duration-300 ${a.earned ? "" : "opacity-50"}`}>
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-4">
          {/* Icon */}
          <div className="relative mb-3">
            <span className={`text-4xl block transition-transform duration-300 group-hover:scale-110 ${a.earned ? "" : "grayscale"}`}>
              {a.icon}
            </span>
            {a.earned && (
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: color, color: "#000" }}>
                ✓
              </div>
            )}
          </div>

          {/* Name */}
          <p className="text-xs font-bold truncate leading-tight">{a.name}</p>

          {/* Points */}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold" style={{ color }}>
              {a.points} pts
            </span>
            {a.earned ? (
              <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider">Earned</span>
            ) : (
              <span className="text-[8px] text-[var(--color-mute)] uppercase tracking-wider">Locked</span>
            )}
          </div>

          {/* Progress bar for locked */}
          {!a.earned && a.progress > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[8px] text-[var(--color-mute)] mb-0.5">
                <span>Progress</span>
                <span>{a.progress}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${a.progress}%`, background: color }} />
              </div>
            </div>
          )}

          {/* Earned date */}
          {a.earned && a.earnedAt && (
            <p className="text-[8px] text-[var(--color-mute)] mt-1.5">
              Earned {new Date(a.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}

          {/* Description on hover */}
          <div className="mt-1.5 text-[9px] text-[var(--color-mute)] line-clamp-2">{a.description}</div>
        </div>
      </div>

      {/* Glow on hover */}
      {a.earned && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `0 0 30px ${color}22, inset 0 0 30px ${color}08` }} />
      )}
    </motion.div>
  );
}

export default function AchievementClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const achievements = data?.achievements || [];
  const progress = data?.nextLevel
    ? Math.min(100, Math.round((data.nextLevel.current / data.nextLevel.needed) * 100))
    : 0;

  const stats = useMemo(() => {
    const earned = achievements.filter((a) => a.earned);
    const visible = achievements.filter((a) => !a.isHidden || a.earned);
    const total = visible.length;
    const earnedCount = earned.length;
    const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);
    const completionPct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;
    const recentEarned = earned
      .filter((a) => a.earnedAt)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, 5);
    const rarest = earned.length > 0
      ? earned.reduce((min, a) => (a.points > min.points ? a : min), earned[0])
      : null;
    return { earnedCount, total, totalPoints, completionPct, recentEarned, rarest };
  }, [achievements]);

  const filtered = useMemo(() => {
    return achievements
      .filter((a) => filter === "all" || a.category === filter)
      .filter((a) => !a.isHidden || a.earned)
      .sort((a, b) => {
        if (a.earned && !b.earned) return -1;
        if (!a.earned && b.earned) return 1;
        if (a.progress > 0 && b.progress === 0) return -1;
        if (a.progress === 0 && b.progress > 0) return 1;
        return b.points - a.points;
      });
  }, [achievements, filter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; earned: number }> = {};
    for (const a of achievements) {
      if (a.isHidden && !a.earned) continue;
      if (!counts[a.category]) counts[a.category] = { total: 0, earned: 0 };
      counts[a.category].total++;
      if (a.earned) counts[a.category].earned++;
    }
    return counts;
  }, [achievements]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-transparent border-t-[var(--color-magenta)] animate-spin" />
          <p className="text-[10px] font-mono tracking-[0.25em] text-[var(--color-mute)]">LOADING ACHIEVEMENTS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ═══════════════ HERO ═══════════════ */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#8a2be2]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#ff00ff]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(138,43,226,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Level Ring */}
            <div className="relative shrink-0">
              <XPProgressRing progress={progress} size={180} strokeWidth={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">
                  {data?.level || 1}
                </span>
                <span className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">Level</span>
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-[#ff00ff] animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="absolute -bottom-1 -left-3 h-2 w-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "0.5s" }} />
              <div className="absolute top-1/2 -right-4 h-2 w-2 rounded-full bg-[#8a2be2] animate-bounce" style={{ animationDelay: "1s" }} />
            </div>

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="neon-premium rounded-xl h-10 w-10">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-lg">🏆</span>
                  </div>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a2be2]" style={{ textShadow: "0 0 10px rgba(138,43,226,0.5)" }}>Achievements</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 0 30px rgba(138,43,226,0.3), 0 0 60px rgba(255,0,255,0.2)" }}>
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#8a2be2] to-[#00ffff]">Journey</span>
              </h1>
              <p className="mt-3 text-base text-gray-400 max-w-lg">
                Track your anime adventures, unlock badges, and level up as you explore the world of anime and manga.
              </p>
              {!session?.user && (
                <Link href="/login" className="inline-block mt-4 rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, rgba(138,43,226,0.2), rgba(255,0,255,0.1))",
                    border: "1px solid #8a2be2",
                    color: "#8a2be2",
                  }}>
                  Login to Track Progress →
                </Link>
              )}
            </div>

            {/* XP Info */}
            <div className="shrink-0 text-center lg:text-right">
              <div className="text-sm text-[var(--color-mute)]">
                <span className="font-mono text-lg font-bold text-[#ff00ff]">{(data?.nextLevel?.current || 0).toLocaleString()}</span>
                <span className="text-[var(--color-mute)]"> / {(data?.nextLevel?.needed || 0).toLocaleString()} XP</span>
              </div>
              <div className="mt-2 text-[10px] text-[var(--color-mute)]">to next level</div>
              <div className="mt-1 text-2xl font-bold font-mono text-white">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-[10px] text-[var(--color-mute)] uppercase tracking-widest">Total Points</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8a2be2] to-transparent shadow-[0_0_10px_rgba(138,43,226,0.5)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* ═══════════════ STATS ROW ═══════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Achievements" value={stats.earnedCount} icon="🏅" color="#ff00ff" />
          <StatBox label="Completion" value={`${stats.completionPct}%`} icon="📊" color="#00ffff" />
          <StatBox label="Total Points" value={stats.totalPoints.toLocaleString()} icon="⚡" color="#ffd700" />
          <StatBox label="Rarest Badge" value={stats.rarest ? stats.rarest.icon : "—"} icon="💎" color="#8a2be2" />
        </div>

        {/* ═══════════════ RECENTLY EARNED ═══════════════ */}
        {stats.recentEarned.length > 0 && (
          <motion.div {...FADE_UP}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">✨</div>
              <div>
                <h2 className="font-display text-xl font-bold" style={{ color: "#ffd700" }}>Recently Earned</h2>
                <p className="text-xs text-[var(--color-mute)]">Your latest achievements</p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {stats.recentEarned.map((a) => (
                <div key={a.code} className="shrink-0 w-[200px]">
                  <div className="neon-premium rounded-xl">
                    <div className="neon-premium-track rounded-xl" />
                    <div className="neon-premium-overlay rounded-[10.5px]" />
                    <div className="neon-premium-content p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{a.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{a.name}</p>
                          <p className="text-[10px] text-[var(--color-mute)] mt-0.5">
                            {a.earnedAt ? new Date(a.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                          </p>
                          <p className="text-[10px] font-mono font-bold mt-0.5" style={{ color: CATEGORY_COLORS[a.category] }}>
                            +{a.points} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ CATEGORY FILTERS ═══════════════ */}
        <motion.div {...FADE_UP}>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">🎯</div>
            <div>
              <h2 className="font-display text-xl font-bold" style={{ color: "#ff00ff" }}>All Achievements</h2>
              <p className="text-xs text-[var(--color-mute)]">{stats.earnedCount} / {stats.total} unlocked</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const counts = categoryCounts[c.key];
              const isActive = filter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  className="neon-premium rounded-xl transition-all"
                  style={{
                    boxShadow: isActive ? `0 0 20px ${CATEGORY_COLORS[c.key] || "#8a2be2"}33` : undefined,
                  }}
                >
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content px-4 py-2.5 flex items-center gap-2" style={{
                    background: isActive ? `${CATEGORY_COLORS[c.key] || "#8a2be2"}10` : undefined,
                  }}>
                    <span className="text-sm">{c.icon}</span>
                    <span className="text-xs font-bold" style={{ color: isActive ? (CATEGORY_COLORS[c.key] || "#8a2be2") : "var(--color-mute)" }}>
                      {c.label}
                    </span>
                    {counts && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{
                        background: isActive ? `${CATEGORY_COLORS[c.key]}20` : "rgba(255,255,255,0.05)",
                        color: isActive ? CATEGORY_COLORS[c.key] : "var(--color-mute)",
                      }}>
                        {counts.earned}/{counts.total}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ═══════════════ ACHIEVEMENT GRID ═══════════════ */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm text-[var(--color-mute)]">No achievements in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((a) => (
              <AchievementCard key={a.code} a={a} />
            ))}
          </div>
        )}

        {/* ═══════════════ ACHIEVEMENTS INFO ═══════════════ */}
        <motion.div {...FADE_UP} className="text-center">
          <div className="neon-premium rounded-2xl inline-block">
            <div className="neon-premium-track rounded-2xl" />
            <div className="neon-premium-overlay rounded-[14.5px]" />
            <div className="neon-premium-content px-8 py-6">
              <p className="text-sm text-[var(--color-mute)]">
                <span className="font-bold text-white">{stats.totalPoints.toLocaleString()}</span> total points earned •{" "}
                <span className="font-bold text-white">{stats.completionPct}%</span> completion rate •{" "}
                <span className="font-bold text-white">{stats.earnedCount}</span> badges collected
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="h-12" />
    </div>
  );
}
