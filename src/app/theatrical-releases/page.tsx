"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";
import TrailerModal from "@/components/TrailerModal";
import type { TheatricalRelease } from "@/lib/theatrical-releases";

const STATUS_FILTERS = ["All", "Released", "Upcoming"] as const;
const YEAR_FILTERS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2019", "2017"] as const;

interface TheatricalStats {
  totalReleases: number;
  releasedInIndia: number;
  upcomingReleases: number;
  topBoxOffice: TheatricalRelease[];
  lastUpdated: string;
}

interface ApiResponse {
  releases: TheatricalRelease[];
  stats: TheatricalStats;
  total: number;
}

export default function TheatricalReleasesPage() {
  const [statusFilter, setStatusFilter] = useState<"All" | "Released" | "Upcoming">("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [releases, setReleases] = useState<TheatricalRelease[]>([]);
  const [stats, setStats] = useState<TheatricalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "All") params.set("status", statusFilter.toLowerCase());
        if (yearFilter !== "All") params.set("year", yearFilter);
        if (search) params.set("search", search);

        const res = await fetch(`/api/theatrical-releases?${params.toString()}`);
        const data: ApiResponse = await res.json();
        setReleases(data.releases);
        setStats(data.stats);
      } catch {
        setReleases([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [statusFilter, yearFilter, search]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
            Anime Movies in India
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-2">
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
              <span className="neon-text-gradient">Theatrical Releases</span>
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--color-mute)]">
            Complete list of anime movies released in Indian theatres with verified box office data and streaming info.
          </p>
          {stats?.lastUpdated && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">
              Last Updated: {stats.lastUpdated}
            </p>
          )}
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="theorem-stat-card">
              <div className="rounded-xl bg-[var(--color-panel)] p-4 text-center">
                <p className="text-3xl font-black text-[var(--color-cyan)]">{stats.totalReleases}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">Total Movies</p>
              </div>
            </div>
            <div className="theorem-stat-card">
              <div className="rounded-xl bg-[var(--color-panel)] p-4 text-center">
                <p className="text-3xl font-black text-green-400">{stats.releasedInIndia}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">Released</p>
              </div>
            </div>
            <div className="theorem-stat-card">
              <div className="rounded-xl bg-[var(--color-panel)] p-4 text-center">
                <p className="text-3xl font-black text-yellow-400">{stats.upcomingReleases}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">Upcoming</p>
              </div>
            </div>
            <div className="theorem-stat-card">
              <div className="rounded-xl bg-[var(--color-panel)] p-4 text-center">
                <p className="text-3xl font-black text-purple-400">
                  {stats.topBoxOffice[0]?.boxOfficeIndia || "N/A"}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]">Top Collection</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="neon-input flex-1 min-w-[200px] sm:max-w-xs">
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl bg-[var(--color-void)] px-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-1 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === f
                    ? "bg-[var(--color-cyan)] text-black shadow-lg shadow-[var(--color-cyan)]/20"
                    : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-1 overflow-x-auto">
            {YEAR_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setYearFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                  yearFilter === f
                    ? "bg-[var(--color-magenta)] text-black shadow-lg shadow-[var(--color-magenta)]/20"
                    : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="theorem-card">
                <div className="theorem-glow" />
                <div className="rounded-xl bg-[var(--color-panel)] overflow-hidden">
                  <div className="aspect-[16/9] shimmer" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 rounded shimmer" />
                    <div className="h-3 w-full rounded shimmer" />
                    <div className="h-3 w-2/3 rounded shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onPlayTrailer={() => setTrailerUrl(movie.trailerUrl ?? null)} />
            ))}
          </div>
        )}

        {!loading && releases.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-bold text-[var(--color-ink)]">No movies found</p>
            <p className="mt-2 text-sm text-[var(--color-mute)]">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
      <TrailerModal url={trailerUrl} onClose={() => setTrailerUrl(null)} />
    </PageTransition>
  );
}

function MovieCard({ movie, onPlayTrailer }: { movie: TheatricalRelease; onPlayTrailer: () => void }) {
  return (
    <div className="theorem-card group cursor-pointer transition-all duration-500">
      <div className="theorem-glow" />
      <div className="rounded-xl bg-[var(--color-panel)] overflow-hidden">
        {/* Poster */}
        <div className="theorem-poster relative aspect-[16/9]">
          <Image
            src={movie.image}
            alt={movie.displayTitle}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
              {movie.displayTitle}
            </h3>
            <p className="mt-1 text-xs text-white/60">
              {movie.releaseDate} {movie.distributor && `• ${movie.distributor}`}
            </p>
          </div>
          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            {movie.status === "upcoming" && (
              <span className="theorem-badge-upcoming rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Upcoming
              </span>
            )}
            {movie.status === "released" && (
              <span className="theorem-badge-released rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Released
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="theorem-info p-4">
          {/* Genres */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="rounded-full bg-[var(--color-line)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-mute)] transition-colors group-hover:border group-hover:border-[var(--color-cyan)]/20"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="mb-3 text-xs leading-relaxed text-[var(--color-mute)] line-clamp-2">
            {movie.synopsis}
          </p>

          {/* Box Office */}
          {movie.boxOfficeIndia && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--color-line)] px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">India</span>
              <span className="text-sm font-bold text-green-400">{movie.boxOfficeIndia}</span>
            </div>
          )}
          {movie.boxOfficeWorldwide && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--color-line)] px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Worldwide</span>
              <span className="text-sm font-bold text-[var(--color-cyan)]">{movie.boxOfficeWorldwide}</span>
            </div>
          )}

          {/* Rating & Languages */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[var(--color-line)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-ink)]">
              {movie.rating}
            </span>
            {movie.languages.slice(0, 3).map((l) => (
              <span key={l} className="rounded-md bg-[var(--color-line)] px-2 py-0.5 text-[10px] text-[var(--color-mute)]">
                {l}
              </span>
            ))}
            {movie.languages.length > 3 && (
              <span className="text-[10px] text-[var(--color-mute)]">+{movie.languages.length - 3}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {movie.trailerUrl && (
              <button
                onClick={onPlayTrailer}
                className="flex-1 rounded-lg bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] px-3 py-2 text-center text-xs font-bold text-black transition-all hover:shadow-lg hover:shadow-[var(--color-magenta)]/20 hover:scale-[1.02]"
              >
                Watch Trailer
              </button>
            )}
            {movie.imdbUrl && (
              <a
                href={movie.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-yellow-500/90 px-3 py-2 text-xs font-bold text-black transition-all hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20"
              >
                IMDb
              </a>
            )}
            {movie.malUrl && (
              <a
                href={movie.malUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg neon-rgb-border bg-[var(--color-line)] px-3 py-2 text-[10px] font-bold text-[var(--color-mute)] transition-all hover:border-[var(--color-cyan)]/30 hover:text-[var(--color-cyan)]"
              >
                MAL
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
