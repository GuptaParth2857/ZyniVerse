"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface ThemeGroup {
  mediaId: number;
  title: string;
  image: string | null;
  count: number;
}

export default function ThemesBrowsePage() {
  const [groups, setGroups] = useState<ThemeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearching(false);
      fetch("/api/themes")
        .then((r) => r.json())
        .then((d) => setGroups(d.groups || []));
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/themes?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((d) => { setGroups(d.groups || []); setSearching(false); })
        .catch(() => setSearching(false));
    }, 400);
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 animate-page-in">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Music</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
            <h1 className="font-display text-3xl font-bold">Theme Songs Database</h1>
          </div>
          <p className="text-sm text-[var(--color-mute)] mt-1">Browse opening and ending themes from popular anime</p>
        </div>

        <div className="mb-8 max-w-xl">
          <div className="neon-rgb-border relative flex items-center rounded-full bg-[rgba(10,10,15,0.95)]">
            <div className="pl-5 pr-1 flex items-center">
              {searching ? (
                <svg className="w-4 h-4 text-[var(--color-cyan)] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search any anime... (e.g. Demon Slayer, One Piece, Frieren)"
              className="flex-1 bg-transparent py-3.5 px-2 text-sm outline-none focus:outline-none focus-visible:outline-none placeholder-[var(--color-mute)]/60 text-[var(--color-ink)]"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="pr-3 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-panel)]">
                <div className="aspect-[2/3] bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <div className="h-2 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-[var(--color-mute)] text-center py-12">
            {search ? `No results for "${search}"` : "No theme songs found."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {groups.map((g, i) => (
              <motion.div
                key={g.mediaId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -10,
                  scale: 1.04,
                  rotateX: 5,
                  rotateY: -5,
                  boxShadow: "0 24px 60px -12px rgba(139, 92, 246, 0.5), 0 0 30px -4px rgba(41, 242, 224, 0.45)",
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                transition={{ delay: Math.min(i, 10) * 0.03, type: "spring", stiffness: 260, damping: 24 }}
                style={{ transformPerspective: 900 }}
              >
                <Link href={`/themes/${g.mediaId}`}
                  className="glass-card block group overflow-hidden rounded-xl">
                  <div className="glass-content">
                    <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-panel)]">
                      {g.image ? (
                        <Image src={g.image} alt={g.title} fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--color-line)]/20 text-[var(--color-mute)] text-3xl">
                          🎵
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {g.count > 0 && (
                        <div className="absolute right-2 top-2 glass-score px-2 py-1 rounded-full text-[10px] font-mono font-bold">
                          🎵 {g.count}
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h3 className="font-display text-sm font-semibold leading-tight text-white line-clamp-2 drop-shadow-lg">
                          {g.title}
                        </h3>
                      </div>
                    </div>

                    <div className="px-3 py-2.5 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider">
                          {g.count > 0 ? `${g.count} theme${g.count !== 1 ? "s" : ""}` : "Browse themes"}
                        </span>
                        <span className="text-[10px] text-[var(--color-mute)] group-hover:text-[var(--color-cyan)] transition-colors">
                          {g.count > 0 ? "Listen →" : "View →"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
