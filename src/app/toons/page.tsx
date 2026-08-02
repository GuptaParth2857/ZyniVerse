"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { TOONS_DATABASE, TOON_STATS } from "@/lib/toons-data";
import type { CartoonEntry } from "@/lib/toons-data";

const NETWORK_FILTERS = ["All", "Indian", "International"] as const;
const GENRE_FILTERS = ["All", "Comedy", "Action", "Adventure", "Sci-Fi", "Fantasy", "Slice of Life"] as const;
const STATUS_FILTERS = ["All", "Airing", "Completed"] as const;

export default function ToonsPage() {
  const [networkFilter, setNetworkFilter] = useState<string>("All");
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = TOONS_DATABASE.filter((t) => {
    if (networkFilter === "Indian" && t.country !== "India") return false;
    if (networkFilter === "International" && t.country === "India") return false;
    if (genreFilter !== "All" && !t.genres.includes(genreFilter)) return false;
    if (statusFilter === "Airing" && t.status !== "airing") return false;
    if (statusFilter === "Completed" && t.status !== "completed") return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.displayTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Toons</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Cartoons & Toons</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight mt-1">
              Indian & International Toons
            </h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
            From Chhota Bheem to Doraemon — every cartoon popular in India with Hindi dub info, episode counts & where to watch.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Toons", value: TOON_STATS.totalCartoons, color: "var(--color-cyan)" },
            { label: "Indian Originals", value: TOON_STATS.indianOriginals, color: "#ff9933" },
            { label: "International", value: TOON_STATS.internationalPopular, color: "#3b82f6" },
            { label: "Currently Airing", value: TOON_STATS.airingShows, color: "#22c55e" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 text-center">
              <p className="font-display text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 max-w-xl">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search toons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl neon-rgb-border bg-[var(--color-panel)] py-3 pl-11 pr-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] outline-none focus:border-[var(--color-cyan)] transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-3">
          {/* Network Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] self-center mr-1">Region:</span>
            {NETWORK_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setNetworkFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  networkFilter === f
                    ? "bg-[var(--color-magenta)] text-black"
                    : "neon-rgb-border text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] self-center mr-1">Genre:</span>
            {GENRE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setGenreFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  genreFilter === f
                    ? "bg-[var(--color-cyan)] text-black"
                    : "neon-rgb-border text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] self-center mr-1">Status:</span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === f
                    ? "bg-[var(--color-amber)] text-black"
                    : "neon-rgb-border text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-5 font-mono text-[11px] text-[var(--color-mute)] tracking-wider uppercase">
          {filtered.length} {filtered.length === 1 ? "toon" : "toons"} found
        </p>

        {/* Toon Grid — Premium Neon Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((toon, idx) => (
            <ToonCard key={toon.id} toon={toon} index={idx} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-[var(--color-panel)] border border-[var(--color-line)] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 11h6" />
              </svg>
            </div>
            <p className="font-display text-lg font-bold text-[var(--color-mute)]">No toons found</p>
            <p className="mt-1 text-sm text-[var(--color-mute)] opacity-60">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setNetworkFilter("All"); setGenreFilter("All"); setStatusFilter("All"); setSearch(""); }}
              className="mt-4 rounded-full neon-rgb-border px-4 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function ToonCard({ toon, index }: { toon: CartoonEntry; index: number }) {
  const countryFlag = toon.country === "India" ? "🇮🇳" : toon.country === "Japan" ? "🇯🇵" : toon.country === "France" ? "🇫🇷" : "🇺🇸";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="toon-card rounded-xl group"
    >
      <div className="relative z-10 rounded-[10.5px] overflow-hidden bg-[var(--color-panel)]">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {toon.image ? (
            <Image
              src={toon.image}
              alt={toon.displayTitle}
              fill
              loading="lazy"
              referrerPolicy="no-referrer"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = parent.querySelector(".toon-fallback");
                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                }
              }}
            />
          ) : null}
          <div className={`toon-fallback ${toon.image ? "hidden" : "flex"} absolute inset-0 items-center justify-center`}
            style={{
              background: `linear-gradient(135deg, ${toon.country === "India" ? "#ff6b35, #1a1a2e" : toon.country === "Japan" ? "#e50914, #1a1a2e" : "#00b4d8, #1a1a2e"})`,
            }}
          >
            <div className="text-center">
              <span className="text-3xl font-black text-white/90 drop-shadow-lg">
                {toon.displayTitle.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase()}
              </span>
              <p className="mt-1 text-[10px] font-semibold text-white/60">{toon.network}</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {toon.status === "airing" && (
              <span className="flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[9px] font-bold text-black backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                AIRING
              </span>
            )}
            {toon.popularity === "high" && (
              <span className="rounded-full bg-yellow-500/90 px-2 py-0.5 text-[9px] font-bold text-black backdrop-blur-sm">
                POPULAR
              </span>
            )}
          </div>

          {/* Country Flag */}
          <span className="absolute top-2 right-2 text-lg drop-shadow-lg">{countryFlag}</span>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-display text-sm font-bold text-white line-clamp-1 drop-shadow-lg">{toon.displayTitle}</h3>
            <p className="text-[10px] text-white/70">{toon.network} · {toon.releaseYear}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Genres */}
          <div className="mb-2 flex flex-wrap gap-1">
            {toon.genres.slice(0, 3).map((g) => (
              <span key={g} className="rounded-full bg-[var(--color-line)]/50 px-2 py-0.5 text-[9px] text-[var(--color-mute)]">
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-[11px] text-[var(--color-mute)] line-clamp-2 leading-relaxed mb-3">{toon.synopsis}</p>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-[9px] text-[var(--color-mute)] font-mono mb-2">
            <span>{toon.totalEpisodes} eps</span>
            <span>{toon.seasons} seasons</span>
            <span>{toon.releaseYear}</span>
          </div>

          {/* Languages */}
          {toon.language.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {toon.language.slice(0, 4).map((l) => (
                <span key={l} className="rounded bg-[var(--color-cyan)]/10 px-1.5 py-0.5 text-[8px] text-[var(--color-cyan)] font-medium">
                  {l}
                </span>
              ))}
              {toon.language.length > 4 && (
                <span className="rounded bg-[var(--color-line)]/50 px-1.5 py-0.5 text-[8px] text-[var(--color-mute)]">
                  +{toon.language.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Watch Platform */}
          {toon.dubPlatform && (
            <div className="rounded-lg bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/15 px-3 py-2 text-center">
              <p className="text-[9px] text-[var(--color-mute)]">Watch on</p>
              <p className="text-[10px] font-bold text-[var(--color-cyan)]">{toon.dubPlatform}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
