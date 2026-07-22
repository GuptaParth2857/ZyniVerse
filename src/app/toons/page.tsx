"use client";

import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { TOONS_DATABASE, TOON_STATS } from "@/lib/toons-data";
import type { CartoonEntry } from "@/lib/toons-data";

const NETWORK_FILTERS = ["All", "Indian", "International", ...TOON_STATS.networks] as const;

export default function ToonsPage() {
  const [networkFilter, setNetworkFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "airing" | "completed">("All");
  const [search, setSearch] = useState("");

  const filtered = TOONS_DATABASE.filter((t) => {
    if (networkFilter === "Indian" && t.country !== "India") return false;
    if (networkFilter === "International" && t.country === "India") return false;
    if (networkFilter !== "All" && networkFilter !== "Indian" && networkFilter !== "International" && t.network !== networkFilter) return false;
    if (statusFilter === "airing" && t.status !== "airing") return false;
    if (statusFilter === "completed" && t.status !== "completed") return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Cartoons & Toons
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            Toons Section
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Indian originals and international cartoons popular in India. Hindi dubbed info included.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-cyan)]">{TOON_STATS.totalCartoons}</p>
            <p className="text-xs text-[var(--color-mute)]">Total Toons</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{TOON_STATS.indianOriginals}</p>
            <p className="text-xs text-[var(--color-mute)]">Indian Originals</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{TOON_STATS.internationalPopular}</p>
            <p className="text-xs text-[var(--color-mute)]">International</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{TOON_STATS.airingShows}</p>
            <p className="text-xs text-[var(--color-mute)]">Currently Airing</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search toons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
          />
          <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-1">
            {NETWORK_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setNetworkFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  networkFilter === f
                    ? "bg-[var(--color-cyan)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-text)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-1">
            {(["All", "airing", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f
                    ? "bg-[var(--color-cyan)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-text)]"
                }`}
              >
                {f === "airing" ? "Airing" : f === "completed" ? "Completed" : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Toon Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((toon) => (
            <ToonCard key={toon.id} toon={toon} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-[var(--color-mute)]">
            No toons found matching your filters.
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function ToonCard({ toon }: { toon: CartoonEntry }) {
  const countryFlag = toon.country === "India" ? "🇮🇳" : toon.country === "Japan" ? "🇯🇵" : "🇺🇸";
  
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] transition-all hover:border-[var(--color-cyan)] hover:shadow-lg hover:shadow-[var(--color-cyan)]/5">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={toon.image}
          alt={toon.displayTitle}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white line-clamp-1">{toon.displayTitle}</h3>
          <p className="text-xs text-white/70">{toon.network} • {countryFlag} {toon.country}</p>
        </div>
        {toon.status === "airing" && (
          <span className="absolute top-3 right-3 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-black">
            AIRING
          </span>
        )}
        {toon.popularity === "high" && (
          <span className="absolute top-3 left-3 rounded-full bg-yellow-500 px-2.5 py-0.5 text-xs font-bold text-black">
            POPULAR
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex flex-wrap gap-1">
          {toon.genres.slice(0, 3).map((g) => (
            <span key={g} className="rounded-full bg-[var(--color-surface2)] px-2 py-0.5 text-[10px] text-[var(--color-mute)]">
              {g}
            </span>
          ))}
        </div>
        <p className="mb-3 text-xs text-[var(--color-mute)] line-clamp-2">{toon.synopsis}</p>
        
        <div className="flex items-center justify-between text-[10px] text-[var(--color-mute)]">
          <span>{toon.totalEpisodes} episodes</span>
          <span>{toon.seasons} seasons</span>
          <span>{toon.releaseYear}</span>
        </div>

        {toon.language.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {toon.language.map((l) => (
              <span key={l} className="rounded bg-[var(--color-surface2)] px-1.5 py-0.5 text-[9px] text-[var(--color-mute)]">
                {l}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          {toon.dubPlatform && (
            <span className="flex-1 rounded-lg bg-[var(--color-cyan)]/10 px-3 py-1.5 text-center text-[10px] font-medium text-[var(--color-cyan)]">
              Watch on {toon.dubPlatform}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
