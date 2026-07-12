"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import Loader, { ErrorState } from "@/components/Loader";
import { getTrending, getPopular, getTopRated, getSeasonal, bestTitle } from "@/lib/anilist";
import { getUserLeaderboard } from "@/lib/leaderboard";
import type { Media } from "@/lib/anilist";
import type { UserLeaderboardEntry } from "@/lib/leaderboard";

type Tab = "trending" | "popular" | "toprated" | "seasonal" | "users";

const TABS: { key: Tab; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Most Popular" },
  { key: "toprated", label: "Top Rated" },
  { key: "seasonal", label: "Seasonal" },
  { key: "users", label: "Top Users" },
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

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span className="text-2xl drop-shadow-lg">{MEDALS[rank - 1]}</span>;
  }
  return (
    <span className="font-mono text-lg font-black text-[var(--color-mute)] w-8 text-center">
      #{rank}
    </span>
  );
}

function UserRow({ item, rank, index }: { item: UserLeaderboardEntry; rank: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025, type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex items-center gap-3 sm:gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 sm:p-4 transition-all hover:border-[var(--color-violet)]/40 hover:shadow-lg"
    >
      <div className="flex items-center justify-center w-10 shrink-0">
        <RankBadge rank={rank} />
      </div>

      <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-[var(--color-line)] bg-[var(--color-void)]">
        {item.avatar ? (
          <img src={item.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[var(--color-mute)]">
            {item.username[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="font-display text-sm font-bold">{item.username}</span>
        <div className="flex flex-wrap gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-[var(--color-cyan)]">Lv.{item.level}</span>
          <span className="text-[10px] text-[var(--color-mute)]">{item.achievements} achievements</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="font-mono text-sm font-bold text-[var(--color-amber)]">{item.points.toLocaleString()}</span>
        <div className="text-[10px] text-[var(--color-mute)]">points</div>
      </div>
    </motion.div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = score;
  const color =
    score >= 80 ? "var(--color-cyan)" : score >= 60 ? "var(--color-emerald)" : score >= 40 ? "var(--color-amber)" : "var(--color-magenta)";
  return (
    <div className="flex items-center gap-2 w-full max-w-[140px]">
      <span className="font-mono text-xs font-bold shrink-0 w-8 text-right" style={{ color }}>
        {score.toFixed(1)}
      </span>
      <div className="h-1.5 w-full rounded-full bg-[var(--color-line)]/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function LeaderboardRow({ item, rank, index }: { item: Media; rank: number; index: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025, type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex items-center gap-3 sm:gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 sm:p-4 transition-all hover:border-[var(--color-cyan)]/40 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-10 shrink-0">
        <RankBadge rank={rank} />
      </div>

      {/* Cover */}
      <Link href={`/anime/${item.id}`} className="shrink-0 relative">
        <div className="relative h-16 w-12 sm:h-20 sm:w-14 overflow-hidden rounded-lg border border-[var(--color-line)]">
          {item.coverImage?.large || item.coverImage?.extraLarge ? (
            <Image src={item.coverImage.extraLarge || item.coverImage.large || ""} alt=""
              onLoadingComplete={() => setImgLoaded(true)}
              fill
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 640px) 48px, 56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-line)]/20" />
          )}
          <div className={`absolute inset-0 bg-[var(--color-panel)] transition-opacity duration-500 ${imgLoaded ? "opacity-0" : "opacity-100"}`} />
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link href={`/anime/${item.id}`} className="hover:text-[var(--color-cyan)] transition-colors">
          <h3 className="font-display text-sm sm:text-base font-bold leading-tight truncate">
            {bestTitle(item.title)}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {item.format && (
            <span className="text-[10px] font-mono text-[var(--color-mute)] uppercase">{item.format.replace(/_/g, " ")}</span>
          )}
          {item.episodes && (
            <span className="text-[10px] text-[var(--color-mute)]">{item.episodes} ep</span>
          )}
          {item.status && (
            <span className="text-[10px] text-[var(--color-mute)] capitalize">{item.status.replace(/_/g, " ")}</span>
          )}
        </div>
        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.genres.slice(0, 3).map((g) => (
              <Link key={g} href={`/genre/${g.toLowerCase()}`}
                className="text-[10px] sm:text-[9px] font-medium text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors rounded bg-[var(--color-line)]/20 px-1.5 py-0.5"
              >{g}</Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        {item.averageScore != null && <ScoreBar score={item.averageScore} />}
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
          {item.popularity != null && (
            <span title="Popularity">♥ {formatNumber(item.popularity)}</span>
          )}
          {item.favourites != null && item.favourites > 0 && (
            <span title="Favorites">☆ {formatNumber(item.favourites)}</span>
          )}
        </div>
      </div>

      {/* Mobile mini score */}
      <div className="sm:hidden shrink-0 text-right">
        {item.averageScore != null && (
          <span className="font-mono text-sm font-bold" style={{ color: item.averageScore >= 75 ? "var(--color-cyan)" : item.averageScore >= 50 ? "var(--color-amber)" : "var(--color-magenta)" }}>
            {item.averageScore.toFixed(0)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

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

  const fetchData = async (t: Tab) => {
    setLoading(true);
    setError(null);
    dataRef.current = t;
    try {
      if (t === "users") {
        const result = await getUserLeaderboard(50);
        if (dataRef.current === t) {
          setUserData(result.entries);
          setUserTotal(result.total);
        }
      } else {
        let items: Media[];
        if (t === "trending") items = await getTrending(50);
        else if (t === "popular") items = await getPopular(50);
        else if (t === "toprated") items = await getTopRated(50);
        else {
          const res = await getSeasonal(seasonYear, seasonName, 50);
          items = res.media;
        }
        if (dataRef.current === t) setData(items);
      }
    } catch (e: any) {
      if (dataRef.current === t) setError(e.message || "Failed to load data");
    } finally {
      if (dataRef.current === t) setLoading(false);
    }
  };

  useEffect(() => { fetchData(tab); }, [tab, seasonYear, seasonName]);

  const heading =
    tab === "trending" ? "Trending Now" :
    tab === "popular" ? "Most Popular" :
    tab === "toprated" ? "Top Rated" :
    tab === "users" ? "Top Users" : `${seasonName} ${seasonYear}`;

  const subtitle =
    tab === "trending" ? "What the world is watching right now." :
    tab === "popular" ? "The all-time fan favorites." :
    tab === "toprated" ? "The highest-scored anime of all time." :
    "Discover the best anime this season.";

  return (
    <PageTransition>
      <ErrorBoundary label="Leaderboard"><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Leaderboard</p>
          <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight mt-1">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">{subtitle}</p>
          <p className="mt-1 text-[10px] text-[var(--color-mute)] font-mono">
            Powered by AniList community data
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-[var(--color-cyan)] text-black"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
              }`}
            >
              {tab === t.key && (
                <motion.span layoutId="leaderboardTab"
                  className="absolute inset-0 rounded-full bg-[var(--color-cyan)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
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
                <select value={seasonName} onChange={(e) => setSeasonName(e.target.value)}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-mono text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <select value={seasonYear} onChange={(e) => setSeasonYear(Number(e.target.value))}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-mono text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        {loading && <Loader label={`Loading ${heading}...`} />}
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {tab === "users" ? (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  {userData.length > 0 ? (
                    userData.map((item, i) => (
                      <UserRow key={item.userId} item={item} rank={i + 1} index={i} />
                    ))
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
                  className="space-y-2"
                >
                  {data.length > 0 ? (
                    data.map((item, i) => (
                      <LeaderboardRow key={item.id} item={item} rank={i + 1} index={i} />
                    ))
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-[var(--color-mute)]">No data available.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div></ErrorBoundary>
    </PageTransition>
  );
}
