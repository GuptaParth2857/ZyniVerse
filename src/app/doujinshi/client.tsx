"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import type { DoujinshiEntry } from "@/lib/mangadex-api";
import DoujinshiCard from "@/components/DoujinshiCard";
import Loader from "@/components/Loader";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const GENRE_TAGS = [
  { label: "All", value: "" },
  { label: "Action", value: "Action" },
  { label: "Romance", value: "Romance" },
  { label: "Comedy", value: "Comedy" },
  { label: "Drama", value: "Drama" },
  { label: "Horror", value: "Horror" },
  { label: "Sci-Fi", value: "Sci-Fi" },
  { label: "Fantasy", value: "Fantasy" },
  { label: "Slice of Life", value: "Slice of Life" },
  { label: "Supernatural", value: "Supernatural" },
  { label: "Mystery", value: "Mystery" },
];

export default function DoujinshiBrowseClient() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sort, setSort] = useState<"popular" | "latest" | "rating">("popular");
  const [entries, setEntries] = useState<DoujinshiEntry[]>([]);
  const [trending, setTrending] = useState<DoujinshiEntry[]>([]);
  const [popular, setPopular] = useState<DoujinshiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackedMap, setTrackedMap] = useState<Record<string, string>>({});
  const [showBrowse, setShowBrowse] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!showBrowse) return;
    setLoading(true);
    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set("search", debouncedSearch);
    if (sort) sp.set("sort", sort);
    sp.set("perPage", "50");
    fetch(`/api/doujinshi?${sp.toString()}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, sort, showBrowse]);

  useEffect(() => {
    Promise.all([
      fetch("/api/doujinshi?sort=latest&perPage=10").then((r) => r.json()),
      fetch("/api/doujinshi?sort=popular&perPage=10").then((r) => r.json()),
    ])
      .then(([t, p]) => {
        setTrending(t.entries || []);
        setPopular(p.entries || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/doujinshi/my")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.entries?.forEach((e: { doujinshi: { id: string }; entry: { status: string } }) => {
          map[e.doujinshi.id] = e.entry.status;
        });
        setTrackedMap(map);
      })
      .catch(() => {});
  }, [session]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((d) => d.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (!selectedTag) return entries;
    return entries.filter((e) => e.tags.includes(selectedTag));
  }, [entries, selectedTag]);

  const handleTrack = useCallback(async (id: string, status: string) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/doujinshi/${id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTrackedMap((prev) => {
          const next = { ...prev };
          if (next[id]) delete next[id];
          else next[id] = status;
          return next;
        });
      }
    } catch {}
  }, [session]);

  if (loading && !showBrowse && trending.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-transparent border-t-[var(--color-magenta)] animate-spin" />
          <p className="text-[10px] font-mono tracking-[0.25em] text-[var(--color-mute)]">LOADING DOUJINSHI</p>
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
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#ff00ff]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#8a2be2]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(138,43,226,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="neon-premium rounded-xl h-12 w-12 mb-4">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="text-xl">📚</span>
              </div>
            </div>

            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff00ff] mb-3" style={{ textShadow: "0 0 10px rgba(255,0,255,0.5)" }}>Doujinshi</span>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 0 30px rgba(255,0,255,0.3), 0 0 60px rgba(138,43,226,0.2)" }}>
              Fan Works & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#8a2be2] to-[#00ffff]">Creations</span>
            </h1>
            <p className="mt-3 text-base text-gray-400 max-w-lg">
              Discover, track, and explore doujinshi from MangaDex. Fan-made masterpieces from your favorite series.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-[#ff00ff]">{popular.length}</div>
                <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">Popular</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-[#00ffff]">{trending.length}</div>
                <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest">Trending</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">
        {/* ═══════════════ TRENDING ═══════════════ */}
        {trending.length > 0 && !showBrowse && (
          <motion.div {...FADE_UP}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: "#ff00ff" }}>Trending Now</h2>
                  <p className="text-xs text-[var(--color-mute)]">Latest uploads from MangaDex</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {trending.slice(0, 8).map((entry) => (
                <div key={entry.id} className="shrink-0 w-[180px]">
                  <DoujinshiCard entry={entry} onTrack={handleTrack} trackedStatus={trackedMap[entry.id] || null} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ POPULAR ═══════════════ */}
        {popular.length > 0 && !showBrowse && (
          <motion.div {...FADE_UP}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <h2 className="font-display text-xl font-bold" style={{ color: "#ffd700" }}>Most Popular</h2>
                  <p className="text-xs text-[var(--color-mute)]">Highest followed doujinshi</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {popular.slice(0, 5).map((entry) => (
                <DoujinshiCard key={entry.id} entry={entry} onTrack={handleTrack} trackedStatus={trackedMap[entry.id] || null} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ BROWSE TOGGLE ═══════════════ */}
        {!showBrowse && (
          <motion.div {...FADE_UP} className="text-center">
            <button
              onClick={() => setShowBrowse(true)}
              className="neon-premium rounded-xl px-8 py-3 text-sm font-bold transition-all hover:scale-[1.02]"
            >
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content px-6 py-3" style={{ color: "#ff00ff" }}>
                Browse All Doujinshi →
              </div>
            </button>
          </motion.div>
        )}

        {/* ═══════════════ BROWSE SECTION ═══════════════ */}
        {showBrowse && (
          <motion.div {...FADE_UP} className="space-y-6">
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doujinshi..."
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm py-3.5 pl-12 pr-10 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none transition-all duration-300 focus:border-[var(--color-magenta)]"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {(["popular", "latest", "rating"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`neon-premium rounded-xl transition-all ${sort === s ? "scale-[1.02]" : ""}`}
                  >
                    <div className="neon-premium-track rounded-xl" />
                    <div className="neon-premium-overlay rounded-[10.5px]" />
                    <div className="neon-premium-content px-4 py-2.5 text-xs font-bold capitalize" style={{
                      color: sort === s ? "#ff00ff" : "var(--color-mute)",
                      background: sort === s ? "rgba(255,0,255,0.08)" : undefined,
                    }}>
                      {s === "popular" ? "🔥 Popular" : s === "latest" ? "🆕 Latest" : "⭐ Rating"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
              {GENRE_TAGS.map((tag) => {
                const isActive = selectedTag === tag.value;
                return (
                  <button
                    key={tag.value}
                    onClick={() => setSelectedTag(tag.value)}
                    className="neon-premium rounded-xl transition-all"
                  >
                    <div className="neon-premium-track rounded-xl" />
                    <div className="neon-premium-overlay rounded-[10.5px]" />
                    <div className="neon-premium-content px-3 py-1.5 text-[10px] font-bold" style={{
                      color: isActive ? "#ff00ff" : "var(--color-mute)",
                      background: isActive ? "rgba(255,0,255,0.08)" : undefined,
                    }}>
                      {tag.label}
                    </div>
                  </button>
                );
              })}
              {allTags.filter((t) => !GENRE_TAGS.some((g) => g.value === t)).slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                  className="neon-premium rounded-xl transition-all"
                >
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content px-3 py-1.5 text-[10px] font-bold" style={{
                    color: selectedTag === tag ? "#00ffff" : "var(--color-mute)",
                    background: selectedTag === tag ? "rgba(0,255,255,0.08)" : undefined,
                  }}>
                    #{tag}
                  </div>
                </button>
              ))}
            </div>

            {/* Results */}
            {loading ? (
              <Loader />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-sm text-[var(--color-mute)]">No doujinshi found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((entry) => (
                  <DoujinshiCard key={entry.id} entry={entry} onTrack={handleTrack} trackedStatus={trackedMap[entry.id] || null} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="h-12" />
    </div>
  );
}
