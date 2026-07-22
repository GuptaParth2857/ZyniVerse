"use client";

import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { THEATRICAL_RELEASES, THEATRICAL_STATS } from "@/lib/theatrical-releases";
import type { TheatricalRelease } from "@/lib/theatrical-releases";

const STATUS_FILTERS = ["All", "Released", "Upcoming"] as const;
const YEAR_FILTERS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2019", "2017"] as const;

export default function TheatricalReleasesPage() {
  const [statusFilter, setStatusFilter] = useState<"All" | "Released" | "Upcoming">("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = THEATRICAL_RELEASES.filter((r) => {
    if (statusFilter === "Released" && r.status !== "released") return false;
    if (statusFilter === "Upcoming" && r.status !== "upcoming") return false;
    if (yearFilter !== "All" && r.releaseYear !== parseInt(yearFilter)) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.displayTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Anime Movies in India
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            Theatrical Releases
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Complete list of anime movies released in India with box office collection and streaming info.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-cyan)]">{THEATRICAL_STATS.totalReleases}</p>
            <p className="text-xs text-[var(--color-mute)]">Total Movies</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{THEATRICAL_STATS.releasedInIndia}</p>
            <p className="text-xs text-[var(--color-mute)]">Released</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{THEATRICAL_STATS.upcomingReleases}</p>
            <p className="text-xs text-[var(--color-mute)]">Upcoming</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">₹{THEATRICAL_STATS.topBoxOffice[0]?.boxOfficeIndia?.split(" ")[0] || "0"}</p>
            <p className="text-xs text-[var(--color-mute)]">Top Collection</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
          />
          <div className="flex gap-1 rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f
                    ? "bg-[var(--color-cyan)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-text)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-1">
            {YEAR_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setYearFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  yearFilter === f
                    ? "bg-[var(--color-cyan)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-text)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-[var(--color-mute)]">
            No movies found matching your filters.
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function MovieCard({ movie }: { movie: TheatricalRelease }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] transition-all hover:border-[var(--color-cyan)] hover:shadow-lg hover:shadow-[var(--color-cyan)]/5">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={movie.image}
          alt={movie.displayTitle}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white line-clamp-1">{movie.displayTitle}</h3>
          <p className="text-xs text-white/70">{movie.releaseDate} • {movie.distributor}</p>
        </div>
        {movie.status === "upcoming" && (
          <span className="absolute top-3 right-3 rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-bold text-black">
            UPCOMING
          </span>
        )}
        {movie.status === "released" && (
          <span className="absolute top-3 right-3 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-black">
            RELEASED
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {movie.genres.map((g) => (
            <span key={g} className="rounded-full bg-[var(--color-surface2)] px-2 py-0.5 text-[10px] text-[var(--color-mute)]">
              {g}
            </span>
          ))}
        </div>
        <p className="mb-3 text-xs text-[var(--color-mute)] line-clamp-2">{movie.synopsis}</p>
        
        {movie.boxOfficeIndia && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--color-surface2)] px-3 py-2">
            <span className="text-xs text-[var(--color-mute)]">India Box Office</span>
            <span className="text-sm font-bold text-green-400">{movie.boxOfficeIndia}</span>
          </div>
        )}
        {movie.boxOfficeWorldwide && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--color-surface2)] px-3 py-2">
            <span className="text-xs text-[var(--color-mute)]">Worldwide</span>
            <span className="text-sm font-bold text-cyan-400">{movie.boxOfficeWorldwide}</span>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded bg-[var(--color-surface2)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text)]">
            {movie.rating}
          </span>
          {movie.languages.map((l) => (
            <span key={l} className="rounded bg-[var(--color-surface2)] px-2 py-0.5 text-[10px] text-[var(--color-mute)]">
              {l}
            </span>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-[var(--color-cyan)] px-3 py-1.5 text-center text-xs font-bold text-black transition-colors hover:bg-[var(--color-cyan)]/80"
            >
              Watch Trailer
            </a>
          )}
          {movie.imdbUrl && (
            <a
              href={movie.imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-yellow-500/80"
            >
              IMDb
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
