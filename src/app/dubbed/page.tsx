"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { CardSkeleton, ErrorState } from "@/components/Loader";
import DubExpandingCard from "@/components/DubExpandingCard";

type LangKey = "english" | "hindi" | "tamil" | "telugu";

export interface DubAnime {
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

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggleExpand(section: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  const SECTION_LIMIT = 8;
  function sectionItems(all: DubAnime[], key: string) {
    return expanded.has(key) ? all : all.slice(0, SECTION_LIMIT);
  }

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
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
                  Current Season ({currentSeason.length})
                </h2>
                <AnimatePresence mode="wait">
                  <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <DubExpandingCard items={sectionItems(currentSeason, "cs")} />
                    {currentSeason.length > SECTION_LIMIT && (
                      <button onClick={() => toggleExpand("cs")}
                        className="mt-3 w-full rounded-xl border border-dashed border-[var(--color-line)] py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
                      >
                        {expanded.has("cs") ? "Show less ↑" : `View all ${currentSeason.length} →`}
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>
            )}

            {recent.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
                  Recently Added ({recent.length})
                </h2>
                <AnimatePresence mode="wait">
                  <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <DubExpandingCard items={sectionItems(recent, "re")} />
                    {recent.length > SECTION_LIMIT && (
                      <button onClick={() => toggleExpand("re")}
                        className="mt-3 w-full rounded-xl border border-dashed border-[var(--color-line)] py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
                      >
                        {expanded.has("re") ? "Show less ↑" : `View all ${recent.length} →`}
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>
            )}

            {comingSoon.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-amber)]" />
                  Coming Soon ({comingSoon.length})
                </h2>
                <AnimatePresence mode="wait">
                  <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <DubExpandingCard items={sectionItems(comingSoon, "co")} />
                    {comingSoon.length > SECTION_LIMIT && (
                      <button onClick={() => toggleExpand("co")}
                        className="mt-3 w-full rounded-xl border border-dashed border-[var(--color-line)] py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
                      >
                        {expanded.has("co") ? "Show less ↑" : `View all ${comingSoon.length} →`}
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>
            )}

            {available.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
                  <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
                  Available Now ({available.length})
                </h2>
                <AnimatePresence mode="wait">
                  <motion.div key={language} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <DubExpandingCard items={sectionItems(available, "av")} />
                    {available.length > SECTION_LIMIT && (
                      <button onClick={() => toggleExpand("av")}
                        className="mt-3 w-full rounded-xl border border-dashed border-[var(--color-line)] py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
                      >
                        {expanded.has("av") ? "Show less ↑" : `View all ${available.length} →`}
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
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
