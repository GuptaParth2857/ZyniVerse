"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Loader, { ErrorState } from "@/components/Loader";
import ApiKeyManager from "@/components/ApiKeyManager";
import StatsDashboard from "@/components/StatsDashboard";
import WatchHistory from "@/components/WatchHistory";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import RankBadge, { RankPill } from "@/components/RankBadge";
import { getRank, getNextRank } from "@/lib/achievements";

type Tab = "overview" | "entries" | "reviews" | "stats" | "history" | "import" | "api" | "lists";

interface MediaInfo {
  id: number;
  title: string;
  cover: string | null;
  format: string | null;
  episodes: number | null;
}

interface ProfileData {
  user: {
    id: string; username: string; email?: string; avatar?: string; banner?: string;
    bio?: string; themeColor?: string; signature?: string; createdAt: string;
    followersCount: number; followingCount: number;
    level: number; points: number;
    entries: { mediaId: number; type: string; status: string; progress: number; total: number; score: number | null; updatedAt: string }[];
    reviews: { id: string; mediaId: number; rating: number; comment?: string; createdAt: string; user: { username: string } }[];
    achievements: { code: string; name: string; icon: string; category: string; points: number; earnedAt: string }[];
    recentActivity: { id: string; type: string; mediaId: number | null; mediaTitle: string | null; mediaImage: string | null; message: string | null; createdAt: string }[];
  };
  stats: {
    total: number; current: number; planning: number; completed: number;
    dropped: number; paused: number; episodesWatched: number; meanScore: number;
  };
  topAnime: { mediaId: number; score: number | null; title: string | null; cover: string | null }[];
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "◈" },
  { key: "entries", label: "My List", icon: "☰" },
  { key: "reviews", label: "Reviews", icon: "★" },
  { key: "lists", label: "Lists", icon: "▤" },
  { key: "stats", label: "Stats", icon: "◐" },
  { key: "history", label: "History", icon: "◷" },
  { key: "import", label: "Import", icon: "⇪" },
  { key: "api", label: "API", icon: "⚡" },
];

const STATUS_OPTIONS = ["ALL", "CURRENT", "PLANNING", "COMPLETED", "DROPPED", "PAUSED"] as const;
const STATUS_COLORS: Record<string, string> = {
  CURRENT: "var(--color-cyan)", PLANNING: "var(--color-violet)",
  COMPLETED: "#22c55e", DROPPED: "var(--color-magenta)", PAUSED: "#facc15",
};
const ACTIVITY_ICONS: Record<string, string> = {
  view_anime: "📺", search: "🔍", add_to_list: "➕", remove_from_list: "➖",
  view_filler: "⏭", view_watch_order: "📋", view_schedule: "📅",
  view_seasonal: "🌸", view_genre: "🎭", view_character: "👤",
  view_recommendations: "🎯", view_manga: "📖", view_cosplay: "📸",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [anilistUsername, setAnilistUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [mediaCache, setMediaCache] = useState<Record<number, MediaInfo>>({});
  const [listView, setListView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError(null);
    fetch("/api/profile")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load profile");
        return data;
      })
      .then((d) => { setProfile(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [status, router]);

  const fetchMediaBatch = useCallback(async (ids: number[]) => {
    const uncached = ids.filter((id) => !mediaCache[id]);
    if (uncached.length === 0) return;
    try {
      const res = await fetch("/api/anilist/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: uncached.slice(0, 50) }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCache: Record<number, MediaInfo> = {};
        for (const m of data.media || []) {
          newCache[m.id] = {
            id: m.id,
            title: m.title?.userPreferred || m.title?.romaji || "Untitled",
            cover: m.coverImage?.large || m.coverImage?.medium || null,
            format: m.format || null,
            episodes: m.episodes || null,
          };
        }
        setMediaCache((prev) => ({ ...prev, ...newCache }));
      }
    } catch { /* silent */ }
  }, [mediaCache]);

  useEffect(() => {
    if (!profile) return;
    const ids = profile.user.entries.map((e) => e.mediaId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ids.length > 0) fetchMediaBatch(ids);
  }, [profile, fetchMediaBatch]);

  if (status === "loading" || loading) return <Loader label="Loading profile..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={() => { setLoading(true); setError(null); fetch("/api/profile").then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setProfile(d); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); }); }} /></div>;
  if (!profile) return null;

  const { user, stats } = profile;
  const tc = user.themeColor || "var(--color-magenta)";

  const filteredEntries = statusFilter === "ALL"
    ? user.entries
    : user.entries.filter((e) => e.status === statusFilter);

  const completionPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const xpForNextLevel = ((user.level) * (user.level)) * 100;
  const xpProgress = user.points % ((user.level) * (user.level) * 100);
  const xpNeeded = ((user.level) * (user.level) * 100);
  const xpPercent = xpNeeded > 0 ? Math.min((xpProgress / xpNeeded) * 100, 100) : 0;

  const rank = getRank(user.points);
  const nextRank = getNextRank(user.points);

  const RANK_THRESHOLDS = [0, 100, 500, 1000, 2500, 5000, 10000];
  const rankFloor = RANK_THRESHOLDS[rank.tier - 1] || 0;
  const rankCeil = nextRank ? RANK_THRESHOLDS[rank.tier] || rankFloor + 1000 : rankFloor + 1000;
  const rankPercent = nextRank ? Math.min(((user.points - rankFloor) / (rankCeil - rankFloor)) * 100, 100) : 100;

  return (
    <ErrorBoundary label="Profile">
    <div className="min-h-screen">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-56 sm:h-72 -mx-4 -mt-10 sm:-mx-6 sm:-mt-10 overflow-hidden"
      >
        {user.banner ? (
          <>
            <img src={user.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-void)]/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-panel)] via-[var(--color-void)] to-[var(--color-panel)]">
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 30% 50%, ${tc}30, transparent 60%), radial-gradient(ellipse at 70% 50%, var(--color-violet)20, transparent 60%)` }} />
            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${tc}08 1px, transparent 1px), linear-gradient(90deg, ${tc}08 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
          </div>
        )}
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />
      </motion.div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-20 relative z-10 pb-16">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="neon-premium rounded-2xl mb-6"
          style={{ boxShadow: `0 0 40px ${tc}08, 0 4px 30px rgba(0,0,0,0.3)` }}
        >
          <div className="neon-premium-track rounded-2xl" />
          <div className="neon-premium-overlay rounded-[15.5px]" />
          <div className="neon-premium-content p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-8">
              {/* Avatar */}
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute -inset-1 rounded-2xl animate-pulse" style={{ background: `linear-gradient(135deg, ${tc}40, var(--color-violet)40)`, filter: "blur(8px)" }} />
                <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl overflow-hidden border-2" style={{ borderColor: tc, background: "var(--color-void)" }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-display font-bold" style={{ color: tc }}>{user.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-black" style={{ background: tc }}>
                  LV.{user.level}
                </div>
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">{user.username}</h1>
                  <RankBadge rank={rank} size="md" />
                  {user.signature && (
                    <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full border font-mono" style={{ borderColor: `${tc}40`, color: tc }}>{user.signature}</span>
                  )}
                </div>
                {user.bio && <p className="text-sm text-white/50 mt-1.5 max-w-lg leading-relaxed">{user.bio}</p>}

                {/* Follower/Following + XP */}
                <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start flex-wrap">
                  <span className="text-xs text-[var(--color-mute)]">
                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  <span className="text-[var(--color-line)]">·</span>
                  <span className="text-xs"><span className="font-mono font-bold" style={{ color: tc }}>{user.followersCount}</span> <span className="text-[var(--color-mute)]">followers</span></span>
                  <span className="text-xs"><span className="font-mono font-bold" style={{ color: tc }}>{user.followingCount}</span> <span className="text-[var(--color-mute)]">following</span></span>
                  <span className="text-[var(--color-line)]">·</span>
                  <span className="text-xs"><span className="font-mono font-bold text-[var(--color-amber)]">{user.points.toLocaleString()}</span> <span className="text-[var(--color-mute)]">XP</span></span>
                </div>

                {/* XP Bar */}
                <div className="mt-3 max-w-xs mx-auto sm:mx-0">
                  <div className="h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${tc}, var(--color-violet))` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--color-mute)] mt-1 font-mono">{user.points.toLocaleString()} / {xpNeeded.toLocaleString()} XP to LV.{user.level + 1}</p>
                </div>

                {/* Rank Progress Bar */}
                <div className="mt-2 max-w-xs mx-auto sm:mx-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <RankPill rank={rank} />
                    {nextRank && (
                      <span className="text-[9px] font-mono text-[var(--color-mute)]">{nextRank.needed.toLocaleString()} XP to {nextRank.rank.icon} {nextRank.rank.label}</span>
                    )}
                  </div>
                  <div className="h-1 rounded-full bg-[var(--color-line)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rankPercent}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${rank.color}, ${rank.color}90)` }}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <Link
                href="/profile/edit"
                className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ border: `1px solid ${tc}40`, color: tc, background: `${tc}08` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${tc}18`; e.currentTarget.style.borderColor = `${tc}80`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${tc}08`; e.currentTarget.style.borderColor = `${tc}40`; }}
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6"
        >
          {[
            { label: "Total", value: stats.total, color: "var(--color-ink)" },
            { label: "Watching", value: stats.current, color: "var(--color-cyan)" },
            { label: "Planning", value: stats.planning, color: "var(--color-violet)" },
            { label: "Completed", value: stats.completed, color: "#22c55e" },
            { label: "Dropped", value: stats.dropped, color: "var(--color-magenta)" },
            { label: "Episodes", value: stats.episodesWatched, color: tc },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * i + 0.3 }}
              className="neon-premium rounded-xl cursor-default"
            >
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                <div className="text-[10px] sm:text-xs text-[var(--color-mute)] mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Completion Ring + Mean Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6"
        >
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-4 flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-line)" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${completionPercent * 0.974} 100`}
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ strokeDasharray: `${completionPercent * 0.974} 100` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#22c55e]">{completionPercent}%</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--color-ink)]">Completion</div>
                <div className="text-[10px] text-[var(--color-mute)]">{stats.completed}/{stats.total} anime</div>
              </div>
            </div>
          </div>
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: "#facc1515" }}>
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <div className="text-xl font-mono font-bold" style={{ color: "#facc15" }}>{stats.meanScore || "—"}</div>
                <div className="text-[10px] text-[var(--color-mute)]">Mean Score</div>
              </div>
            </div>
          </div>
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-cyan)]/10">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <div className="text-xl font-mono font-bold text-[var(--color-cyan)]">{user.level}</div>
                <div className="text-[10px] text-[var(--color-mute)]">Level</div>
              </div>
            </div>
          </div>
          <div className="neon-premium rounded-xl">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-magenta)]/10">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-xl font-mono font-bold text-[var(--color-magenta)]">{user.achievements.length}</div>
                <div className="text-[10px] text-[var(--color-mute)]">Achievements</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="border-b border-[var(--color-line)] mb-6">
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto flex-nowrap -mb-px">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  tab === t.key ? "text-[var(--color-ink)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="mr-1.5 opacity-60">{t.icon}</span>
                {t.label}
                {tab === t.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: tc }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Status Filters (entries tab only) */}
          <AnimatePresence>
            {tab === "entries" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 mt-3 overflow-hidden"
              >
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-full transition-all ${
                      statusFilter === s
                        ? "text-black scale-105"
                        : "text-[var(--color-mute)] border border-[var(--color-line)] hover:border-current"
                    }`}
                    style={statusFilter === s ? { background: STATUS_COLORS[s] || tc } : {}}
                  >
                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    {s !== "ALL" && (
                      <span className="ml-1 opacity-70">
                        {user.entries.filter((e) => e.status === s).length}
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Top Anime Showcase */}
                {user.entries.filter((e) => e.type === "ANIME" && e.status === "COMPLETED" && e.score && e.score > 0).length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full" style={{ background: tc }} />
                      Top Rated Anime
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {user.entries
                        .filter((e) => e.type === "ANIME" && e.status === "COMPLETED" && e.score && e.score > 0)
                        .sort((a, b) => (b.score || 0) - (a.score || 0))
                        .slice(0, 8)
                        .map((e, i) => {
                          const m = mediaCache[e.mediaId];
                          return (
                            <Link
                              key={e.mediaId}
                              href={`/anime/${e.mediaId}`}
                              className="shrink-0 w-28 sm:w-32 group"
                            >
                              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-line)] group-hover:border-transparent transition-all">
                                {m?.cover ? (
                                  <img src={m.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full bg-[var(--color-line)] animate-pulse" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-black" style={{ background: tc }}>#{i + 1}</div>
                                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                  <span className="text-[10px] font-mono font-bold text-[var(--color-amber)]">★ {e.score}/10</span>
                                </div>
                              </div>
                              <p className="text-[10px] sm:text-xs mt-1.5 truncate text-[var(--color-mute)] group-hover:text-[var(--color-ink)] transition-colors">{m?.title || `#${e.mediaId}`}</p>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {user.recentActivity.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full bg-[var(--color-cyan)]" />
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {user.recentActivity.slice(0, 8).map((a) => (
                        <div key={a.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5">
                          <span className="text-base shrink-0">{ACTIVITY_ICONS[a.type] || "◆"}</span>
                          <div className="min-w-0 flex-1">
                            {a.mediaTitle ? (
                              <Link href={`/${a.type.includes("manga") ? "manga" : "anime"}/${a.mediaId}`} className="text-xs font-medium hover:text-[var(--color-cyan)] truncate block">
                                {a.mediaTitle}
                              </Link>
                            ) : (
                              <span className="text-xs text-[var(--color-mute)]">{a.message || a.type.replace(/_/g, " ")}</span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-[var(--color-mute)] shrink-0">{timeAgo(a.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements Showcase */}
                {user.achievements.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full bg-[var(--color-amber)]" />
                      Recent Achievements
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {user.achievements.slice(0, 8).map((a) => (
                        <motion.div
                          key={a.code}
                          whileHover={{ scale: 1.03, y: -2 }}
                          className="neon-premium rounded-xl cursor-default"
                          style={{ boxShadow: `0 0 15px ${tc}08` }}
                        >
                          <div className="neon-premium-track rounded-xl" />
                          <div className="neon-premium-overlay rounded-[10.5px]" />
                          <div className="neon-premium-content p-3 text-center">
                            <div className="text-2xl mb-1">{a.icon}</div>
                            <div className="text-[10px] font-bold text-[var(--color-ink)] leading-tight">{a.name}</div>
                            <div className="text-[9px] font-mono mt-1" style={{ color: tc }}>+{a.points} XP</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty Overview State */}
                {user.entries.length === 0 && user.recentActivity.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📡</div>
                    <p className="font-display text-lg text-[var(--color-ink)]">Your signal is just getting started</p>
                    <p className="text-sm text-[var(--color-mute)] mt-1">Add anime to your list to see your profile come alive</p>
                    <Link href="/search" className="inline-block mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105" style={{ background: tc }}>
                      Browse Anime
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ENTRIES TAB */}
            {tab === "entries" && (
              <div className="mt-2">
                {/* View Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-[var(--color-mute)] font-mono">{filteredEntries.length} entries</p>
                  <div className="flex gap-1">
                    <button onClick={() => setListView("grid")} className={`p-1.5 rounded-lg transition-colors ${listView === "grid" ? "bg-[var(--color-line)]" : "text-[var(--color-mute)]"}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    </button>
                    <button onClick={() => setListView("list")} className={`p-1.5 rounded-lg transition-colors ${listView === "list" ? "bg-[var(--color-line)]" : "text-[var(--color-mute)]"}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                {filteredEntries.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[var(--color-mute)]">
                    No entries. <Link href="/search" className="hover:underline" style={{ color: tc }}>Browse anime</Link>
                  </p>
                ) : listView === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredEntries.map((e) => {
                      const m = mediaCache[e.mediaId];
                      const sc = STATUS_COLORS[e.status] || "var(--color-mute)";
                      return (
                        <Link key={`${e.mediaId}-${e.status}`} href={`/${e.type.toLowerCase()}/${e.mediaId}`} className="group">
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-line)] group-hover:border-transparent transition-all duration-300" style={{ ["--tw-shadow-color" as string]: sc }}>
                            {m?.cover ? (
                              <img src={m.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-[var(--color-line)] flex items-center justify-center">
                                <span className="text-xs text-[var(--color-mute)] font-mono">#{e.mediaId}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {/* Status badge top-right */}
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold text-black" style={{ background: sc }}>{e.status}</div>
                            {/* Hover info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <div className="text-[10px] font-medium text-white leading-tight mb-1">{m?.title || `Anime #${e.mediaId}`}</div>
                              {e.progress > 0 && (
                                <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${e.total ? (e.progress / e.total) * 100 : 100}%`, background: sc }} />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {e.progress > 0 && <span className="text-[8px] font-mono text-white/70">{e.progress}/{e.total || "?"}</span>}
                                {e.score && <span className="text-[8px] font-mono" style={{ color: "var(--color-amber)" }}>★ {e.score}</span>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredEntries.map((e) => {
                      const m = mediaCache[e.mediaId];
                      const sc = STATUS_COLORS[e.status] || "var(--color-mute)";
                      return (
                        <Link
                          key={`${e.mediaId}-${e.status}`}
                          href={`/${e.type.toLowerCase()}/${e.mediaId}`}
                          className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2.5 hover:border-current/40 transition-all group"
                          style={{ ["--tw-border-opacity" as string]: "1" }}
                        >
                          <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-line)]">
                            {m?.cover && <img src={m.cover} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate group-hover:text-[var(--color-cyan)] transition-colors">{m?.title || `Anime #${e.mediaId}`}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {e.progress > 0 && <span className="text-[10px] font-mono text-[var(--color-mute)]">{e.progress}/{e.total || "?"} eps</span>}
                              {e.score && <span className="text-[10px] font-mono text-[var(--color-amber)]">★ {e.score}</span>}
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: `${sc}20`, color: sc }}>{e.status}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS TAB */}
            {tab === "reviews" && (
              <div className="mt-2 space-y-3">
                {user.reviews.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[var(--color-mute)]">No reviews yet.</p>
                ) : (
                  user.reviews.map((r) => {
                    const m = mediaCache[r.mediaId];
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-line)] transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {m?.cover && (
                            <Link href={`/anime/${r.mediaId}`} className="shrink-0">
                              <img src={m.cover} alt="" className="w-12 h-16 rounded-lg object-cover" />
                            </Link>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <Link href={`/anime/${r.mediaId}`} className="text-sm font-semibold hover:text-[var(--color-cyan)] truncate">
                                {m?.title || `Media #${r.mediaId}`}
                              </Link>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: "#facc1520", color: "#facc15" }}>{r.rating}/10</span>
                                <span className="text-[10px] text-[var(--color-mute)] font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {r.comment && <p className="mt-2 text-xs text-[var(--color-mute)] leading-relaxed">{r.comment}</p>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* LISTS TAB */}
            {tab === "lists" && (
              <div className="mt-2">
                <ProfileLists userId={user.id} themeColor={tc} />
              </div>
            )}

            {/* STATS TAB */}
            {tab === "stats" && <StatsDashboard />}

            {/* HISTORY TAB */}
            {tab === "history" && <WatchHistory />}

            {/* IMPORT TAB */}
            {tab === "import" && (
              <div className="mt-2">
                <div className="neon-premium rounded-xl">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content p-6">
                    <h3 className="font-display text-sm font-bold mb-1 flex items-center gap-2">
                      <span className="h-1 w-4 rounded-full" style={{ background: tc }} />
                      Import from AniList
                    </h3>
                    <p className="text-xs text-[var(--color-mute)] mb-4">
                      Enter your AniList username to import your entire anime watchlist.
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="AniList username"
                        value={anilistUsername}
                        onChange={(e) => { setAnilistUsername(e.target.value); setImportResult(null); setImportError(null); }}
                        className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors"
                        style={{ ["--tw-ring-color" as string]: tc }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = `${tc}60`; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = ""; }}
                      />
                      <button
                        onClick={async () => {
                          if (!anilistUsername.trim()) return;
                          setImporting(true); setImportResult(null); setImportError(null);
                          try {
                            const res = await fetch("/api/import/anilist", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ username: anilistUsername.trim() }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "Import failed");
                            setImportResult(data);
                          } catch (err: any) { setImportError(err.message); }
                          finally { setImporting(false); }
                        }}
                        disabled={importing || !anilistUsername.trim()}
                        className="rounded-lg px-5 py-2 text-sm font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        style={{ background: tc }}
                      >
                        {importing ? "Importing..." : "Import"}
                      </button>
                    </div>
                    {importResult && (
                      <p className="mt-3 text-sm text-green-400">
                        Imported {importResult.imported} of {importResult.total} entries.
                      </p>
                    )}
                    {importError && <p className="mt-3 text-sm text-[var(--color-magenta)]">{importError}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* API TAB */}
            {tab === "api" && <ApiKeyManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </ErrorBoundary>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function ProfileLists({ userId, themeColor }: { userId: string; themeColor: string }) {
  const [lists, setLists] = useState<Array<{ id: string; title: string; type: string; isPublic: boolean; itemCount: number; likes: number; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lists?userId=${userId}&sort=recent&limit=50`)
      .then((r) => r.json())
      .then((d) => setLists(d.lists || []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--color-panel)]" />)}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[var(--color-mute)] font-mono">{lists.length} list{lists.length !== 1 ? "s" : ""}</p>
        <Link href="/lists/create" className="neon-premium rounded-lg">
          <div className="neon-premium-track rounded-lg" />
          <div className="neon-premium-overlay rounded-[6.5px]" />
          <div className="neon-premium-content px-5 py-2.5 text-sm font-semibold text-black text-center" style={{ background: themeColor }}>Create List</div>
        </Link>
      </div>
      {lists.length === 0 ? (
        <p className="py-12 text-center text-sm text-[var(--color-mute)]">No custom lists yet.</p>
      ) : (
        <div className="space-y-2">
          {lists.map((l) => (
            <Link key={l.id} href={`/lists/${l.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 hover:border-current/40 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate group-hover:text-[var(--color-cyan)] transition-colors">{l.title}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5 font-mono">
                  {l.itemCount} items · ♥ {l.likes} · {!l.isPublic && "Private · "}{l.type} · {new Date(l.createdAt).toLocaleDateString()}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] group-hover:text-[var(--color-cyan)] shrink-0 ml-2 transition-colors">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
