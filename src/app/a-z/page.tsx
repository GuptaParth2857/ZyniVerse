"use client";

import { useState, useEffect } from "react";
import { searchMedia, bestTitle } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";
import CardSkeleton from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";
import type { Media } from "@/lib/anilist";

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function AZPage() {
  const [activeLetter, setActiveLetter] = useState<string>("A");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setResults([]);
    setPage(1);
    /* eslint-enable react-hooks/set-state-in-effect */

    const query = activeLetter === "#" ? "" : activeLetter;

    searchMedia({ search: query, sort: "POPULARITY_DESC", perPage: 30, page: 1 })
      .then((d) => {
        if (cancelled) return;
        const filtered = activeLetter === "#"
          ? d.media.filter((m) => !/^[a-zA-Z]/.test(bestTitle(m.title)[0] || ""))
          : d.media.filter((m) => bestTitle(m.title)[0]?.toUpperCase() === activeLetter);
        setResults(filtered);
        setTotalPages(Math.ceil(d.pageInfo.total / 30));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeLetter]);

  useEffect(() => {
    if (page <= 1) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const query = activeLetter === "#" ? "" : activeLetter;

    searchMedia({ search: query, sort: "POPULARITY_DESC", perPage: 30, page })
      .then((d) => {
        if (cancelled) return;
        const filtered = activeLetter === "#"
          ? d.media.filter((m) => !/^[a-zA-Z]/.test(bestTitle(m.title)[0] || ""))
          : d.media.filter((m) => bestTitle(m.title)[0]?.toUpperCase() === activeLetter);
        setResults((prev) => [...prev, ...filtered]);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, activeLetter]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-8">
          <h1 className="font-display text-3xl font-bold text-white">A – Z Anime Index</h1>
        </div>
        <p className="text-[var(--color-mute)] mb-8 max-w-2xl">
          Browse every anime alphabetically. Click a letter to explore popular titles starting with it.
        </p>

        {/* Letter grid */}
        <div className="flex flex-wrap gap-2 mb-10">
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => { setActiveLetter(l); setPage(1); }}
              className={`h-10 w-10 rounded-lg font-mono text-sm font-bold transition-all ${
                activeLetter === l
                  ? "bg-[var(--color-violet)] text-white shadow-lg shadow-[var(--color-violet)]/25"
                  : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && results.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-mute)] text-lg">No anime found starting with <span className="text-white font-bold">{activeLetter}</span></p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((a) => <AnimeCard key={a.id} anime={a} />)}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="neon-rgb-border rounded-xl px-8 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
