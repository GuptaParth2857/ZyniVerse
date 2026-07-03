"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";

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

function matchesFilter(ep: FillerEpisode, filter: string | null): boolean {
  if (!filter) return true;
  if (filter === "canon") return ep.type === "manga-canon" || ep.type === "anime-canon";
  if (filter === "filler-group") return ep.type === "filler";
  return ep.type === filter;
}

export default function FillerGuide({ anilistId, animeTitle }: { anilistId: number; animeTitle?: string }) {
  const [data, setData] = useState<FillerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [showTitles, setShowTitles] = useState(true);
  const jumpRef = useRef<HTMLDivElement>(null);

  const cacheKey = useMemo(() => `${anilistId}:${animeTitle || ""}`, [anilistId, animeTitle]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (animeTitle) params.set("title", animeTitle);
    const url = `/api/filler/${anilistId}?${params.toString()}`;
    if (!fillerFetchCache.has(cacheKey)) {
      setLoading(true);
      fillerFetchCache.set(cacheKey, fetch(url).then((r) => r.json()));
    }
    fillerFetchCache.get(cacheKey)!
      .then((d) => !cancelled && setData(d as FillerData))
      .catch(() => !cancelled && setData({ found: false } as FillerData))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [cacheKey]);

  function scrollToEpisode(ep: number) {
    document.getElementById(`ep-${ep}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

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

  if (!data?.found || !data.episodes) return null;

  const episodes = data.episodes;
  const filtered = filter ? episodes.filter((e) => matchesFilter(e, filter)) : episodes;
  const display = showAll ? filtered : filtered.slice(0, 50);

  const baseFilters: { label: string; value: string | null }[] = [
    { label: "All", value: null },
    { label: "Canon", value: "canon" },
    { label: "Filler", value: "filler-group" },
  ];

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <h3 className="font-display text-base font-bold flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
          Filler Guide
          <a href={`https://www.animefillerlist.com/shows/${data.slug}`}
            target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-normal text-[var(--color-mute)] underline ml-1"
          >via animefillerlist.com</a>
        </h3>
      </div>

      {/* Filter Toggle: All / Canon / Filler */}
      <div className="mx-5 mb-3 flex items-center gap-2">
        {baseFilters.map((bf) => (
          <button key={bf.label} onClick={() => setFilter(filter === bf.value ? null : bf.value)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
              filter === bf.value
                ? "bg-[var(--color-magenta)] text-black"
                : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >{bf.label}</button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="mx-5 mb-3 grid grid-cols-4 gap-2">
        {([["manga-canon", data.mangaCanon], ["anime-canon", data.animeCanon], ["mixed-manga", data.mixed], ["filler", data.filler]] as const).map(([type, count]) => (
          <button key={type} onClick={() => setFilter(filter === type ? null : type)}
            className={`rounded-lg border px-2 py-2 text-center transition-all ${
              filter === type
                ? "border-transparent text-black font-bold"
                : "border-[var(--color-line)] hover:bg-white/5"
            }`}
            style={filter === type ? { background: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] } : {}}
          >
            <div className="text-lg font-bold font-mono" style={filter !== type ? { color: TYPE_COLORS[type] } : {}}>{count}</div>
            <div className="text-[9px] uppercase tracking-wider" style={filter !== type ? { color: "var(--color-mute)" } : {}}>{TYPE_LABELS[type]}</div>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mx-5 mb-4 flex h-2 rounded-full overflow-hidden bg-[var(--color-line)]">
        {TYPE_ORDER.filter((t) => {
          const k = t === "mixed-manga" ? "mixed" : t === "manga-canon" ? "mangaCanon" : t === "anime-canon" ? "animeCanon" : "filler";
          return ((data as any)[k] || 0) > 0;
        }).map((type) => {
          const k = type === "mixed-manga" ? "mixed" : type === "manga-canon" ? "mangaCanon" : type === "anime-canon" ? "animeCanon" : "filler";
          const count = (data as any)[k] as number;
          const pct = data.total ? (count / data.total) * 100 : 0;
          return <div key={type} style={{ width: `${pct}%`, background: TYPE_COLORS[type] }} />;
        })}
      </div>

      {/* Quick List */}
      {data.quickList && (
        <div className="mx-5 mb-3 space-y-1.5">
          {(["manga-canon", "anime-canon", "mixed-manga", "filler"] as const).filter((t) => data.quickList![t]?.length).map((type) => (
            <div key={type} className="flex items-start gap-2 text-[11px] leading-tight">
              <span className="shrink-0 font-semibold uppercase whitespace-nowrap mt-0.5" style={{ color: TYPE_COLORS[type] }}>
                {TYPE_LABELS[type]}:
              </span>
              <span className="text-[var(--color-mute)]">
                {data.quickList![type].map((r, i) => (
                  <button key={i} onClick={() => setFilter(type)}
                    className="hover:text-[var(--color-ink)] hover:underline transition-colors cursor-pointer"
                  >{r}{i < data.quickList![type].length - 1 ? ", " : ""}</button>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mx-5 mb-3 flex items-center justify-between text-xs text-[var(--color-mute)]">
        <span>{data.total} episodes total</span>
        {data.filler != null && data.filler > 0 && (
          <span className="text-right">
            <span className="text-red-400 font-semibold">{data.fillerPercent}% filler</span>
            {" — "}skip: {episodes.filter((e) => e.type === "filler").slice(0, 10).map((e) => e.episode).join(", ")}
            {episodes.filter((e) => e.type === "filler").length > 10 && "..."}
          </span>
        )}
      </div>

      {/* Jump to Episode */}
      {showAll && data.total! > 50 && (
        <div className="border-t border-[var(--color-line)] px-5 py-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-1">
            <span>Jump to</span>
          </div>
          <div ref={jumpRef}
            className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin"
            style={{ scrollbarWidth: "thin" }}
          >
            {filtered.map((ep) => (
              <button key={ep.episode} onClick={() => scrollToEpisode(ep.episode)}
                className="shrink-0 w-6 h-6 rounded text-[10px] font-mono font-medium transition-all"
                style={{ background: `${TYPE_COLORS[ep.type]}20`, color: TYPE_COLORS[ep.type], border: `1px solid ${TYPE_COLORS[ep.type]}40` }}
                onMouseEnter={(e) => e.currentTarget.style.background = `${TYPE_COLORS[ep.type]}50`}
                onMouseLeave={(e) => e.currentTarget.style.background = `${TYPE_COLORS[ep.type]}20`}
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
          <span className="w-24 text-right">Air Date</span>
          <button onClick={() => setShowTitles(!showTitles)}
            className="ml-auto text-[9px] text-[var(--color-cyan)] hover:underline shrink-0"
          >{showTitles ? "Hide" : "Show"} Titles</button>
        </div>
        {display.map((ep, i) => (
          <motion.div
            id={`ep-${ep.episode}`}
            key={ep.episode}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.01 }}
            className="flex items-center gap-3 border-b border-[var(--color-line)]/50 px-5 py-2 text-sm hover:bg-white/[0.02] transition-colors scroll-mt-4"
          >
            <span className="w-8 text-right font-mono text-xs text-[var(--color-mute)]">{ep.episode}</span>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: TYPE_COLORS[ep.type] }} />
            <span className={`${showTitles ? "min-w-0 flex-1 truncate" : "w-0 overflow-hidden"}`}>{ep.title}</span>
            <span className="w-24 text-right text-[10px] font-medium uppercase shrink-0" style={{ color: TYPE_COLORS[ep.type] }}>
              {TYPE_LABELS[ep.type]}
            </span>
            <span className="w-24 text-right text-[10px] text-[var(--color-mute)] shrink-0 font-mono">
              {ep.aired_date || "—"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Show More / Filter Reset */}
      <div className="flex items-center justify-between px-5 py-3">
        {!showAll && filtered.length > 50 ? (
          <button onClick={() => setShowAll(true)}
            className="text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >Show all {filtered.length} episodes →</button>
        ) : showAll && filtered.length > 50 ? (
          <button onClick={() => setShowAll(false)}
            className="text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >Show less</button>
        ) : <span />}
        {filter && (
          <button onClick={() => setFilter(null)}
            className="text-xs text-[var(--color-cyan)] hover:underline"
          >Clear filter</button>
        )}
      </div>
    </div>
  );
}
