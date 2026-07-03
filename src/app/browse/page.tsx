"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getAnimeGallery, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import type { AnimeWithCharacters } from "@/lib/anilist";

export default function BrowsePage() {
  const [animeList, setAnimeList] = useState<AnimeWithCharacters[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AnimeWithCharacters | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAnimeGallery()
      .then((d) => !cancelled && setAnimeList(d))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  if (loading) return <Loader label="Loading anime gallery..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;

  return (
    <PageTransition><div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">Browse Anime</h1>
          <p className="mt-2 text-[var(--color-mute)]">Click any cover to explore its characters</p>
        </div>

        {/* Cover Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {animeList.map((anime) => {
            const chars = anime.characters?.edges || [];
            return (
              <motion.button
                key={anime.id}
                layoutId={`cover-${anime.id}`}
                onClick={() => setSelected(anime)}
                className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--color-line)] text-left focus:outline-none"
                whileHover={{ scale: 1.03, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <img
                  src={anime.coverImage?.extraLarge || anime.coverImage?.large}
                  alt={bestTitle(anime.title)}
                  className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-sm font-bold truncate drop-shadow-lg">{bestTitle(anime.title)}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-white/70">
                    {anime.averageScore ? <span>★ {(anime.averageScore / 10).toFixed(1)}</span> : null}
                    {anime.favourites ? <span>♥ {anime.favourites.toLocaleString()}</span> : null}
                    {chars.length > 0 && <span>{chars.length} characters</span>}
                  </div>
                </div>
                {/* Overlay indicator */}
                <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                  View Characters →
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* No results */}
        {animeList.length === 0 && (
          <p className="py-16 text-center text-sm text-[var(--color-mute)]">No anime found.</p>
        )}

        <div className="mt-8 text-center text-xs text-[var(--color-mute)]">
          Data from <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">AniList</a>.
        </div>
      </div>

      {/* ── Character Reveal Overlay ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm py-10"
            onClick={close}
          >
            <motion.div
              layoutId={`cover-${selected.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]"
            >
              {/* Header */}
              <div className="relative h-48 sm:h-64 overflow-hidden">
                <img
                  src={selected.coverImage?.extraLarge || selected.coverImage?.large}
                  alt=""
                  className="h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end gap-4">
                  <img
                    src={selected.coverImage?.large}
                    alt={bestTitle(selected.title)}
                    className="h-24 w-16 rounded-lg border-2 border-[var(--color-line)] object-cover shadow-lg sm:h-32 sm:w-22"
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-bold sm:text-4xl truncate">{bestTitle(selected.title)}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[var(--color-mute)]">
                      {selected.averageScore ? <span>★ {(selected.averageScore / 10).toFixed(1)}</span> : null}
                      {selected.format ? <span>{selected.format}</span> : null}
                      {selected.episodes ? <span>{selected.episodes} eps</span> : null}
                      {selected.favourites ? <span>♥ {selected.favourites.toLocaleString()}</span> : null}
                    </div>
                  </div>
                </div>
                <button onClick={close}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 hover:text-white transition-all backdrop-blur"
                >✕</button>
              </div>

              {/* Characters Grid */}
              <div className="p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
                  Characters
                  <span className="text-sm font-normal text-[var(--color-mute)]">({(selected.characters?.edges || []).length})</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {(selected.characters?.edges || []).map((edge, i) => (
                    <motion.div
                      key={edge.node.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <Link href={`/character/${edge.node.id}`}
                        className="group flex flex-col items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] p-4 text-center hover:border-[var(--color-magenta)]/40 transition-all hover:-translate-y-0.5"
                      >
                        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--color-line)] group-hover:border-[var(--color-magenta)]/50 transition-colors">
                          <img src={edge.node.image?.medium} alt={edge.node.name?.full}
                            className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-2 text-sm font-semibold truncate w-full">{edge.node.name?.full}</p>
                        <p className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider mt-0.5">{edge.role || edge.name}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                {(!selected.characters?.edges || selected.characters.edges.length === 0) && (
                  <p className="text-center text-sm text-[var(--color-mute)] py-8">No character data available.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div></PageTransition>
  );
}
