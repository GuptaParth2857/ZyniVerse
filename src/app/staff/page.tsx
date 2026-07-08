"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { searchStaff, getPopularStaff } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import type { StaffBasic } from "@/lib/anilist";

export default function StaffBrowsePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StaffBasic[]>([]);
  const [popular, setPopular] = useState<StaffBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    getPopularStaff(12).then(setPopular).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const data = await searchStaff(query.trim());
        setResults(data.results);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const displayItems = query.trim() ? results : popular;

  return (
    <PageTransition>
      <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold">Staff</h1>
          <p className="mt-2 text-[var(--color-mute)] text-sm">Anime &amp; manga staff directory</p>
        </div>

        {/* Search bar with neon RGB border */}
        <div className="mx-auto max-w-lg mb-4">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] opacity-0 group-focus-within:opacity-100 blur-sm transition-all duration-700 animate-neon-rgb" />
            <div className="relative flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search staff by name..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section label */}
        <p className="text-center text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-6">
          {query.trim() ? `Results for "${query}"` : "Popular Staff"}
        </p>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader label="Searching..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && <ErrorState message={error} />}

        {/* Staff strip — ExpandingFlexCard style */}
        {!loading && !error && displayItems.length > 0 && (
          <div className="flex h-[420px] gap-2 w-full overflow-x-auto pb-2">
            {displayItems.slice(0, 18).map((staff, i) => {
              const isHovered = hovered === staff.id;
              return (
                <motion.div
                  key={staff.id}
                  layout
                  initial={false}
                  animate={{ flex: isHovered ? 3 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onMouseEnter={() => setHovered(staff.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] cursor-pointer group"
                  style={{ minWidth: 0 }}
                >
                  <Link
                    href={`/staff/${staff.id}`}
                    className="block h-full w-full"
                  >
                    {/* Background gradient (not image — avoids cut-off) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-panel)] via-black to-[var(--color-void)]" />
                    {staff.image?.large && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-700 group-hover:opacity-50"
                        style={{ backgroundImage: `url(${staff.image.large})` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-30% to-transparent" />
                    {!isHovered && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                    )}

                    {/* Collapsed: photo circle + vertical name */}
                    {!isHovered && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
                          <Image
                            src={staff.image?.medium || staff.image?.large || ""}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <p className="font-display text-[10px] font-bold leading-tight text-center text-white/80 [writing-mode:vertical-lr] rotate-180 truncate max-h-[120px]">
                          {staff.name?.full || "Unknown"}
                        </p>
                      </div>
                    )}

                    {/* Expanded content */}
                    {isHovered && (
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/30 shadow-lg">
                            <Image src={staff.image?.medium || staff.image?.large || ""} alt="" fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-lg font-bold leading-tight text-white drop-shadow-lg">
                              {staff.name?.full}
                            </p>
                            {staff.name?.native && (
                              <p className="text-xs text-white/50 truncate">{staff.name.native}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                          {staff.gender && <span>{staff.gender}</span>}
                          {staff.favourites != null && (
                            <span>♥ {staff.favourites.toLocaleString()}</span>
                          )}
                        </div>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-magenta)]"
                        >
                          View Profile →
                        </motion.span>
                      </div>
                    )}

                    {/* Number badge */}
                    <div className="absolute left-3 top-3">
                      <span className="font-mono text-[10px] font-bold text-white/30">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No results */}
        {!loading && !error && query.trim() && results.length === 0 && (
          <p className="text-center text-sm text-[var(--color-mute)] py-16">No staff found for &ldquo;{query}&rdquo;</p>
        )}
      </div>
    </PageTransition>
  );
}