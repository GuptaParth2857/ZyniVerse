"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { bestTitle, searchCharacters } from "@/lib/anilist";
import type { CharacterBasic, Media, CharacterEdge } from "@/lib/anilist";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";
import { CharCard, hashColor } from "@/components/CharCard";

const QUICK_SEARCH = ["Naruto Uzumaki", "Monkey D. Luffy", "Goku", "Saitama", "Light Yagami", "Eren Yeager"];

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Anime Card (for grid) ─── */
function AnimeGridCard({ media, active, onClick, index = 0 }: { media: Media; active: boolean; onClick: () => void; index?: number }) {
  const color = media.coverImage?.color || "#C026FF";
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: (index % 16) * 0.04, ease: CARD_EASE }}
      className="group text-left w-full"
    >
      <div
        className={`relative overflow-hidden rounded-[12px] border transition-all duration-300 ${
          active ? "border-[#C026FF]/60 shadow-[0_0_24px_-6px_rgba(192,38,255,0.45)]" : "border-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_0_18px_-8px_rgba(192,38,255,0.25)]"
        }`}
        style={active ? { borderColor: color, boxShadow: `0 0 24px -6px ${color}66` } : undefined}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a14]">
          <Image src={media.coverImage?.large || media.coverImage?.medium || ""} alt="" fill className="object-cover transition-all duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-2">
          <p className="text-[11px] font-semibold text-white/80 leading-tight line-clamp-1 group-hover:text-white transition-colors">{bestTitle(media.title)}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-white/30">
            {media.averageScore && <span>★{(media.averageScore / 10).toFixed(1)}</span>}
            {media.format && <span className="uppercase tracking-wider">{media.format}</span>}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Character row (expandable, lazy paginated — no character missed) ─── */
function AnimeCharacterRow({ mediaId, visible }: { mediaId: number; visible: boolean }) {
  const [edges, setEdges] = useState<CharacterEdge[] | null>(null);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; total: number }>({ hasNextPage: false, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setEdges(null);
    setPageInfo({ hasNextPage: false, total: 0 });
    setPage(1);
    fetch(`/api/anilist/characters/${mediaId}?page=1&perPage=25`)
      .then((r) => r.json())
      .then((d) => {
        setEdges(d.edges || []);
        setPageInfo(d.pageInfo || { hasNextPage: false, total: 0 });
      })
      .catch(() => setEdges([]))
      .finally(() => setLoading(false));
  }, [mediaId, visible]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const d = await fetch(`/api/anilist/characters/${mediaId}?page=${page + 1}&perPage=25`).then((r) => r.json());
      setEdges((prev) => {
        const seen = new Set((prev || []).map((e) => e.node.id));
        return [...(prev || []), ...((d.edges || []) as CharacterEdge[]).filter((e) => !seen.has(e.node.id))];
      });
      setPageInfo(d.pageInfo || { hasNextPage: false, total: 0 });
      setPage((p) => p + 1);
    } catch {
      // ignore — user can retry with the button
    } finally {
      setLoadingMore(false);
    }
  }

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pt-4 pb-2">
            {loading ? (
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[110px]">
                    <div className="aspect-[3/4] rounded-[10px] bg-white/[0.03] animate-pulse" />
                    <div className="mt-1.5 h-3 w-20 bg-white/[0.03] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : edges && edges.length === 0 ? (
              <p className="text-xs text-white/20 text-center py-4">No characters found.</p>
            ) : (
              <>
                <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {edges?.map((e, i) => (
                    <motion.div
                      key={e.node.id}
                      initial={{ opacity: 0, y: 14, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: (i % 10) * 0.04, ease: CARD_EASE }}
                      className="flex-shrink-0 w-[110px]"
                    >
                      <Link href={`/character/${e.node.id}`} className="block group">
                        <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden bg-[#0a0a14] border border-white/[0.06] transition-all duration-300 group-hover:border-[var(--color-magenta)]/50 group-hover:shadow-[0_0_16px_-6px_rgba(192,38,255,0.4)]">
                          <Image src={e.node.image?.large || e.node.image?.medium || ""} alt={e.node.name?.full || ""} fill className="object-cover transition-all duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                        </div>
                        <p className="mt-1.5 text-[10px] font-medium text-white/70 leading-tight truncate group-hover:text-white transition-colors">{e.node.name?.full}</p>
                        <p className="text-[8px] text-white/30 uppercase tracking-wider">{e.role}</p>
                      </Link>
                    </motion.div>
                  ))}
                  {pageInfo.hasNextPage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: CARD_EASE }}
                      className="flex-shrink-0 w-[110px]"
                    >
                      <button onClick={loadMore} disabled={loadingMore}
                        className="group flex h-full w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-white/[0.12] bg-white/[0.02] text-white/40 transition-all duration-300 hover:border-[var(--color-magenta)]/40 hover:bg-[var(--color-magenta)]/5 hover:text-white disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <motion.div className="h-5 w-5 rounded-full border-2 border-[#C026FF] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        ) : (
                          <span className="text-2xl leading-none">+</span>
                        )}
                        <span className="px-2 text-[9px] font-semibold uppercase tracking-wider text-center">
                          {loadingMore ? "Loading" : "Load more"}
                        </span>
                      </button>
                    </motion.div>
                  )}
                </div>
                {(edges?.length ?? 0) > 0 && (
                  <p className="mt-1 text-center text-[9px] font-mono text-white/15">
                    {edges?.length} character{(edges?.length ?? 0) === 1 ? "" : "s"}{pageInfo.hasNextPage ? " · Load more for all" : ""}
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════ */
export default function CharactersBrowsePage() {
  const [chars, setChars] = useState<CharacterBasic[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Media[]>([]);
  const [popularAnime, setPopularAnime] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [activeAnimeId, setActiveAnimeId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CharacterBasic[]>([]);
  const [searching, setSearching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    if (!searchQuery.trim()) { // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchResults([]); setSearching(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchCharacters(searchQuery.trim());
        setSearchResults(data.results);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    Promise.all([
      fetch("/api/anilist/popular-characters?perPage=50").then((r) => r.json()),
      fetch("/api/anilist/trending?perPage=18").then((r) => r.json()),
      fetch("/api/anilist/popular?perPage=30").then((r) => r.json()),
    ]).then(([popularChars, trending, popular]) => {
      setChars(popularChars.characters || []);
      setTrendingAnime(trending);
      setPopularAnime(popular);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /* Auto-rotate hero */
  useEffect(() => {
    if (chars.length === 0) return;
    intervalRef.current = setInterval(() => {
      setFeaturedIdx((p) => (p + 1) % Math.min(10, chars.length));
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [chars.length]);

  const top10 = chars.slice(0, 10);
  const rest = chars.slice(10, 50);
  const featured = top10[featuredIdx] || top10[0];
  const featColor = hashColor(featured?.name?.full);

  if (loading) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center bg-[#05080f]">
        <div className="flex flex-col items-center gap-3">
          <motion.div className="w-8 h-8 rounded-full border border-transparent border-t-[#C026FF]"
            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[10px] font-mono tracking-[0.25em] text-white/15">LOADING CHARACTERS</p>
        </div>
      </div>
    );
  }

  if (!featured) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center bg-[#05080f]">
        <p className="text-sm text-white/30">No characters found.</p>
      </div>
    );
  }

  const trendingContent = !isSearching ? (
    <>
      {/* ═══════════════ TRENDING ANIME (to discover characters) ═══════════════ */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Right now</p>
            <h2 className="font-display text-2xl font-bold text-white">Trending Anime</h2>
          </div>
          <Link href="/search?sort=TRENDING_DESC" className="shrink-0 text-sm text-white/30 hover:text-white/60 transition-colors">
            View all →
          </Link>
        </div>
        <ExpandingFlexCard items={trendingAnime} />
      </section>

      {/* ═══════════════ ALL CHARACTERS ═══════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#C026FF]" />
            Most Popular Characters
          </h2>
          <span className="text-[10px] text-white/20 font-mono">By favorites</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {rest.map((c, i) => (
            <CharCard key={c.id} c={c} rank={i + 11} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════ ANIME GRID — pick to see characters ═══════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#7000ff]" />
            Browse Characters by Anime
          </h2>
          <span className="text-[10px] text-white/20 font-mono">Click to expand · All characters</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {popularAnime.map((media, i) => (
            <div key={media.id}>
              <AnimeGridCard
                media={media}
                index={i}
                active={activeAnimeId === media.id}
                onClick={() => setActiveAnimeId(activeAnimeId === media.id ? null : media.id)}
              />
              {activeAnimeId === media.id && (
                <AnimeCharacterRow mediaId={media.id} visible={activeAnimeId === media.id} />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="text-center text-[10px] text-white/15 font-mono pb-4">
        Sorted by favorites
      </div>
    </>
  ) : null;

  return (
    <ErrorBoundary label="Characters"><main className="min-h-dvh bg-[#05080f] animate-page-in">
      {/* ═══════════════ HERO: Most Popular Characters ═══════════════ */}
      <div className="relative h-[70vh] min-h-[460px] border-b border-white/[0.06] overflow-hidden">
        {/* bg */}
        {top10.map((c, i) => (
          <div key={c.id} className={`absolute inset-0 transition-all duration-700 ${i === featuredIdx ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${hashColor(c.name?.full)}44, transparent 70%), radial-gradient(ellipse at 70% 50%, ${hashColor(c.name?.full)}22, #05080f 70%)` }} />
            {c.media?.edges?.[0]?.node?.coverImage?.large && (
              <Image src={c.media.edges[0].node.bannerImage || c.media.edges[0].node.coverImage.extraLarge || c.media.edges[0].node.coverImage.large || ""} alt="" fill className="object-cover opacity-[0.35]" sizes="100vw" />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/60 to-transparent" />

        {/* hero content */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 sm:pb-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 w-full">
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: CARD_EASE }}
            >
              <Link href={`/character/${featured.id}`} className="shrink-0 group relative block">
                <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" style={{ background: featColor }} />
                <Image src={featured.image?.large || ""} alt={featured.name?.full || ""}
                  className="relative h-64 w-44 rounded-[14px] border-2 object-cover shadow-2xl sm:h-72 sm:w-48"
                  style={{ borderColor: featColor }}
                  width={176} height={256}
                />
                <div className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur text-xs font-bold border" style={{ borderColor: featColor, color: featColor }}>
                  #{featuredIdx + 1}
                </div>
              </Link>
            </motion.div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2 text-[10px] font-semibold mb-1" style={{ color: featColor }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: featColor }} />
                TOP 10 MOST POPULAR
              </div>
              <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
                <h1 className="font-display text-3xl font-bold sm:text-5xl text-white drop-shadow-lg">{featured.name?.full}</h1>
              </div>
              {featured.name?.native && <p className="mt-1 text-base text-white/40">{featured.name.native}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {featured.media?.edges?.slice(0, 2).map((e) => (
                  <Link key={e.node.id} href={`/${e.node.type?.toLowerCase() || "anime"}/${e.node.id}`}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3.5 py-1.5 text-sm hover:bg-white/[0.08] transition-colors text-white/70">
                    <span>{bestTitle(e.node.title)}</span>
                    <span className="text-[9px] text-white/30">{e.characterRole}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono" style={{ color: featColor }}>{featured.favourites?.toLocaleString()}</span>
                  <span className="text-[11px] text-white/30">Favorites</span>
                </div>
                <Link href={`/character/${featured.id}`}
                  className="rounded-full border px-5 py-1.5 text-sm font-semibold transition-all hover:text-black"
                  style={{ borderColor: featColor, color: featColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = featColor; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >View Profile →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* dots */}
        <div className="absolute bottom-4 right-4 sm:right-8 z-10 flex gap-1.5">
          {top10.map((_, i) => (
            <button key={i} onClick={() => setFeaturedIdx(i)}
              className="h-1.5 rounded-full transition-all"
              style={i === featuredIdx ? { background: featColor, width: 24 } : { background: "rgba(255,255,255,0.15)", width: 6 }}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-10">

        {/* ═══════════════ CHARACTER SEARCH ═══════════════ */}
        <div className="mx-auto max-w-xl">
          <div className="relative group">
            {/* animated gradient ring */}
            <div className="absolute -inset-1 rounded-2xl bg-[linear-gradient(135deg,#ff00e6,#29f2e0,#7000ff,#ff00e6)] bg-[length:300%_300%] opacity-30 group-focus-within:opacity-80 blur-[6px] transition-all duration-700 animate-neon-rgb pointer-events-none" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d0d16]/90 backdrop-blur-xl px-5 py-4 transition-all duration-300 group-focus-within:border-white/[0.18] group-focus-within:bg-[#0f0f1a]/95 shadow-[0_0_30px_-15px_rgba(192,38,255,0.3)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 shrink-0 group-focus-within:text-[var(--color-magenta)] transition-colors">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 10,000+ anime characters..."
                className="w-full bg-transparent text-base outline-none text-white/90 placeholder:text-white/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-[var(--color-magenta)] transition-colors shrink-0" aria-label="Clear search">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* quick search chips */}
          {!isSearching && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[10px] text-white/25 font-mono uppercase tracking-wider">Try:</span>
              {QUICK_SEARCH.map((q) => (
                <button key={q} onClick={() => setSearchQuery(q)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-white/50 hover:text-white hover:border-[var(--color-magenta)]/40 hover:bg-[var(--color-magenta)]/5 transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════ SEARCH RESULTS ═══════════════ */}
        {isSearching && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#C026FF]" />
                Search Results
              </h2>
              {!searching && (
                <span className="text-[10px] font-mono text-white/25">{searchResults.length} result{searchResults.length === 1 ? "" : "s"}</span>
              )}
            </div>
            {searching ? (
              <div className="flex justify-center py-8">
                <motion.div className="h-7 w-7 rounded-full border-2 border-[#C026FF] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {searchResults.map((c, i) => <CharCard key={c.id} c={c} index={i} />)}
              </div>
            ) : (
              <p className="text-center text-sm text-white/30 py-8">No characters found for &ldquo;{searchQuery}&rdquo;</p>
            )}
          </section>
        )}

        {trendingContent}
      </div>
    </main></ErrorBoundary>
  );
}
