"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  youtubeId: string;
  channel: string;
  channelUrl: string;
  tags: string[];
  language: "en" | "hi" | "both";
}

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"youtube" | "curated" | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PodcastEpisode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [langFilter, setLangFilter] = useState<"all" | "en" | "hi">("all");
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/podcast")
      .then((r) => r.json())
      .then((data) => { setEpisodes(data.episodes); setSource(data.source || null); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const d = await fetch(`/api/podcast/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
        if (!cancelled) setSearchResults((d.episodes || []) as PodcastEpisode[]);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  const channels = useMemo(() => [...new Set(episodes.map((e) => e.channel))], [episodes]);

  const displayEpisodes = useMemo(() => {
    const list = query.trim() ? searchResults : episodes;
    let result = [...list];
    if (langFilter !== "all") result = result.filter((e) => e.language === langFilter || e.language === "both");
    if (channelFilter) result = result.filter((e) => e.channel === channelFilter);
    return result.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }, [episodes, searchResults, query, langFilter, channelFilter]);

  return (
    <PageTransition>
      <style>{`
        @keyframes podNeonBorder {
          0%   { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
          20%  { border-color: #00ffff; box-shadow: 0 0 8px #00ffff55, inset 0 0 8px #00ffff11; }
          40%  { border-color: #ff3366; box-shadow: 0 0 8px #ff336655, inset 0 0 8px #ff336611; }
          60%  { border-color: #ffff00; box-shadow: 0 0 8px #ffff0055, inset 0 0 8px #ffff0011; }
          80%  { border-color: #ff0066; box-shadow: 0 0 8px #ff006655, inset 0 0 8px #ff006611; }
          100% { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
        }
        .pod-neon-card {
          animation: podNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
        @keyframes podNeonBorderHover {
          0%   { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
          20%  { border-color: #00ffff; box-shadow: 0 0 14px #00ffff, 0 0 28px #00ffff88; }
          40%  { border-color: #ff3366; box-shadow: 0 0 14px #ff3366, 0 0 28px #ff336688; }
          60%  { border-color: #ffff00; box-shadow: 0 0 14px #ffff00, 0 0 28px #ffff0088; }
          80%  { border-color: #ff0066; box-shadow: 0 0 14px #ff0066, 0 0 28px #ff006688; }
          100% { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
        }
        .pod-neon-card:hover {
          animation: podNeonBorderHover 1.5s linear infinite !important;
          transform: translateY(-2px);
        }
        .pod-neon-filter {
          animation: podNeonBorder 4s linear infinite;
          animation-delay: calc(var(--fd, 0) * -1s);
          border-width: 1px;
          border-style: solid;
        }
        .pod-neon-filter:hover {
          animation: podNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.05);
        }
        .pod-neon-search {
          animation: podNeonBorder 4s linear infinite;
          border-width: 1px;
          border-style: solid;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .pod-neon-search:focus-within {
          animation: podNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.01);
        }
        .pod-neon-search input:focus-visible,
        .pod-neon-filter:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        .pod-skeleton {
          animation: podNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <motion.div {...FADE_UP} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 rounded-full bg-[var(--color-magenta)]" />
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--color-magenta)] via-white to-[var(--color-cyan)] bg-clip-text text-transparent">
              Anime Podcasts
            </h1>
          </div>
          <p className="text-sm text-[var(--color-mute)] ml-4">
            Worldwide anime talks — voice actors, mangaka & authors, directors, studios, and Hindi community podcasts
          </p>
          {source === "youtube" && (
            <span className="mt-2 ml-4 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-1 text-[10px] font-semibold text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE from YouTube
            </span>
          )}
        </motion.div>

        {/* Search Bar */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6">
          <div className="pod-neon-search rounded-xl bg-[var(--color-panel)] px-4 py-3">
            <div className="relative flex items-center gap-3">
              <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-mute)" }}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search episodes, channels, topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-mute)]">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {query && (
            <p className="text-xs text-[var(--color-mute)] mt-2 ml-1">
              {searchLoading ? "Searching YouTube..." : `${displayEpisodes.length} result${displayEpisodes.length !== 1 ? "s" : ""} for`} &ldquo;<span className="text-[var(--color-cyan)]">{query}</span>&rdquo;
              {!searchLoading && <span className="text-[var(--color-mute)]/60"> — live from YouTube</span>}
            </p>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6 flex flex-wrap gap-2">
          {(["all", "en", "hi"] as const).map((l, i) => (
            <button key={l} onClick={() => { setLangFilter(l); setChannelFilter(null); }}
              className="rounded-lg pod-neon-filter px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                ["--fd" as string]: i,
                background: langFilter === l && !channelFilter ? "rgba(255,0,255,0.13)" : "transparent",
                color: langFilter === l && !channelFilter ? "#ff00ff" : "var(--color-mute)",
              }}
            >
              {l === "all" ? "All Episodes" : l === "en" ? "English" : "Hindi"}
            </button>
          ))}
          <span className="w-px h-6 bg-[var(--color-line)] self-center mx-1" />
          {channels.map((ch, i) => (
            <button key={ch} onClick={() => { setChannelFilter(channelFilter === ch ? null : ch); setLangFilter("all"); }}
              className="rounded-lg pod-neon-filter px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                ["--fd" as string]: i + 3,
                background: channelFilter === ch ? "rgba(0,255,255,0.13)" : "transparent",
                color: channelFilter === ch ? "#00ffff" : "var(--color-mute)",
              }}
            >
              {ch}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.12 }} className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Episodes", value: episodes.length, color: "var(--color-magenta)" },
            { label: "Channels", value: channels.length, color: "var(--color-cyan)" },
            { label: "English", value: episodes.filter((e) => e.language === "en").length, color: "#48BB78" },
            { label: "Hindi", value: episodes.filter((e) => e.language !== "en").length, color: "#ED8936" },
          ].map((stat, i) => (
            <div key={stat.label} className="pod-neon-card rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 text-center" style={{ ["--i" as string]: i }}>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="pod-skeleton rounded-xl bg-[var(--color-panel)] p-4 flex gap-4" style={{ ["--i" as string]: i }}>
                <div className="h-24 w-24 rounded-lg bg-[var(--color-line)]/20 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-[var(--color-line)]/20 animate-pulse" />
                  <div className="h-3 w-full rounded bg-[var(--color-line)]/20 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-line)]/20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !searchLoading && displayEpisodes.length === 0 && (
          <div className="pod-neon-card rounded-xl bg-[var(--color-panel)] py-20 text-center" style={{ ["--i" as string]: 0 }}>
            <p className="text-sm font-semibold text-[var(--color-mute)]">No episodes match your search</p>
            <p className="text-xs text-[var(--color-mute)]/60 mt-1">Try a different keyword or filter</p>
          </div>
        )}

        {/* Episodes */}
        {!isLoading && (
          <div className="space-y-4">
            {displayEpisodes.map((ep, i) => (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="pod-neon-card rounded-xl bg-[var(--color-panel)] overflow-hidden" style={{ ["--i" as string]: i }}>
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <a href={`https://www.youtube.com/watch?v=${ep.youtubeId}`} target="_blank" rel="noopener noreferrer" className="shrink-0 relative group/thumb">
                      <Image
                        src={`https://i.ytimg.com/vi/${ep.youtubeId}/hqdefault.jpg`}
                        alt={ep.title}
                        width={112}
                        height={112}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg object-cover transition-transform group-hover/thumb:scale-105"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${ep.youtubeId}/mqdefault.jpg`; }}
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono text-white px-1 rounded">{ep.duration}</span>
                    </a>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold line-clamp-1 group-hover:opacity-80">{ep.title}</h3>
                        <button onClick={() => setPlayingId(playingId === ep.id ? null : ep.id)}
                          className="shrink-0 rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          {playingId === ep.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--color-mute)] line-clamp-2 mt-1">{ep.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <a href={ep.channelUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-[var(--color-cyan)] hover:underline">{ep.channel}</a>
                        <span className="text-[10px] text-[var(--color-mute)]">•</span>
                        <span className="text-[10px] text-[var(--color-mute)]">{ep.publishDate}</span>
                        <span className="text-[10px] text-[var(--color-mute)]">•</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ep.language !== "en" ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}>
                          {ep.language === "en" ? "English" : ep.language === "both" ? "Hindi + English" : "Hindi"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ep.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-medium text-[var(--color-mute)] bg-[var(--color-line)]/20 rounded px-1.5 py-0.5">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline YouTube Player */}
                {playingId === ep.id && (
                  <div className="px-4 pb-4">
                    <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${ep.youtubeId}?autoplay=1&rel=0`}
                        title={ep.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-[var(--color-mute)]">Playing on ZyniVerse</p>
                      <a href={`https://www.youtube.com/watch?v=${ep.youtubeId}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-[var(--color-cyan)] hover:underline"
                      >
                        Open on YouTube
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
