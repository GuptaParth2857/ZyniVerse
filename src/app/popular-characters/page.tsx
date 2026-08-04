"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CharacterBasic } from "@/lib/anilist";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CharCard } from "@/components/CharCard";

const PAGE_SIZE = 50;

export default function PopularCharactersPage() {
  const [chars, setChars] = useState<CharacterBasic[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/anilist/popular-characters?page=1&perPage=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((d) => {
        setChars(d.characters || []);
        setHasNext(!!d.pageInfo?.hasNextPage);
      })
      .catch(() => setChars([]))
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const d = await fetch(`/api/anilist/popular-characters?page=${page + 1}&perPage=${PAGE_SIZE}`).then((r) => r.json());
      setChars((prev) => {
        const seen = new Set((prev || []).map((c) => c.id));
        return [...(prev || []), ...((d.characters || []) as CharacterBasic[]).filter((c) => !seen.has(c.id))];
      });
      setHasNext(!!d.pageInfo?.hasNextPage);
      setPage((p) => p + 1);
    } catch {
      // ignore — retry via button
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <ErrorBoundary label="Popular Characters"><main className="min-h-dvh bg-[#05080f] animate-page-in">
      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="relative border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(192,38,255,0.12), transparent 60%), radial-gradient(ellipse at 80% 0%, rgba(112,0,255,0.10), transparent 55%)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <Link href="/characters" className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-white/30 hover:text-white/70 transition-colors mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Characters
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] mb-2">Ranked by favorites</p>
              <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
                <h1 className="font-display text-3xl font-bold sm:text-5xl text-white drop-shadow-lg">Most Popular Characters</h1>
              </div>
              <p className="mt-3 max-w-xl text-sm text-white/40">
                The world&apos;s favorite anime characters, ranked by AniList favorites count. Click any card to open their full profile.
              </p>
            </div>
            {chars && (
              <div className="shrink-0 text-right">
                <div className="text-3xl font-bold font-mono text-white/80">{chars.length.toLocaleString()}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/25">characters loaded</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════ GRID ═══════════════ */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] rounded-[16px] bg-white/[0.03] animate-pulse" />
                <div className="mt-2 h-3 w-24 bg-white/[0.03] rounded animate-pulse" />
                <div className="mt-1 h-2 w-16 bg-white/[0.03] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : chars && chars.length === 0 ? (
          <p className="text-center text-sm text-white/30 py-16">No characters found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {chars?.map((c, i) => (
                <CharCard key={c.id} c={c} rank={i + 1} index={i} />
              ))}
            </div>

            {hasNext && (
              <div className="mt-8 flex justify-center">
                <motion.button
                  onClick={loadMore}
                  disabled={loadingMore}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 overflow-hidden"
                >
                  <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#ff00e6,#7000ff,#29f2e0,#ff00e6)] bg-[length:300%_300%] animate-neon-rgb opacity-70" />
                  <span className="absolute inset-[1.5px] rounded-full bg-[#0a0a14]" />
                  <span className="relative flex items-center gap-2">
                    {loadingMore ? (
                      <>
                        <motion.span className="h-4 w-4 rounded-full border-2 border-[#C026FF] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        Loading more…
                      </>
                    ) : (
                      <>Load more characters ↓</>
                    )}
                  </span>
                </motion.button>
              </div>
            )}

            {!hasNext && chars && chars.length > 0 && (
              <p className="mt-8 text-center text-[10px] font-mono uppercase tracking-wider text-white/20">
                You&apos;ve reached the end · {chars.length.toLocaleString()} characters
              </p>
            )}
          </>
        )}
      </div>
    </main></ErrorBoundary>
  );
}
