"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { bestTitle, type Media } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";

export default function UpcomingClient({ anime }: { anime: Media[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Coming soon</p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Upcoming Releases</h2>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-[var(--color-mute)]">{anime.length} titles</span>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] p-0.5">
            <button onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "grid" ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20" : "text-[var(--color-mute)] hover:text-white"}`}>
              Grid
            </button>
            <button onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "list" ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20" : "text-[var(--color-mute)] hover:text-white"}`}>
              List
            </button>
          </div>
        </div>
      </motion.div>

      {anime.length === 0 ? (
        <p className="text-sm text-[var(--color-mute)]">No upcoming anime found.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {anime.map((item) => (
            <AnimeCard key={item.id} anime={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {anime.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link href={`/anime/${item.id}`}
                className="glass-card group flex items-stretch overflow-hidden">
                <div className="glass-content flex items-stretch w-full">
                  <div className="relative w-[100px] sm:w-[130px] shrink-0 overflow-hidden">
                    {item.coverImage?.large ? (
                      <Image src={item.coverImage.large} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="130px" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-line)]/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-panel)]/80" />
                    {item.averageScore != null && (
                      <div className="absolute bottom-2 left-2 glass-score px-2 py-0.5 rounded-full text-[10px] font-mono font-bold z-10">
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
