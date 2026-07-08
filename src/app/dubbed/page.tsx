"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { CardSkeleton, ErrorState } from "@/components/Loader";

type LangKey = "english" | "hindi" | "tamil" | "telugu";

interface DubAnime {
  mal_id: number;
  title: string;
  displayTitle: string;
  image: string;
  synopsis: string;
  genres: string[];
  hasHindi: boolean;
  hasTamil: boolean;
  hasTelugu: boolean;
  hasEnglish: boolean;
  comingSoonLanguages: string[];
  isCurrentSeason: boolean;
  score: string;
}

const LANG_TABS: { key: LangKey; label: string; accent: string }[] = [
  { key: "english", label: "English", accent: "#3b82f6" },
  { key: "hindi", label: "Hindi", accent: "#ff9933" },
  { key: "tamil", label: "Tamil", accent: "#e84a5f" },
  { key: "telugu", label: "Telugu", accent: "#6c63ff" },
];

function DubCard({ anime, index }: { anime: DubAnime; index: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), index * 30);
    return () => clearTimeout(t);
  }, [index]);

  const langs: string[] = [];
  if (anime.hasEnglish) langs.push("English");
  if (anime.hasHindi) langs.push("Hindi");
  if (anime.hasTamil) langs.push("Tamil");
  if (anime.hasTelugu) langs.push("Telugu");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/search?q=${encodeURIComponent(anime.displayTitle || anime.title)}`}
        className="group/card relative flex items-stretch gap-0 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all hover:border-[var(--color-cyan)]/40 hover:shadow-lg hover:-translate-y-0.5"
      >
        {/* Cover */}
        <div className="relative w-20 shrink-0 overflow-hidden sm:w-24">
          <Image
            src={anime.image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            sizes="(max-width: 640px) 80px, 96px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-panel)]" />
        </div>

        <div className="flex flex-1 items-center justify-between gap-2 p-3 pl-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-bold leading-tight truncate">
              {anime.displayTitle || anime.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {anime.isCurrentSeason && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[var(--color-cyan)] border border-[var(--color-cyan)]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                  Current Season
                </span>
              )}
              {anime.comingSoonLanguages.length > 0 && (
                <span className="rounded-full bg-[var(--color-amber)]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[var(--color-amber)] border border-[var(--color-amber)]/30">
                  Coming Soon
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {langs.map((l) => {
                const style = l === "English" ? { bg: "#3b82f622", text: "#3b82f6", border: "#3b82f644" }
                  : l === "Hindi" ? { bg: "#ff993322", text: "#ff9933", border: "#ff993344" }
                  : l === "Tamil" ? { bg: "#e84a5f22", text: "#e84a5f", border: "#e84a5f44" }
                  : { bg: "#6c63ff22", text: "#6c63ff", border: "#6c63ff44" };
                return (
                  <span key={l} className="text-[8px] font-medium px-1.5 py-0.5 rounded-full backdrop-blur"
                    style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                  >{l}</span>
                );
              })}
            </div>
          </div>
          {anime.score && anime.score !== "No Ratings" && (
            <div className="shrink-0 text-[10px] font-mono font-semibold text-[var(--color-cyan)] bg-black/30 px-2 py-0.5 rounded-full">
              ★ {anime.score}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function DubbedPage() {
  const [language, setLanguage] = useState<LangKey>("hindi");
  const [data, setData] = useState<{ available: DubAnime[]; comingSoon: DubAnime[]; currentSeason: DubAnime[]; recent: DubAnime[] } | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/dub-schedule?language=${language}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.success) throw new Error(d.error || "Failed to fetch");
        setData(d.data);
        setCounts(d.counts);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [language]);

  const available = useMemo(() => data?.available || [], [data]);
  const comingSoon = useMemo(() => data?.comingSoon || [], [data]);
  const currentSeason = useMemo(() => data?.currentSeason || [], [data]);
  const recent = useMemo(() => data?.recent || [], [data]);
  const total = counts?.[language] || counts?.total || 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Regional Dubbed Hub</p>
          <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight mt-1">
            Anime Dubs
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Track English, Hindi, Tamil & Telugu dubbed anime from official sources.
          </p>
        </motion.div>

        {/* Language tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {LANG_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setLanguage(tab.key)}
              className={`relative rounded-full px-5 py-2 text-sm font-bold transition-all ${
                language === tab.key
                  ? "text-black shadow-lg"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
              }`}
              style={language === tab.key ? { backgroundColor: tab.accent } : {}}
            >
              {tab.label}
              {counts && <span className="ml-1.5 opacity-70">({counts[tab.key] || 0})</span>}
            </button>
          ))}
        </div>

        {/* Stats */}
        {counts && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-mute)] mb-8 pb-6 border-b border-[var(--color-line)]">
            {currentSeason.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-cyan)]" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                {currentSeason.length} Current Season
              </span>
            )}
            {recent.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-magenta)]" />
                {recent.length} Recently Added
              </span>
            )}
            {comingSoon.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--color-amber)]" />
                {comingSoon.length} Coming Soon
              </span>
            )}
            <span className="font-mono">{total} Total</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-[var(--color-panel)] border border-[var(--color-line)] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => setLanguage(language)} />
        ) : (
          <div className="space-y-8">
            {currentSeason.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
                  Current Season ({currentSeason.length})
                </h2>
                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {currentSeason.map((dub, i) => (
                        <DubCard key={`${dub.mal_id}-cs-${i}`} anime={dub} index={i} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            )}

            {recent.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
                  Recently Added ({recent.length})
                </h2>
                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {recent.map((dub, i) => (
                        <DubCard key={`${dub.mal_id}-re-${i}`} anime={dub} index={i} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            )}

            {comingSoon.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-amber)]" />
                  Coming Soon ({comingSoon.length})
                </h2>
                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {comingSoon.map((dub, i) => (
                        <DubCard key={`${dub.mal_id}-cs2-${i}`} anime={dub} index={i} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            )}

            {available.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
                  Available Now ({available.length})
                </h2>
                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {available.map((dub, i) => (
                        <DubCard key={`${dub.mal_id}-av-${i}`} anime={dub} index={i} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>
            )}

            {currentSeason.length === 0 && available.length === 0 && comingSoon.length === 0 && recent.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg font-display text-[var(--color-mute)]">No dubbed anime found</p>
                <p className="mt-1 text-sm text-[var(--color-mute)]">Try selecting a different language.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
