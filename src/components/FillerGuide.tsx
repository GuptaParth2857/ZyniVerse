"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface FillerEpisode {
  episode: number;
  title: string;
  type: "manga-canon" | "filler" | "mixed-manga" | "anime-canon";
  aired_date: string;
}

interface FillerData {
  found: boolean;
  slug?: string;
  title?: string;
  total?: number;
  filler?: number;
  mangaCanon?: number;
  animeCanon?: number;
  mixed?: number;
  fillerPercent?: number;
  episodes?: FillerEpisode[];
  quickList?: Record<string, string[]>;
}

interface EpisodeVotes {
  tally: Record<string, number>;
  total: number;
}

const CONSENSUS_THRESHOLD = 5;

const fillerFetchCache = new Map<string, Promise<FillerData>>();

const TYPE_COLORS: Record<string, string> = {
  "manga-canon": "#22c55e",
  "anime-canon": "#3b82f6",
  filler: "#ef4444",
  "mixed-manga": "#f59e0b",
};

const TYPE_LABELS: Record<string, string> = {
  "manga-canon": "Manga Canon",
  "anime-canon": "Anime Canon",
  filler: "Filler",
  "mixed-manga": "Mixed Canon",
};

const TYPE_ORDER = ["manga-canon", "anime-canon", "mixed-manga", "filler"];

const VOTE_OPTIONS = [
  { value: "manga-canon", label: "Manga Canon", color: TYPE_COLORS["manga-canon"] },
  { value: "anime-canon", label: "Anime Canon", color: TYPE_COLORS["anime-canon"] },
  { value: "mixed", label: "Mixed", color: TYPE_COLORS["mixed-manga"] },
  { value: "filler", label: "Filler", color: TYPE_COLORS.filler },
] as const;

const VOTE_KEY_MAP: Record<string, string> = {
  "manga-canon": "manga-canon",
  "anime-canon": "anime-canon",
  mixed: "mixed-manga",
  filler: "filler",
};

function findMajority(tally: Record<string, number>): string {
  let maxCount = 0;
  let winner = "filler";
  for (const [type, count] of Object.entries(tally)) {
    if (count > maxCount) {
      maxCount = count;
      winner = type;
    }
  }
  return VOTE_KEY_MAP[winner] || winner;
}

function computeConsensusOverrides(votes: Record<number, EpisodeVotes>): Record<number, string> {
  const map: Record<number, string> = {};
  for (const [epStr, v] of Object.entries(votes)) {
    if (v.total >= CONSENSUS_THRESHOLD) {
      map[Number(epStr)] = findMajority(v.tally);
    }
  }
  return map;
}

function matchesFilter(ep: FillerEpisode, consensusType: string | null, filter: string | null): boolean {
  const effectiveType = consensusType || ep.type;
  if (!filter) return true;
  if (filter === "canon") return effectiveType === "manga-canon" || effectiveType === "anime-canon";
  if (filter === "filler-group") return effectiveType === "filler";
  return effectiveType === filter;
}

export default function FillerGuide({ anilistId, animeTitle }: { anilistId: number; animeTitle?: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<FillerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [showTitles, setShowTitles] = useState(true);
  const [votes, setVotes] = useState<Record<number, EpisodeVotes>>({});
  const [myVotes, setMyVotes] = useState<Record<number, string>>({});
  const [votingEp, setVotingEp] = useState<number | null>(null);
  const [reportOpenEp, setReportOpenEp] = useState<number | null>(null);
  const [reportingEp, setReportingEp] = useState<number | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLDivElement>(null);

  const cacheKey = useMemo(() => `${anilistId}:${animeTitle || ""}`, [anilistId, animeTitle]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (animeTitle) params.set("title", animeTitle);
    const url = `/api/filler/${anilistId}?${params.toString()}`;
    if (!fillerFetchCache.has(cacheKey)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fillerFetchCache.set(cacheKey, fetch(url).then((r) => r.json()));
    }
    fillerFetchCache.get(cacheKey)!
      .then((d) => !cancelled && setData(d as FillerData))
      .catch(() => !cancelled && setData({ found: false } as FillerData))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [cacheKey]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/filler/${anilistId}/vote`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res.byEpisode) setVotes(res.byEpisode as Record<number, EpisodeVotes>);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [anilistId]);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    fetch(`/api/filler/${anilistId}/vote?mine=true`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled || !res.votes) return;
        const my: Record<number, string> = {};
        for (const v of res.votes) {
          my[v.episode] = v.vote;
        }
        setMyVotes(my);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [anilistId, session?.user?.id]);

  const submitVote = useCallback(async (episode: number, vote: string) => {
    if (!session?.user?.id) return;
    setVotingEp(episode);
    try {
      const res = await fetch(`/api/filler/${anilistId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode, vote }),
      });
      const d = await res.json();
      if (d.tally) {
        setVotes((prev) => ({
          ...prev,
          [episode]: { tally: d.tally, total: d.totalVotes },
        }));
      }
      setMyVotes((prev) => ({ ...prev, [episode]: vote }));
    } catch {}
    setVotingEp(null);
  }, [anilistId, session?.user?.id]);

  const submitReport = useCallback(async (episode: number, reason: string) => {
    if (!session?.user?.id) return;
    setReportingEp(episode);
    setReportOpenEp(null);
    try {
      await fetch(`/api/filler/${anilistId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode, reason }),
      });
    } catch {}
    setReportingEp(null);
  }, [anilistId, session?.user?.id]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setReportOpenEp(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function scrollToEpisode(ep: number) {
    document.getElementById(`ep-${ep}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const consensusOverrides = useMemo(() => computeConsensusOverrides(votes), [votes]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const episodesWithConsensus = useMemo(() => {
    if (!data?.episodes) return [];
    return data.episodes.map((ep) => ({
      ...ep,
      consensusType: consensusOverrides[ep.episode] || null,
      effectiveType: consensusOverrides[ep.episode] || ep.type,
    }));
  }, [data?.episodes, consensusOverrides]);

  const consensusStats = useMemo(() => {
    const s = { total: 0, mangaCanon: 0, animeCanon: 0, mixed: 0, filler: 0, fillerPercent: 0 };
    if (!episodesWithConsensus.length) return s;
    s.total = episodesWithConsensus.length;
    for (const ep of episodesWithConsensus) {
      if (ep.effectiveType === "manga-canon") s.mangaCanon++;
      else if (ep.effectiveType === "anime-canon") s.animeCanon++;
      else if (ep.effectiveType === "mixed-manga") s.mixed++;
      else if (ep.effectiveType === "filler") s.filler++;
    }
    s.fillerPercent = Math.round((s.filler / s.total) * 100);
    return s;
  }, [episodesWithConsensus]);

  const overriddenCount = Object.keys(consensusOverrides).length;

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
          Loading filler guide...
        </div>
      </div>
    );
  }

  if (!data?.found || !data.episodes) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h3 className="font-display text-sm font-bold flex items-center gap-2 mb-2">
          <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
          Filler Guide
        </h3>
        <p className="text-xs text-[var(--color-mute)] leading-relaxed">
          Filler guide not available for this anime.
        </p>
        <a href="/filler"
          className="mt-2 inline-flex text-xs text-[var(--color-cyan)] hover:underline"
        >Search all filler guides →</a>
      </div>
    );
  }

  const episodes = data.episodes;
  const filtered = filter
    ? episodesWithConsensus.filter((ep) => {
        if (filter === "overridden") return !!ep.consensusType;
        return matchesFilter(ep, ep.consensusType, filter);
      })
    : episodesWithConsensus;
  const display = showAll ? filtered : filtered.slice(0, 50);
  const isLoggedIn = !!session?.user?.id;

  const baseFilters: { label: string; value: string | null }[] = [
    { label: "All", value: null },
    { label: "Canon", value: "canon" },
    { label: "Filler", value: "filler-group" },
  ];

  const totalVotesAll = Object.values(votes).reduce((s, v) => s + v.total, 0);

  function statsCount(type: string) {
    if (type === "manga-canon") return consensusStats.mangaCanon;
    if (type === "anime-canon") return consensusStats.animeCanon;
    if (type === "mixed-manga") return consensusStats.mixed;
    if (type === "filler") return consensusStats.filler;
    return 0;
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold flex items-center gap-2">
            <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
            Filler Guide
            <a href={`https://www.animefillerlist.com/shows/${data.slug}`}
              target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-normal text-[var(--color-mute)] underline ml-1"
            >via animefillerlist.com</a>
            {overriddenCount > 0 && (
              <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[8px] font-mono text-[var(--color-cyan)] border border-[var(--color-cyan)]/20 ml-1">
                {overriddenCount} overridden
              </span>
            )}
          </h3>
          {totalVotesAll > 0 && (
            <span className="text-[10px] text-[var(--color-mute)] font-mono">
              {totalVotesAll} votes · {Object.keys(consensusOverrides).length} settled
            </span>
          )}
        </div>
      </div>

      {/* Affiliate CTA */}
      <div className="mx-5 mb-3">
        <a
          href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(animeTitle || "")}&ref=zyniverse`}
          target="_blank" rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F47521] to-[#f59e0b] px-5 py-2.5 text-[10px] font-bold text-black hover:opacity-90 transition-opacity"
        >▶ Watch on Crunchyroll</a>
        <a
          href={`https://www.amazon.com/s?k=${encodeURIComponent((animeTitle || "") + " anime")}&tag=zyniverse-21`}
          target="_blank" rel="noopener noreferrer sponsored"
          className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-[10px] font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
        >📦 Buy on Amazon</a>
      </div>

      {/* Filter Toggle */}
      <div className="mx-5 mb-3 flex items-center gap-2">
        {baseFilters.map((bf) => (
          <button key={bf.label} onClick={() => setFilter(filter === bf.value ? null : bf.value)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === bf.value
                ? "bg-[var(--color-magenta)] text-black"
                : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >{bf.label}</button>
        ))}
        {overriddenCount > 0 && (
          <button onClick={() => setFilter(filter === "overridden" ? null : "overridden")}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === "overridden"
                ? "bg-[var(--color-cyan)] text-black"
                : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >🛠 Overridden</button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="mx-5 mb-3 grid grid-cols-4 gap-2">
        {(["manga-canon", "anime-canon", "mixed-manga", "filler"] as const).map((type) => {
          const count = statsCount(type);
          const original = type === "mixed-manga" ? data.mixed : data[type === "manga-canon" ? "mangaCanon" : type === "anime-canon" ? "animeCanon" : "filler" as keyof FillerData] as number;
          const changed = count !== original;
          return (
            <button key={type} onClick={() => setFilter(filter === type ? null : type)}
              className={`rounded-lg border px-2 py-2 text-center transition-all ${
                filter === type
                  ? "border-transparent text-black font-bold"
                  : "border-[var(--color-line)] hover:bg-white/5"
              } ${changed ? "ring-1 ring-[var(--color-cyan)]/30" : ""}`}
              style={filter === type ? { background: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] } : {}}
            >
              <div className="text-lg font-bold font-mono" style={filter !== type ? { color: TYPE_COLORS[type] } : {}}>
                {count}{changed ? "*" : ""}
              </div>
              <div className="text-[9px] uppercase tracking-wider" style={filter !== type ? { color: "var(--color-mute)" } : {}}>
                {TYPE_LABELS[type]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mx-5 mb-4 flex h-2 rounded-full overflow-hidden bg-[var(--color-line)]">
        {TYPE_ORDER.filter((t) => statsCount(t) > 0).map((type) => {
          const pct = consensusStats.total > 0 ? (statsCount(type) / consensusStats.total) * 100 : 0;
          return <div key={type} style={{ width: `${pct}%`, background: TYPE_COLORS[type] }} />;
        })}
      </div>

      {/* Quick List */}
      <div className="mx-5 mb-3 space-y-1.5">
        {(["manga-canon", "anime-canon", "mixed-manga", "filler"] as const).filter((t) => {
          const all = episodesWithConsensus.filter((ep) => ep.effectiveType === t);
          return all.length > 0;
        }).map((type) => {
          const all = episodesWithConsensus.filter((ep) => ep.effectiveType === type);
          const ranges = buildRanges(all.map((ep) => ep.episode));
          return (
            <div key={type} className="flex items-start gap-2 text-[11px] leading-tight">
              <span className="shrink-0 font-semibold uppercase whitespace-nowrap mt-0.5" style={{ color: TYPE_COLORS[type] }}>
                {TYPE_LABELS[type]}:
              </span>
              <span className="text-[var(--color-mute)]">
                {ranges.map((r, i) => (
                  <button key={i} onClick={() => setFilter(type)}
                    className="hover:text-[var(--color-ink)] hover:underline transition-colors cursor-pointer"
                  >{r}{i < ranges.length - 1 ? ", " : ""}</button>
                ))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mx-5 mb-3 flex items-center justify-between text-xs text-[var(--color-mute)]">
        <span>
          {consensusStats.total} episodes
          {overriddenCount > 0 && ` · ${overriddenCount} community-verified`}
        </span>
        {consensusStats.filler > 0 && (
          <span className="text-right">
            <span className="text-red-400 font-semibold">{consensusStats.fillerPercent}% filler</span>
            {" — "}skip: {episodesWithConsensus.filter((e) => e.effectiveType === "filler").slice(0, 10).map((e) => e.episode).join(", ")}
            {episodesWithConsensus.filter((e) => e.effectiveType === "filler").length > 10 && "..."}
          </span>
        )}
      </div>

      {/* Login prompt */}
      {!isLoggedIn && totalVotesAll > 0 && (
        <div className="mx-5 mb-3 rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 px-4 py-2">
          <p className="text-[10px] text-[var(--color-mute)] text-center">
            <a href="/login" className="text-[var(--color-cyan)] hover:underline">Log in</a> to vote — {CONSENSUS_THRESHOLD}+ votes automatically override the source data.
          </p>
        </div>
      )}

      {/* Jump to Episode */}
      {showAll && data.total! > 50 && (
        <div className="border-t border-[var(--color-line)] px-5 py-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-1">
            <span>Jump to</span>
          </div>
          <div ref={jumpRef} className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
            {filtered.map((ep) => (
              <button key={ep.episode} onClick={() => scrollToEpisode(ep.episode)}
                className="shrink-0 w-6 h-6 rounded text-[10px] font-mono font-medium transition-all"
                style={{
                  background: `${TYPE_COLORS[ep.effectiveType]}20`,
                  color: TYPE_COLORS[ep.effectiveType],
                  border: ep.consensusType ? `1.5px solid ${TYPE_COLORS[ep.effectiveType]}` : `1px solid ${TYPE_COLORS[ep.effectiveType]}40`,
                }}
              >{ep.episode}</button>
            ))}
          </div>
        </div>
      )}

      {/* Episode List */}
      <div className="border-t border-[var(--color-line)]">
        <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] bg-black/20">
          <span className="w-8 text-right">#</span>
          <span className={`${showTitles ? "flex-1" : "w-0 overflow-hidden"}`}>Title</span>
          <span className="w-24 text-right">Type</span>
          <span className="w-20 text-right">Votes</span>
          <span className="w-24 text-right">Air Date</span>
          {isLoggedIn && <span className="w-28 text-center">Your Vote</span>}
          {isLoggedIn && <span className="w-5 text-center shrink-0" />}
          <button onClick={() => setShowTitles(!showTitles)}
            className="ml-auto text-[9px] text-[var(--color-cyan)] hover:underline shrink-0"
          >{showTitles ? "Hide" : "Show"} Titles</button>
        </div>
        {display.map((ep, i) => {
          const epVotes = votes[ep.episode];
          const myVote = myVotes[ep.episode];
          const isVoting = votingEp === ep.episode;
          const isOverridden = !!ep.consensusType && ep.consensusType !== ep.type;
          const displayType = ep.consensusType || ep.type;
          return (
            <motion.div
              id={`ep-${ep.episode}`}
              key={ep.episode}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.01 }}
              className={`flex items-center gap-3 border-b border-[var(--color-line)]/50 px-5 py-2 text-sm transition-colors scroll-mt-4 ${
                isOverridden ? "bg-[var(--color-cyan)]/[0.03]" : "hover:bg-white/[0.02]"
              }`}
            >
              <span className="w-8 text-right font-mono text-xs text-[var(--color-mute)] shrink-0">{ep.episode}</span>

              {/* Status dot — show consensus dot when overridden */}
              <span className="relative h-3 w-3 rounded-full shrink-0" style={{ background: TYPE_COLORS[displayType] }}>
                {isOverridden && (
                  <span className="absolute -inset-0.5 rounded-full animate-ping opacity-30" style={{ background: TYPE_COLORS[displayType] }} />
                )}
              </span>

              <span className={`${showTitles ? "min-w-0 flex-1 truncate" : "w-0 overflow-hidden"}`}>
                {ep.title}
                {isOverridden && (
                  <span className="ml-1.5 rounded bg-[var(--color-cyan)]/15 px-1 py-0.5 text-[7px] font-mono text-[var(--color-cyan)] align-middle border border-[var(--color-cyan)]/20">
                    community
                  </span>
                )}
              </span>

              {/* Type */}
              <span className="w-24 text-right shrink-0">
                <span className="text-[10px] font-medium uppercase" style={{ color: TYPE_COLORS[displayType] }}>
                  {TYPE_LABELS[displayType]}
                </span>
                {isOverridden && (
                  <span className="block text-[7px] text-[var(--color-mute)] line-through opacity-50">
                    {TYPE_LABELS[ep.type]}
                  </span>
                )}
              </span>

              {/* Vote tally */}
              <span className="w-20 text-right shrink-0">
                {epVotes ? (
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">
                    {[["manga-canon", "MC"], ["anime-canon", "AC"], ["mixed", "MX"], ["filler", "FL"]].map(([k, short]) => {
                      const c = epVotes.tally[k];
                      if (!c) return null;
                      return (
                        <span key={k} className="inline-flex items-center gap-0.5 ml-1"
                          style={{ color: TYPE_COLORS[k === "mixed" ? "mixed-manga" : k] }}
                        >{short}<span className="font-bold">{c}</span></span>
                      );
                    })}
                  </span>
                ) : (
                  <span className="text-[9px] text-[var(--color-mute)]">—</span>
                )}
              </span>

              <span className="w-24 text-right text-[10px] text-[var(--color-mute)] shrink-0 font-mono">
                {ep.aired_date || "—"}
              </span>

              {/* Vote buttons */}
              {isLoggedIn ? (
                <span className="w-28 shrink-0 flex items-center justify-center gap-0.5">
                  {VOTE_OPTIONS.map((opt) => {
                    const isSelected = myVote === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => submitVote(ep.episode, opt.value)}
                        disabled={isVoting}
                        className={`w-5 h-5 rounded text-[8px] font-bold transition-all ${
                          isSelected
                            ? "text-black scale-110"
                            : "opacity-30 hover:opacity-80 text-[var(--color-mute)]"
                        }`}
                        style={isSelected ? { background: opt.color } : {}}
                        title={`Vote as ${opt.label}`}
                      >{opt.label.slice(0, 2).toUpperCase()}</button>
                    );
                  })}
                </span>
              ) : null}

              {/* Report button */}
              {isLoggedIn && (
                <div className="relative shrink-0" ref={reportRef}>
                  <button
                    onClick={() => setReportOpenEp(reportOpenEp === ep.episode ? null : ep.episode)}
                    disabled={reportingEp === ep.episode}
                    className="text-[9px] text-[var(--color-mute)] hover:text-red-400 transition-colors ml-1"
                    title="Report wrong data"
                  >
                    {reportingEp === ep.episode ? "..." : "⚠"}
                  </button>
                  <AnimatePresence>
                    {reportOpenEp === ep.episode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] shadow-xl overflow-hidden"
                      >
                        <p className="px-3 py-1.5 text-[9px] font-semibold text-[var(--color-mute)] border-b border-[var(--color-line)]">Report as:</p>
                        {[
                          { value: "wrong-type", label: "Wrong Type" },
                          { value: "wrong-order", label: "Wrong Order" },
                          { value: "spoiler", label: "Spoiler" },
                          { value: "other", label: "Other Issue" },
                        ].map((r) => (
                          <button key={r.value}
                            onClick={() => submitReport(ep.episode, r.value)}
                            className="block w-full text-left px-5 py-2.5 text-xs text-[var(--color-mute)] hover:text-red-400 hover:bg-red-400/5 transition-colors"
                          >{r.label}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Unauthenticated vote prompt */}
      {!isLoggedIn && (
        <div className="px-5 py-3 border-t border-[var(--color-line)]">
          <a href="/login"
            className="text-[10px] text-[var(--color-cyan)] hover:underline"
          >Log in to vote and help correct the data →</a>
        </div>
      )}

      {/* Show More / Filter Reset */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-line)]">
        {!showAll && filtered.length > 50 ? (
          <button onClick={() => setShowAll(true)}
            className="text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >Show all {filtered.length} episodes →</button>
        ) : showAll && filtered.length > 50 ? (
          <button onClick={() => setShowAll(false)}
            className="text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >Show less</button>
        ) : <span />}
        <div className="flex items-center gap-3">
          {overriddenCount > 0 && (
            <span className="text-[9px] text-[var(--color-mute)]">{overriddenCount} episodes community-verified (≥{CONSENSUS_THRESHOLD} votes)</span>
          )}
          {filter && (
            <button onClick={() => setFilter(null)}
              className="text-xs text-[var(--color-cyan)] hover:underline"
            >Clear filter</button>
          )}
        </div>
      </div>
    </div>
  );
}

function buildRanges(nums: number[]): string[] {
  if (nums.length === 0) return [];
  nums.sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = nums[0];
  let end = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === end + 1) {
      end = nums[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = nums[i];
      end = nums[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges;
}
