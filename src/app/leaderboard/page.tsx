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
import { bestTitle } from "@/lib/anilist";
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

const HERO_TAGS = [
  { label: "Shonen", emoji: "🥷", color: "#f97316" },
  { label: "Action", emoji: "⚔️", color: "#ef4444" },
  { label: "Romance", emoji: "💖", color: "#f472b6" },
  { label: "Fantasy", emoji: "✨", color: "#a78bfa" },
  { label: "Slice of Life", emoji: "🍵", color: "#34d399" },
];

const HERO_STATS = [
  { icon: "🔥", label: "Live Rankings" },
  { icon: "📈", label: "Updated Daily" },
  { icon: "🏆", label: "Community Voted" },
];

const TICKER_ITEMS = [
  { label: "Trending", emoji: "🔥", color: "#fb923c" },
  { label: "Popular", emoji: "♥", color: "#f87171" },
  { label: "Top Rated", emoji: "⭐", color: "#facc15" },
  { label: "Seasonal", emoji: "🌸", color: "#f472b6" },
  { label: "Top Users", emoji: "🏆", color: "#a78bfa" },
  { label: "Updated Daily", emoji: "📈", color: "#22d3ee" },
  { label: "Fan Picks", emoji: "💜", color: "#a78bfa" },
  { label: "New Arrivals", emoji: "🎬", color: "#34d399" },
];

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
            onLoad={() => setImgLoaded(true)}
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
          const result = await fetch(`/api/anilist/seasonal?year=${sy}&season=${sn}&perPage=24`).then((r) => r.json());
          items = result.media || [];
        } else {
          const endpoints: Record<string, string> = {
            trending: "/api/anilist/trending?perPage=24",
            popular: "/api/anilist/popular?perPage=24",
            toprated: "/api/anilist/top-rated?perPage=24",
          };
          items = await fetch(endpoints[t]).then((r) => r.json());
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
      if (document.hidden) return;
      const key = dataRef.current;
      if (key) cache.delete(key === "seasonal" ? `${key}-${seasonYearRef.current}-${seasonNameRef.current}` : key);
      if (dataRef.current) fetchData(dataRef.current);
    }, 600000);
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
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* Background glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
            style={{
              background:
                "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
            }}
          />

          {/* Hero */}
          <section className="neon-rgb-border relative overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-20">
            <div className="neon-banner-card pointer-events-none absolute inset-0" />

            {/* Top shine line */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* Scanline sweep */}
            <div aria-hidden className="scanline-sweep" />

            {/* HUD corner brackets */}
            <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--color-cyan)]/50" />
            <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--color-cyan)]/50" />
            <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--color-magenta)]/50" />
            <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--color-magenta)]/50" />

            {/* Floating emojis (desktop) */}
            <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">🏆</span>
            <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>🔥</span>
            <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>👑</span>
            <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>📊</span>

            {/* Breathing orbs */}
            <div aria-hidden className="pointer-events-none absolute left-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-cyan)]/25 blur-[55px] float-anim md:block" />
            <div aria-hidden className="pointer-events-none absolute right-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-magenta)]/25 blur-[55px] float-anim md:block" style={{ animationDelay: "1.5s" }} />

            <div className="relative z-10 mx-auto max-w-3xl px-6">
              {/* Rotating conic halo behind title */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                style={{
                  background: "conic-gradient(from 0deg, var(--color-magenta), var(--color-cyan), var(--color-violet), var(--color-magenta))",
                  animation: "spin 10s linear infinite",
                }}
              />

              <div className="relative">
                <p className="console-label mb-4 flex animate-hero-text items-center justify-center gap-2" style={{ animationDelay: "0.05s" }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                  </span>
                  {"// Leaderboard · Live Rankings"}
                </p>

                <h1
                  className="neon-text-gradient animate-hero-text font-display text-4xl font-black tracking-tight sm:text-6xl"
                  style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
                >
                  {heading}
                </h1>

                <p className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base" style={{ animationDelay: "0.25s" }}>
                  {subtitle}
                </p>

                {/* Stats */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {HERO_STATS.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] backdrop-blur-sm"
                    >
                      {s.icon} {s.label}
                    </span>
                  ))}
                </div>

                {/* Genre chips */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {HERO_TAGS.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:brightness-125"
                      style={{ color: tag.color, borderColor: `${tag.color}55`, background: `${tag.color}14` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color, boxShadow: `0 0 8px ${tag.color}` }} />
                      {tag.emoji} {tag.label}
                    </span>
                  ))}
                </div>

                {/* Scroll hint */}
                <div className="mt-6 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-mute)]">
                    Scroll to explore
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce text-[var(--color-cyan)]">
                    <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Neon marquee ticker band */}
            <div aria-hidden className="ticker-window relative z-10 mt-8 border-t border-[var(--color-line)] bg-[var(--color-void)]/40 py-3">
              <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-8">
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                  <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                    <span className="text-base leading-none" style={{ textShadow: `0 0 10px ${t.color}aa` }}>{t.emoji}</span>
                    <span className="text-[var(--color-mute)]">{t.label}</span>
                    <span className="ml-6 select-none text-[var(--color-magenta)]/40">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

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
                        <div className="flex items-end justify-start sm:justify-center gap-2 sm:gap-4 mb-8 px-4 overflow-x-auto scrollbar-none">
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
