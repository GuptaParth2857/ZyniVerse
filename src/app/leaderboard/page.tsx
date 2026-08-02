"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import Loader, { ErrorState } from "@/components/Loader";
import RankBadge from "@/components/RankBadge";
import { getRank } from "@/lib/achievements";
import { getTrending, getPopular, getTopRated, getSeasonal, bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

interface UserLeaderboardEntry {
  userId: string;
  username: string;
  avatar: string | null;
  points: number;
  level: number;
  achievements: number;
}

type Tab = "trending" | "popular" | "toprated" | "seasonal" | "users";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "trending", label: "Trending", icon: "🔥" },
  { key: "popular", label: "Most Popular", icon: "♥" },
  { key: "toprated", label: "Top Rated", icon: "⭐" },
  { key: "seasonal", label: "Seasonal", icon: "🌸" },
  { key: "users", label: "Top Users", icon: "🏆" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_SEASON =
  CURRENT_MONTH <= 3 ? "WINTER" : CURRENT_MONTH <= 6 ? "SPRING" : CURRENT_MONTH <= 9 ? "SUMMER" : "FALL";

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function PodiumCard({ item, rank }: { item: UserLeaderboardEntry; rank: number }) {
  const userRank = getRank(item.points);
  const colors = ["#FFD700", "var(--color-cyan)", "#CD7F32"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.15, type: "spring", stiffness: 200, damping: 20 }}
      className="neon-rgb-border rounded-2xl flex flex-col items-center"
    >
      <div className="rounded-2xl bg-[var(--color-panel)] flex flex-col items-center justify-center gap-2 px-5 py-6">
        {/* Rank medal */}
        <span className="text-4xl">{MEDALS[rank - 1]}</span>

        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden" style={{ boxShadow: `0 0 24px ${colors[rank - 1]}40` }}>
            {item.avatar ? (
              <Image src={item.avatar} alt="" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold" style={{ color: colors[rank - 1], background: `${colors[rank - 1]}15` }}>
                {item.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <p className="font-display text-sm font-bold text-center truncate max-w-[130px]">{item.username}</p>

        {/* Rank badge */}
        <RankBadge rank={userRank} size="sm" animate={false} />

        {/* Points */}
        <div className="px-3 py-1.5 rounded-full" style={{ background: `${colors[rank - 1]}18`, border: `1px solid ${colors[rank - 1]}30` }}>
          <span className="font-mono text-xs font-bold" style={{ color: colors[rank - 1] }}>
            {item.points.toLocaleString()} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function UserCard({ item, rank, index }: { item: UserLeaderboardEntry; rank: number; index: number }) {
  const userRank = getRank(item.points);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, type: "spring", stiffness: 260, damping: 24 }}
      className="neon-rgb-border rounded-xl group"
    >
      <div className="rounded-xl bg-[var(--color-panel)] flex flex-col items-center p-4 gap-2 relative">
        {/* Rank */}
        <div className="absolute top-2 left-2">
          <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ color: "var(--color-mute)", background: "var(--color-line)", border: "1px solid var(--color-line)" }}>
            #{rank}
          </span>
        </div>

        {/* Avatar */}
        <div className="relative mt-2">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[var(--color-line)] bg-[var(--color-void)] group-hover:ring-[var(--color-cyan)]/50 transition-all duration-300">
            {item.avatar ? (
              <Image src={item.avatar} alt="" width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[var(--color-mute)]">
                {item.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <RankBadge rank={userRank} size="sm" animate={false} />
          </div>
        </div>

        {/* Name */}
        <span className="font-display text-sm font-bold text-center truncate max-w-full">{item.username}</span>

        {/* Rank label */}
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ color: userRank.color, background: `${userRank.color}15`, border: `1px solid ${userRank.color}30` }}>
          {userRank.label}
        </span>

        {/* Level + achievements */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="font-mono text-[var(--color-cyan)]">Lv.{item.level}</span>
          <span className="text-[var(--color-mute)]">{item.achievements} ach</span>
        </div>

        {/* Points */}
        <div className="mt-auto px-3 py-1.5 rounded-full w-full text-center" style={{ background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)" }}>
          <span className="font-mono text-xs font-bold text-[var(--color-amber)]">
            {item.points.toLocaleString()} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AnimeCard({ item, rank, index }: { item: Media; rank: number; index: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const scoreColor =
    item.averageScore != null
      ? item.averageScore >= 80 ? "var(--color-cyan)" : item.averageScore >= 60 ? "#22c55e" : item.averageScore >= 40 ? "var(--color-amber)" : "var(--color-magenta)"
      : "var(--color-mute)";

  const isTop3 = rank <= 3;
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankLabels = ["1st", "2nd", "3rd"];
  const rankColor = isTop3 ? rankColors[rank - 1] : "#fff";

  const title = bestTitle(item.title);

  const animationDelay = Math.min(index * 0.03, 0.5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, type: "spring", stiffness: 260, damping: 24 }}
      className="neon-rgb-border rounded-xl group"
    >
      <Link href={`/anime/${item.id}`} className="relative block aspect-[3/4] rounded-xl overflow-hidden">
        {/* Full-bleed cover */}
        {item.coverImage?.extraLarge || item.coverImage?.large ? (
          <Image
            src={item.coverImage.extraLarge || item.coverImage.large || ""}
            alt={title}
            fill
            loading="lazy"
            onLoadingComplete={() => setImgLoaded(true)}
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-line)]/20 text-[var(--color-mute)]">No Image</div>
        )}

        {/* Loading placeholder */}
        <div className={`absolute inset-0 bg-[var(--color-panel)] transition-opacity duration-500 ${imgLoaded ? "opacity-0" : "opacity-100"}`} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Always visible: rank badge - corner */}
        <div className="absolute top-2 left-2 z-10">
          {isTop3 ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md font-mono text-xs font-black"
              style={{ background: `${rankColor}30`, color: rankColor, border: `1px solid ${rankColor}50`, boxShadow: `0 0 12px ${rankColor}30` }}>
              <span className="text-sm">{MEDALS[rank - 1]}</span>
              <span>{rankLabels[rank - 1]}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-7 h-7 rounded-full backdrop-blur-md font-mono text-[11px] font-black text-white/80"
              style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
              #{rank}
            </div>
          )}
        </div>

        {/* Always visible: score badge - top right */}
        {item.averageScore != null && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md text-xs font-mono font-bold"
            style={{ background: `${scoreColor}25`, color: scoreColor, border: `1px solid ${scoreColor}40` }}>
            ★ {item.averageScore.toFixed(0)}
          </div>
        )}

        {/* Hover content: bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10">
          {/* Title */}
          <h3 className="font-display text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.genres?.slice(0, 3).map((g) => (
              <span key={g} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {g}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {item.format && (
              <span className="text-[9px] font-mono text-white/50 uppercase px-1.5 py-0.5 rounded bg-white/10">{item.format.replace(/_/g, " ")}</span>
            )}
            {item.episodes && (
              <span className="text-[9px] text-white/50">{item.episodes} ep</span>
            )}
          </div>

          {/* Score bar */}
          {item.averageScore != null && (
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.averageScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + index * 0.03 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40">
            {item.popularity != null && (
              <span>♥ {formatNumber(item.popularity)}</span>
            )}
            {item.favourites != null && item.favourites > 0 && (
              <span>★ {formatNumber(item.favourites)}</span>
            )}
            {item.trending != null && item.trending > 0 && (
              <span style={{ color: "var(--color-cyan)" }}>🔥 {formatNumber(item.trending)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

type CacheEntry = { data: Media[]; userData?: UserLeaderboardEntry[]; userTotal?: number };
const cache = new Map<string, CacheEntry>();

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("trending");
  const [data, setData] = useState<Media[]>([]);
  const [userData, setUserData] = useState<UserLeaderboardEntry[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonYear, setSeasonYear] = useState(CURRENT_YEAR);
  const [seasonName, setSeasonName] = useState(CURRENT_SEASON);
  const dataRef = useRef<Tab | null>(null);
  const seasonYearRef = useRef(seasonYear);
  const seasonNameRef = useRef(seasonName);
  const seasonDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { seasonYearRef.current = seasonYear; }, [seasonYear]);
  useEffect(() => { seasonNameRef.current = seasonName; }, [seasonName]);

  const fetchData = useCallback(async (t: Tab) => {
    const sy = seasonYearRef.current;
    const sn = seasonNameRef.current;
    const cacheKey = t === "seasonal" ? `${t}-${sy}-${sn}` : t;

    const cached = cache.get(cacheKey);
    if (cached) {
      setData(cached.data);
      if (cached.userData) setUserData(cached.userData);
      if (cached.userTotal != null) setUserTotal(cached.userTotal);
      if (t !== dataRef.current) return;
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    dataRef.current = t;
    try {
      if (t === "users") {
        const res = await fetch("/api/leaderboard?limit=50");
        const result = await res.json();
        if (dataRef.current === t) {
          const entries = result.entries || [];
          const total = result.total || 0;
          setUserData(entries);
          setUserTotal(total);
          cache.set(cacheKey, { data: [], userData: entries, userTotal: total });
        }
      } else {
        let items: Media[];
        if (t === "seasonal") {
          const result = await getSeasonal(sy, sn, 24);
          items = result.media || [];
        } else {
          const fetcher: Record<string, (p?: number) => Promise<Media[]>> = {
            trending: getTrending,
            popular: getPopular,
            toprated: getTopRated,
          };
          items = await fetcher[t](24);
        }
        if (dataRef.current === t) {
          setData(items);
          cache.set(cacheKey, { data: items });
        }
      }
    } catch (e: unknown) {
      if (dataRef.current === t) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      }
    } finally {
      if (dataRef.current === t) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(tab); }, [tab, fetchData]);

  // Debounce seasonal filter changes (300ms)
  useEffect(() => {
    if (tab !== "seasonal") return;
    if (seasonDebounceRef.current) clearTimeout(seasonDebounceRef.current);
    seasonDebounceRef.current = setTimeout(() => fetchData("seasonal"), 300);
    return () => { if (seasonDebounceRef.current) clearTimeout(seasonDebounceRef.current); };
  }, [seasonYear, seasonName, tab, fetchData]);

  // Auto-refresh every 5 minutes (only for non-cached tabs)
  useEffect(() => {
    const interval = setInterval(() => {
      const key = dataRef.current;
      if (key) cache.delete(key === "seasonal" ? `${key}-${seasonYearRef.current}-${seasonNameRef.current}` : key);
      if (dataRef.current) fetchData(dataRef.current);
    }, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const heading =
    tab === "trending" ? "Trending Now" :
    tab === "popular" ? "Most Popular" :
    tab === "toprated" ? "Top Rated" :
    tab === "users" ? "Top Users" : `${seasonName} ${seasonYear}`;

  const subtitle =
    tab === "trending" ? "What the world is watching right now." :
    tab === "popular" ? "The all-time fan favorites." :
    tab === "toprated" ? "The highest-scored anime of all time." :
    tab === "users" ? "Community members with the most XP." :
    "Discover the best anime this season.";

  const top3 = userData.slice(0, 3);
  const restUsers = userData.slice(3);

  return (
    <PageTransition>
      <ErrorBoundary label="Leaderboard">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
              {"// Leaderboard"}
            </p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight mt-1">
                <span className="neon-text-gradient">{heading}</span>
              </h1>
            </div>
            <p className="mt-2 text-sm text-[var(--color-mute)]">{subtitle}</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative rounded-full px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  tab === t.key
                    ? "text-black"
                    : "text-[var(--color-mute)] neon-rgb-border"
                }`}
              >
                {tab === t.key && (
                  <motion.span layoutId="leaderboardTab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.icon}</span>
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}

            {/* Seasonal picker */}
            <AnimatePresence>
              {tab === "seasonal" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 ml-auto"
                >
                  <div className="neon-rgb-border rounded-lg">
                    <select value={seasonName} onChange={(e) => setSeasonName(e.target.value)}
                      className="rounded-lg bg-[var(--color-panel)] px-3 py-1.5 text-xs font-mono text-[var(--color-ink)] outline-none border-0"
                    >
                      {SEASONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="neon-rgb-border rounded-lg">
                    <select value={seasonYear} onChange={(e) => setSeasonYear(Number(e.target.value))}
                      className="rounded-lg bg-[var(--color-panel)] px-3 py-1.5 text-xs font-mono text-[var(--color-ink)] outline-none border-0"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          {error && <ErrorState message={error} onRetry={() => fetchData(tab)} />}

          {!error && (
            <AnimatePresence mode="wait">
              {tab === "users" ? (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {userData.length > 0 ? (
                    <>
                      {/* Top 3 Podium */}
                      {top3.length >= 3 && (
                        <div className="flex items-end justify-center gap-3 sm:gap-4 mb-8 px-4">
                          <PodiumCard item={top3[1]} rank={2} />
                          <PodiumCard item={top3[0]} rank={1} />
                          <PodiumCard item={top3[2]} rank={3} />
                        </div>
                      )}

                      {/* Rest as grid cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {(top3.length >= 3 ? restUsers : userData).map((item, i) => (
                          <UserCard key={item.userId} item={item} rank={top3.length >= 3 ? i + 4 : i + 1} index={i} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-[var(--color-mute)]">No users with points yet.</p>
                    </div>
                  )}
                  {userTotal > 50 && (
                    <p className="text-center text-[10px] text-[var(--color-mute)] font-mono mt-4">
                      Showing top 50 of {userTotal} users
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={`${tab}-${seasonYear}-${seasonName}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                >
                    {data.length > 0 ? (
                      data.map((item, i) => (
                        <AnimeCard key={item.id} item={item} rank={i + 1} index={i} />
                      ))
                    ) : (
                      <div className="py-16 text-center col-span-full">
                        <p className="text-[var(--color-mute)]">No data available.</p>
                        <button onClick={() => fetchData(tab)}
                          className="mt-3 rounded-full border border-[var(--color-cyan)]/40 px-5 py-2 text-xs font-medium text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/10"
                        >Retry</button>
                      </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {loading && <Loader label={`Loading ${heading}...`} />}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
