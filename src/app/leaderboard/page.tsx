"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import Loader, { ErrorState } from "@/components/Loader";
import { getTrending, getPopular, getTopRated, getSeasonal, bestTitle } from "@/lib/anilist";
import RankBadge from "@/components/RankBadge";
import { getRank } from "@/lib/achievements";
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
  const heights = ["h-44", "h-52", "h-40"];
  const widths = ["w-36", "w-44", "w-36"];
  const colors = ["#FFD700", "var(--color-cyan)", "#CD7F32"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.15, type: "spring", stiffness: 200, damping: 20 }}
      className="neon-feature-card flex flex-col items-center"
    >
      <div className="neon-border rounded-2xl" style={{
        background: `conic-gradient(from var(--border-angle), ${colors[rank - 1]}, transparent 40%, ${colors[rank - 1]}80, transparent 70%, ${colors[rank - 1]})`
      }} />
      <div className="neon-glow rounded-2xl" style={{ background: colors[rank - 1] }} />
      <div className={`neon-inner rounded-2xl flex flex-col items-center justify-center gap-2 ${widths[rank - 1]} ${heights[rank - 1]}`}>
        {/* Rank medal */}
        <span className="text-4xl">{MEDALS[rank - 1]}</span>

        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-3" style={{ borderColor: colors[rank - 1], boxShadow: `0 0 24px ${colors[rank - 1]}40` }}>
            {item.avatar ? (
              <img src={item.avatar} alt="" className="w-full h-full object-cover" />
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
        <div className="mt-auto px-3 py-1.5 rounded-full" style={{ background: `${colors[rank - 1]}18`, border: `1px solid ${colors[rank - 1]}30` }}>
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
  const isTop10 = rank <= 10;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, type: "spring", stiffness: 260, damping: 24 }}
      className="neon-feature-card group"
    >
      <div className="neon-border rounded-xl" style={isTop10 ? { opacity: 1 } : undefined} />
      <div className="neon-glow rounded-xl bg-[var(--color-cyan)]" />

      <div className="neon-inner rounded-xl flex flex-col items-center p-4 gap-2 relative">
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
              <img src={item.avatar} alt="" className="w-full h-full object-cover" />
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
  const rankColor = isTop3 ? rankColors[rank - 1] : "var(--color-cyan)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 260, damping: 24 }}
      className={`neon-feature-card group ${isTop3 ? "sm:col-span-2 lg:col-span-1" : ""}`}
    >
      {/* Rotating neon border — stronger for top 3 */}
      <div className="neon-border rounded-xl" style={isTop3 ? { opacity: 1 } : undefined} />
      <div className="neon-glow rounded-xl" style={{ background: rankColor }} />

      <div className="neon-inner rounded-xl overflow-hidden relative">
        {/* Cover image */}
        <Link href={`/anime/${item.id}`} className="relative block aspect-[3/4] overflow-hidden rounded-lg mb-3">
          {item.coverImage?.large || item.coverImage?.extraLarge ? (
            <Image
              src={item.coverImage.extraLarge || item.coverImage.large || ""}
              alt={bestTitle(item.title)}
              fill
              onLoadingComplete={() => setImgLoaded(true)}
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-line)]/20 text-[var(--color-mute)]">No Image</div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rank badge — top left */}
          <div className="absolute top-2 left-2 z-10">
            {isTop3 ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md font-mono text-xs font-black"
                style={{ background: `${rankColor}30`, color: rankColor, border: `1px solid ${rankColor}50`, boxShadow: `0 0 12px ${rankColor}30` }}>
                <span className="text-sm">{MEDALS[rank - 1]}</span>
                <span>{rankLabels[rank - 1]}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-7 h-7 rounded-full backdrop-blur-md font-mono text-[11px] font-black text-[var(--color-mute)]"
                style={{ background: "rgba(18,17,30,0.7)", border: "1px solid rgba(31,29,51,0.8)" }}>
                #{rank}
              </div>
            )}
          </div>

          {/* Score badge — top right */}
          {item.averageScore != null && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md text-xs font-mono font-bold"
              style={{ background: `${scoreColor}25`, color: scoreColor, border: `1px solid ${scoreColor}40` }}>
              ★ {item.averageScore.toFixed(0)}
            </div>
          )}

          {/* Bottom info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <div className="flex flex-wrap gap-1">
              {item.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "rgba(18,17,30,0.8)", color: "var(--color-mute)", border: "1px solid rgba(31,29,51,0.6)" }}>
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className={`absolute inset-0 bg-[var(--color-panel)] transition-opacity duration-500 ${imgLoaded ? "opacity-0" : "opacity-100"}`} />
        </Link>

        {/* Title */}
        <Link href={`/anime/${item.id}`} className="hover:text-[var(--color-cyan)] transition-colors">
          <h3 className="font-display text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem]">
            {bestTitle(item.title)}
          </h3>
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {item.format && (
            <span className="text-[10px] font-mono text-[var(--color-mute)] uppercase px-1.5 py-0.5 rounded bg-[var(--color-line)]/20">{item.format.replace(/_/g, " ")}</span>
          )}
          {item.episodes && (
            <span className="text-[10px] text-[var(--color-mute)]">{item.episodes} ep</span>
          )}
          {item.status && (
            <span className="text-[10px] text-[var(--color-mute)] capitalize">{item.status.replace(/_/g, " ").toLowerCase()}</span>
          )}
        </div>

        {/* Score bar */}
        {item.averageScore != null && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--color-mute)]">Score</span>
              <span className="font-mono text-[10px] font-bold" style={{ color: scoreColor }}>{item.averageScore}/100</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-line)]/40 overflow-hidden">
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

        {/* Stats row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-line)]/30">
          <div className="flex items-center gap-2.5 text-[10px] text-[var(--color-mute)]">
            {item.popularity != null && (
              <span className="flex items-center gap-0.5" title="Popularity">
                <span style={{ color: "var(--color-magenta)" }}>♥</span> {formatNumber(item.popularity)}
              </span>
            )}
            {item.favourites != null && item.favourites > 0 && (
              <span className="flex items-center gap-0.5" title="Favorites">
                <span style={{ color: "var(--color-amber)" }}>★</span> {formatNumber(item.favourites)}
              </span>
            )}
          </div>
          {item.trending != null && item.trending > 0 && (
            <span className="text-[10px] font-mono" style={{ color: "var(--color-cyan)" }}>
              🔥 {formatNumber(item.trending)}
            </span>
          )}
        </div>
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

  const fetchData = useCallback(async (t: Tab) => {
    setLoading(true);
    setError(null);
    dataRef.current = t;
    try {
      if (t === "users") {
        const res = await fetch("/api/leaderboard?limit=50");
        const result = await res.json();
        if (dataRef.current === t) {
          setUserData(result.entries || []);
          setUserTotal(result.total || 0);
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
  }, [seasonYear, seasonName]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch in effect is standard pattern
  useEffect(() => { fetchData(tab); }, [tab, fetchData]);

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
            <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight mt-1">
              <span className="neon-text-gradient">{heading}</span>
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
                className={`relative rounded-full px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  tab === t.key
                    ? "text-black"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
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
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
