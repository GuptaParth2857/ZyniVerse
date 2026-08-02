"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { bestTitle, type Media } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";

export default function UpcomingClient({ anime }: { anime: Media[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return anime;
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    return anime.filter((a) => {
      const title = bestTitle(a.title).toLowerCase();
      const romaji = a.title?.romaji?.toLowerCase() || "";
      const genres = (a.genres || []).join(" ").toLowerCase();
      const format = (a.format || "").toLowerCase().replace(/_/g, " ");
      const haystack = `${title} ${romaji} ${genres} ${format}`;
      return words.every((w) => haystack.includes(w));
    });
  }, [query, anime]);

  return (
    <>
      <style>{`
        @keyframes upNeonBorder {
          0%   { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
          20%  { border-color: #00ffff; box-shadow: 0 0 8px #00ffff55, inset 0 0 8px #00ffff11; }
          40%  { border-color: #ff3366; box-shadow: 0 0 8px #ff336655, inset 0 0 8px #ff336611; }
          60%  { border-color: #ffff00; box-shadow: 0 0 8px #ffff0055, inset 0 0 8px #ffff0011; }
          80%  { border-color: #ff0066; box-shadow: 0 0 8px #ff006655, inset 0 0 8px #ff006611; }
          100% { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
        }
        .up-neon-card {
          animation: upNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
        @keyframes upNeonBorderHover {
          0%   { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
          20%  { border-color: #00ffff; box-shadow: 0 0 14px #00ffff, 0 0 28px #00ffff88; }
          40%  { border-color: #ff3366; box-shadow: 0 0 14px #ff3366, 0 0 28px #ff336688; }
          60%  { border-color: #ffff00; box-shadow: 0 0 14px #ffff00, 0 0 28px #ffff0088; }
          80%  { border-color: #ff0066; box-shadow: 0 0 14px #ff0066, 0 0 28px #ff006688; }
          100% { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
        }
        .up-neon-card:hover {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.03);
        }
        .up-neon-filter {
          animation: upNeonBorder 4s linear infinite;
          animation-delay: calc(var(--fd, 0) * -1s);
          border-width: 1px;
          border-style: solid;
        }
        .up-neon-filter:hover {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.05);
        }
        .up-neon-search {
          animation: upNeonBorder 4s linear infinite;
          border-width: 1px;
          border-style: solid;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .up-neon-search:focus-within {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.01);
        }
        .up-neon-search input:focus-visible,
        .up-neon-filter:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        .up-list-card {
          animation: upNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.3s);
          border-width: 1px;
          border-style: solid;
        }
        .up-list-card:hover {
          animation: upNeonBorderHover 1.5s linear infinite !important;
          transform: translateY(-2px);
        }
      `}</style>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Coming soon</p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Upcoming Releases</h2>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <div className="up-neon-search rounded-xl bg-[var(--color-panel)] px-4 py-3">
          <div className="relative flex items-center gap-3">
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-mute)" }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, genre, format..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-mute)]">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {query && (
          <p className="text-xs text-[var(--color-mute)] mt-2 ml-1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;<span className="text-[var(--color-cyan)]">{query}</span>&rdquo;
          </p>
        )}
      </motion.div>

      {/* View Toggle + Count */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 flex items-center gap-3">
        <span className="text-xs text-[var(--color-mute)]">{filtered.length} title{filtered.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] p-0.5">
          <button onClick={() => setView("grid")}
            className={`up-neon-filter px-3 py-1.5 rounded-md text-xs font-semibold transition-all`}
            style={{
              ["--fd" as string]: 0,
              background: view === "grid" ? "rgba(0,188,212,0.13)" : "transparent",
              color: view === "grid" ? "var(--color-cyan)" : "var(--color-mute)",
            }}
          >
            Grid
          </button>
          <button onClick={() => setView("list")}
            className={`up-neon-filter px-3 py-1.5 rounded-md text-xs font-semibold transition-all`}
            style={{
              ["--fd" as string]: 1,
              background: view === "list" ? "rgba(0,188,212,0.13)" : "transparent",
              color: view === "list" ? "var(--color-cyan)" : "var(--color-mute)",
            }}
          >
            List
          </button>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <div className="up-neon-card rounded-xl bg-[var(--color-panel)] py-20 text-center" style={{ ["--i" as string]: 0 }}>
          <p className="text-sm font-semibold text-[var(--color-mute)]">No anime match your search</p>
          <p className="text-xs text-[var(--color-mute)]/60 mt-1">Try a different keyword</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item, i) => (
            <div key={item.id} className="up-neon-card rounded-xl" style={{ ["--i" as string]: i }}>
              <AnimeCard anime={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link href={`/anime/${item.id}`}
                className="up-list-card group flex items-stretch overflow-hidden rounded-xl bg-[var(--color-panel)]"
                style={{ ["--i" as string]: i }}
              >
                <div className="flex items-stretch w-full">
                  <div className="relative w-[100px] sm:w-[130px] shrink-0 overflow-hidden rounded-l-xl">
                    {item.coverImage?.large ? (
                      <Image src={item.coverImage.large} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="130px" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-line)]/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-panel)]/80" />
                    {item.averageScore != null && (
                      <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold z-10 text-[var(--color-amber)]">
                        ★ {(item.averageScore / 10).toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center">
                    <h3 className="text-sm sm:text-base font-bold truncate group-hover:opacity-80 transition-opacity">{bestTitle(item.title)}</h3>
                    {item.title?.romaji && item.title?.romaji !== bestTitle(item.title) && (
                      <p className="text-[10px] text-[var(--color-mute)] truncate mt-0.5">{item.title.romaji}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.format && (
                        <span className="text-[10px] font-mono text-white/30">{item.format.replace(/_/g, " ")}</span>
                      )}
                      {item.episodes && <span className="text-[10px] text-[var(--color-mute)]">{item.episodes} ep</span>}
                      {item.status && <span className="text-[10px] text-[var(--color-mute)]">{item.status.replace(/_/g, " ").toLowerCase()}</span>}
                    </div>
                    {item.genres && item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.genres.slice(0, 4).map((g) => (
                          <span key={g} className="text-[10px] font-medium text-[var(--color-mute)] uppercase tracking-wider">{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
