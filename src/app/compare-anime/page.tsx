"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface CompareAnime {
  id: number;
  title: string;
  originalTitle: string;
  nativeTitle: string;
  coverImage: string | null;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  genres: string[];
  studios: string[];
  source: string | null;
  startDate: { year?: number; month?: number; day?: number } | null;
  endDate: { year?: number; month?: number; day?: number } | null;
  bannerImage: string | null;
  color: string | null;
}

interface SearchResult { id: number; title: string; poster?: string | null; format: string | null; year: number | null; }

const MAX_COMPARE = 5;

function formatYear(date: { year?: number; month?: number; day?: number } | null): string {
  if (!date?.year) return "—";
  const m = date.month ? `-${String(date.month).padStart(2, "0")}` : "";
  const d = date.day ? `-${String(date.day).padStart(2, "0")}` : "";
  return `${date.year}${m}${d}`;
}

function formatStatus(status: string | null): string {
  if (!status) return "—";
  const map: Record<string, string> = {
    FINISHED: "Finished",
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Not Yet Aired",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  return map[status] || status;
}

function Cell({ value, highlight }: { value: string | number; highlight?: boolean }) {
  return (
    <td className={`px-3 py-2.5 text-sm text-center ${highlight ? "text-[var(--color-cyan)] font-bold" : "text-[var(--color-mute)]"}`}>{value}</td>
  );
}

function ScoreCell({ value }: { value: number | null }) {
  if (value == null) return <td className="px-3 py-2.5 text-center text-sm text-[var(--color-mute)]">—</td>;
  const color = value >= 80 ? "#00ff7f" : value >= 60 ? "#ffd700" : "#ff6b6b";
  return <td className="px-3 py-2.5 text-center text-sm font-bold" style={{ color }}>{value}</td>;
}

export default function CompareAnimePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selected, setSelected] = useState<CompareAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function handleSearch(q: string) {
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setResults([]); setSuggestOpen(false); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/unified?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults((data.anime || []).slice(0, 8));
        setSuggestOpen(true);
      } catch { setResults([]); setSuggestOpen(false); }
    }, 250);
  }

  async function addAnime(id: number) {
    setSuggestOpen(false);
    setQuery("");
    setResults([]);
    if (selected.some((m) => m.id === id)) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/compare-anime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected.map((m) => m.id), id] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSelected(data.media);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add anime");
    } finally {
      setLoading(false);
    }
  }

  function removeAnime(id: number) {
    setSelected((prev) => prev.filter((m) => m.id !== id));
  }

  function reloadAll() {
    if (selected.length === 0) return;
    setLoading(true);
    setError("");
    fetch("/api/compare-anime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected.map((m) => m.id) }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.media) setSelected(d.media); })
      .catch(() => setError("Failed to refresh"))
      .finally(() => setLoading(false));
  }

  const columns = selected.length > 0 ? selected.slice(0, MAX_COMPARE) : [];
  const allGenres = columns.flatMap((m) => m.genres);
  const genreUnique = [...new Set(allGenres)];
  const maxPopularity = Math.max(0, ...columns.map((m) => m.popularity || 0));
  const maxEpisodes = Math.max(0, ...columns.map((m) => m.episodes || 0));

  return (
    <div className="min-h-screen animate-page-in">
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[var(--color-void)]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-blue-500/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="neon-rgb-border rounded-xl h-12 w-12 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
              <span className="text-2xl">⚔️</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">Compare</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink)]">
            Anime <span className="text-[var(--color-cyan)]">Side-by-Side</span>
          </h1>
          <p className="mt-3 text-base text-[var(--color-mute)] max-w-xl">
            Compare up to {MAX_COMPARE} anime at once — scores, popularity, episodes, genres, studios, and more.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Search / add */}
        <div className="relative mb-8 max-w-2xl" ref={wrapRef}>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 neon-rgb-border focus-within:shadow-[0_0_16px_var(--color-cyan)] transition-shadow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Add anime to compare (${selected.length}/${MAX_COMPARE})...`}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
            />
            {selected.length > 0 && (
              <button onClick={reloadAll} className="text-xs text-[var(--color-cyan)] hover:underline shrink-0 ml-auto">⟳ Refresh</button>
            )}
          </div>
          {suggestOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[var(--color-panel)] border border-[var(--color-line)] shadow-2xl z-20 overflow-hidden max-h-80 overflow-y-auto">
              {results.map((r) => (
                <button key={r.id} onClick={() => addAnime(r.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left transition-colors disabled:opacity-50"
                  disabled={selected.some((m) => m.id === r.id)}
                >
                  {r.poster ? (
                    <div className="relative h-12 w-8 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
                      <Image src={r.poster} alt="" fill className="object-cover" sizes="32px" unoptimized />
                    </div>
                  ) : (
                    <div className="h-12 w-8 rounded bg-white/5 shrink-0 flex items-center justify-center text-sm">🎬</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">{r.format || "Anime"}{r.year ? ` · ${r.year}` : ""}</p>
                  </div>
                  <span className="text-[var(--color-cyan)] text-xs">{selected.some((m) => m.id === r.id) ? "Added" : "Add +"}</span>
                </button>
              ))}
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><div className="h-8 w-8 rounded-full border-2 border-[var(--color-cyan)] border-t-transparent animate-spin" /></div>
        ) : columns.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🎌</div>
            <p className="text-[var(--color-mute)]">Search above to add anime and start comparing!</p>
            <p className="text-xs text-[var(--color-mute)]/60 mt-2">Popular: Naruto, One Piece, Steins;Gate, Cowboy Bebop...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl neon-rgb-border bg-[var(--color-panel)]/40">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--color-mute)] w-40">Title</th>
                  {columns.map((m) => (
                    <th key={m.id} className="px-3 py-3 text-center min-w-[150px] align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="relative h-28 w-20 rounded-lg overflow-hidden border border-[var(--color-line)] group">
                          {m.coverImage && <Image src={m.coverImage} alt={m.title} fill className="object-cover" sizes="80px" unoptimized />}
                        </div>
                        <div className="text-center">
                          <Link href={`/anime/${m.id}`} className="block text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-cyan)] transition-colors leading-tight">{m.title}</Link>
                          {m.nativeTitle && <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{m.nativeTitle}</p>}
                        </div>
                        <button onClick={() => removeAnime(m.id)} className="text-[10px] text-red-400/60 hover:text-red-400 mt-0.5">✕ Remove</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Score</td>
                  {columns.map((m) => <ScoreCell key={m.id} value={m.averageScore} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Popularity</td>
                  {columns.map((m) => {
                    const pct = maxPopularity > 0 ? (m.popularity || 0) / maxPopularity : 0;
                    return (
                      <td key={m.id} className="px-3 py-2.5 text-center">
                        <div className="text-sm text-[var(--color-mute)]">{m.popularity ? m.popularity.toLocaleString() : "—"}</div>
                        <div className="h-1 w-full bg-white/5 rounded mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded" style={{ width: `${pct * 100}%` }} /></div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Favourites</td>
                  {columns.map((m) => <Cell key={m.id} value={m.favourites ? m.favourites.toLocaleString() : "—"} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Format</td>
                  {columns.map((m) => <Cell key={m.id} value={m.format || "—"} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Status</td>
                  {columns.map((m) => <Cell key={m.id} value={formatStatus(m.status)} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Episodes</td>
                  {columns.map((m) => {
                    const pct = maxEpisodes > 0 ? (m.episodes || 0) / maxEpisodes : 0;
                    return (
                      <td key={m.id} className="px-3 py-2.5 text-center">
                        <div className="text-sm text-[var(--color-mute)]">{m.episodes ?? "—"}</div>
                        <div className="h-1 w-full bg-white/5 rounded mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded" style={{ width: `${pct * 100}%` }} /></div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Episode Length</td>
                  {columns.map((m) => <Cell key={m.id} value={m.duration ? `${m.duration} min` : "—"} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Season</td>
                  {columns.map((m) => <Cell key={m.id} value={m.seasonYear ? `${m.season || ""} ${m.seasonYear}` : "—"} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Aired</td>
                  {columns.map((m) => <Cell key={m.id} value={`${formatYear(m.startDate)} → ${formatYear(m.endDate)}`} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Source</td>
                  {columns.map((m) => <Cell key={m.id} value={m.source || "—"} />)}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Genres</td>
                  {columns.map((m) => (
                    <td key={m.id} className="px-3 py-2.5"><div className="flex flex-wrap gap-1 justify-center">{(m.genres || []).map((g) => <span key={g} className="px-1.5 py-0.5 rounded bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] text-[10px]">{g}</span>)}</div></td>
                  ))}
                </tr>
                <tr className="border-b border-[var(--color-line)]"><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Studios</td>
                  {columns.map((m) => (
                    <td key={m.id} className="px-3 py-2.5 text-center text-sm text-[var(--color-mute)]">{(m.studios || []).join(", ") || "—"}</td>
                  ))}
                </tr>
                <tr><td className="px-4 py-2.5 text-xs font-mono uppercase text-[var(--color-mute)]">Shared Genres</td>
                  <td colSpan={columns.length} className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {genreUnique.map((g) => {
                        const count = columns.filter((m) => m.genres.includes(g)).length;
                        if (count < 2) return null;
                        return <span key={g} className="px-2 py-0.5 rounded bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] text-[11px]">{g} ×{count}</span>;
                      })}
                      {genreUnique.filter((g) => columns.filter((m) => m.genres.includes(g)).length < 2).length === genreUnique.length && <span className="text-xs text-[var(--color-mute)]">No shared genres</span>}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}