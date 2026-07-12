"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UpcomingAnime {
  malId: number;
  title: string;
  titleEnglish: string | null;
  synopsis: string | null;
  image: string;
  trailer: string | null;
  episodes: number | null;
  score: number | null;
  genres: string[];
  studio: string;
  broadcast: string | null;
  airing: boolean;
}

export default function UpcomingSeasonContent() {
  const [anime, setAnime] = useState<UpcomingAnime[]>([]);
  const [season, setSeason] = useState("");
  const [year, setYear] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/api/season/upcoming")
      .then((r) => r.json())
      .then((d) => { setAnime(d.anime || []); setSeason(d.season); setYear(d.year); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-white/5 rounded-lg" />
            <div className="h-4 bg-white/5 rounded mt-2 w-3/4" />
            <div className="h-3 bg-white/5 rounded mt-1 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold capitalize">{season} {year} Season</h1>
          <p className="text-white/50 mt-1">{anime.length} upcoming titles</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button onClick={() => setViewMode("grid")} className={`px-5 py-2.5 rounded text-sm transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>Grid</button>
          <button onClick={() => setViewMode("list")} className={`px-5 py-2.5 rounded text-sm transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>List</button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {anime.map((a) => (
            <Link key={a.malId} href={`/anime/${a.malId}`} className="group">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                {a.trailer && (
                  <a href={a.trailer} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/80 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </a>
                )}
              </div>
              <div className="mt-2.5">
                <div className="text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{a.title}</div>
                <div className="text-xs text-white/40 truncate mt-0.5">{a.genres.slice(0, 3).join(", ")}</div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                  {a.studio && <span>{a.studio}</span>}
                  {a.episodes && <span>{a.episodes} eps</span>}
                  {a.score && <span className="text-amber-400/60">{a.score}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {anime.map((a) => (
            <Link key={a.malId} href={`/anime/${a.malId}`}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
              <img src={a.image} alt={a.title} className="w-12 h-16 object-cover rounded" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="font-medium group-hover:text-emerald-400 transition-colors truncate">{a.title}</div>
                {a.titleEnglish && <div className="text-xs text-white/40 truncate">{a.titleEnglish}</div>}
                <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                  <span>{a.genres.slice(0, 3).join(", ")}</span>
                  {a.studio && <span>• {a.studio}</span>}
                  {a.episodes && <span>• {a.episodes} eps</span>}
                  {a.broadcast && <span>• {a.broadcast}</span>}
                  {a.score && <span className="text-amber-400/60">• {a.score}</span>}
                </div>
              </div>
              {a.trailer && (
                <a href={a.trailer} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
                  Trailer
                </a>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
