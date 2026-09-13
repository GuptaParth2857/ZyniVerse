"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface AOTD {
  day: string;
  anime: {
    id: number;
    title: string;
    image: string;
    format?: string;
    episodes?: number;
    genres?: string[];
    score?: number;
    status?: string;
  };
  why: string;
}

export default function AnimeOfTheDay() {
  const [data, setData] = useState<AOTD | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/anime-of-the-day")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: AOTD) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) return null;
  if (!data) return null;

  return (
    <Link href={`/anime/${data.anime.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <div className="relative h-40 w-full sm:h-52">
          {data.anime.image ? (
            <Image src={data.anime.image} alt={data.anime.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1200px" loading="eager" priority />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full bg-[var(--color-magenta)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest">
            Anime of the Day
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-display text-2xl font-bold text-white group-hover:text-[var(--color-cyan)] transition-colors sm:text-3xl">
              {data.anime.title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">{data.why}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-xs text-[var(--color-mute)]">
          {data.anime.format && <span>{data.anime.format}</span>}
          {!!data.anime.episodes && <span>• {data.anime.episodes} eps</span>}
          {!!data.anime.score && <span className="text-amber-400">• ★ {data.anime.score}%</span>}
          {data.anime.genres && data.anime.genres.slice(0, 3).map((g) => <span key={g} className="rounded-full border border-[var(--color-line)] px-2 py-0.5">{g}</span>)}
          <span className="ml-auto text-[var(--color-cyan)] group-hover:underline">Explore →</span>
        </div>
      </div>
    </Link>
  );
}
