"use client";

import { useState } from "react";

const FORMAT_OPTIONS = [
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "SPECIAL", label: "Special" },
  { value: "TV_SHORT", label: "TV Short" },
];

const SORT_OPTIONS = [
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "SCORE_DESC", label: "Highest Score" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "TITLE_ROMAJI_ASC", label: "A-Z" },
  { value: "START_DATE_DESC", label: "Newest" },
];

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

export interface SeasonalFiltersState {
  format: string[];
  genres: string[];
  sort: string;
  minScore: number;
}

export default function SeasonalFilters({
  filters,
  onChange,
}: {
  filters: SeasonalFiltersState;
  onChange: (f: SeasonalFiltersState) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const toggleFormat = (fmt: string) => {
    const next = filters.format.includes(fmt)
      ? filters.format.filter((f) => f !== fmt)
      : [...filters.format, fmt];
    onChange({ ...filters, format: next });
  };

  const toggleGenre = (g: string) => {
    const next = filters.genres.includes(g)
      ? filters.genres.filter((x) => x !== g)
      : [...filters.genres, g];
    onChange({ ...filters, genres: next });
  };

  const hasFilters = filters.format.length > 0 || filters.genres.length > 0 || filters.minScore > 0;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            expanded
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
              : "border-white/10 text-white/60 hover:border-white/30"
          }`}
        >
          Filters {hasFilters ? `(${filters.format.length + filters.genres.length + (filters.minScore > 0 ? 1 : 0)})` : ""}
        </button>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 focus:outline-none"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => onChange({ format: [], genres: [], sort: "POPULARITY_DESC", minScore: 0 })}
            className="text-xs text-pink-400 hover:text-pink-300"
          >
            Clear
          </button>
        )}
      </div>
      {expanded && (
        <div className="mt-3 p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
          <div>
            <h4 className="text-xs text-white/50 mb-2">Format</h4>
            <div className="flex flex-wrap gap-2">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => toggleFormat(f.value)}
                  className={`px-3 py-1 text-[10px] rounded-full border transition-colors ${
                    filters.format.includes(f.value)
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                      : "border-white/10 text-white/50 hover:border-white/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-white/50 mb-2">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 text-[10px] rounded-full border transition-colors ${
                    filters.genres.includes(g)
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                      : "border-white/10 text-white/50 hover:border-white/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-white/50 mb-2">
              Minimum Score: {filters.minScore > 0 ? filters.minScore : "Any"}
            </h4>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.minScore}
              onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
