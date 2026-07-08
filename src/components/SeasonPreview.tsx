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
}

export default function SeasonPreview() {
  const [anime, setAnime] = useState<UpcomingAnime[]>([]);
  const [season, setSeason] = useState("");
  const [year, setYear] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/season/upcoming")
      .then((r) => r.json())
      .then((d) => { setAnime(d.anime || []); setSeason(d.season); setYear(d.year); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-48 bg-white/5 rounded-xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">{season} {year} Preview</h2>
        <Link href="/season/upcoming" className="text-sm text-emerald-400 hover:underline">View all →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {anime.slice(0, 10).map((a) => (
          <Link key={a.malId} href={`/anime/${a.malId}`} className="group">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5">
              <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              {a.trailer && (
                <a href={a.trailer} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/80 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </a>
              )}
            </div>
            <div className="mt-2">
              <div className="text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{a.title}</div>
              <div className="text-xs text-white/40 truncate">{a.genres.slice(0, 2).join(", ")}</div>
              {a.score && <div className="text-xs text-amber-400 mt-0.5">{a.score}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
