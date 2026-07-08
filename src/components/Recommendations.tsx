"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface Recommendation {
  id: number;
  title: string;
  score: number;
  reason: string;
  image: string;
  format: string;
  episodes: number;
  genres: string[];
  matchTags: string[];
}

interface Props {
  type?: "trending" | "similar" | "personalized" | "genre";
  title?: string;
  anilistId?: number;
  genres?: string[];
  exclude?: number[];
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/20 border-green-500/40";
  if (score >= 60) return "bg-yellow-500/20 border-yellow-500/40";
  if (score >= 40) return "bg-orange-500/20 border-orange-500/40";
  return "bg-red-500/20 border-red-500/40";
}

export default function Recommendations({
  type = "trending",
  title = "Recommended for You",
  anilistId,
  genres,
  exclude,
}: Props) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ type });
    if (anilistId) params.set("id", String(anilistId));
    if (genres && genres.length > 0) params.set("genre", genres.join(","));
    if (exclude && exclude.length > 0) params.set("exclude", exclude.join(","));

    fetch(`/api/recommendations?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setRecs(data.recommendations || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [type, anilistId, genres?.join(","), exclude?.join(",")]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [recs]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.6 : el.clientWidth * 0.6, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[160px] animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-white/5 border border-white/10" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/5" />
              <div className="mt-1 h-3 w-1/2 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-red-400">Failed to load recommendations</p>
          <p className="text-xs text-red-400/60 mt-1">{error}</p>
        </div>
      </section>
    );
  }

  if (recs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        </div>
      </div>

      <div className="relative group/row">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recs.map((rec) => (
            <Link
              key={rec.id}
              href={`/anime/${rec.id}`}
              className="snap-start shrink-0 w-[160px] sm:w-[180px] group/card"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 group-hover/card:border-[var(--color-magenta)] group-hover/card:shadow-[0_0_35px_-10px_var(--color-magenta)]">
                <Image
                  src={rec.image}
                  alt={rec.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                {/* Score badge */}
                <span className={`absolute right-1.5 top-1.5 rounded-full border px-1.5 py-0.5 text-[9px] font-mono font-semibold backdrop-blur ${scoreBg(rec.score)} ${scoreColor(rec.score)}`}>
                  {rec.score}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 translate-y-2 group-hover/card:translate-y-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                  <p className="font-display text-xs sm:text-sm font-bold leading-tight line-clamp-2 drop-shadow-lg">
                    {rec.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                    {rec.episodes ? <span>{rec.episodes} ep</span> : null}
                    {rec.format ? <span>{rec.format}</span> : null}
                  </div>
                </div>
              </div>

              {/* Info below card */}
              <div className="mt-2 space-y-1">
                <p className="text-sm font-semibold truncate leading-tight">{rec.title}</p>
                <p className="text-[10px] text-[var(--color-mute)] leading-tight line-clamp-2">{rec.reason}</p>
                <div className="flex flex-wrap gap-1">
                  {rec.genres.slice(0, 2).map((g) => (
                    <span key={g} className="text-[8px] font-medium text-[var(--color-mute)] uppercase tracking-wider bg-[var(--color-void)]/50 px-1.5 py-0.5 rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/3 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-[var(--color-line)] hover:border-[var(--color-magenta)] transition-all opacity-0 group-hover/row:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/3 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white border border-[var(--color-line)] hover:border-[var(--color-magenta)] transition-all opacity-0 group-hover/row:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
      </div>
    </section>
  );
}
