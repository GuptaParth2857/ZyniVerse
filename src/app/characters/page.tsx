"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { bestTitle, searchCharacters } from "@/lib/anilist";
import type { CharacterBasic, Media } from "@/lib/anilist";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";

function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 60%, 50%)`;
}

/* ─── Character Card ─── */
function CharCard({ c, rank }: { c: CharacterBasic; rank?: number }) {
  const color = hashColor(c.name?.full);
  const anime = c.media?.edges?.[0];
  return (
    <Link href={`/character/${c.id}`} className="group block">
      <div className="relative overflow-hidden rounded-[16px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(192,38,255,0.15)] hover:border-white/[0.12]">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a14]">
          <Image src={c.image?.large || c.image?.medium || ""} alt={c.name?.full || ""} fill className="object-cover transition-all duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
          {rank != null && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[9px] font-bold border border-white/[0.08]"
              style={{ color, borderColor: color }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <span>{rank}</span>
            </div>
          )}
          {anime && (
            <div className="absolute top-2 right-2 z-10 rounded-full bg-black/70 backdrop-blur px-2 py-0.5">
              <span className="text-[8px] font-semibold uppercase tracking-wider text-white/70">{anime.characterRole}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[13px] font-bold text-white/90 truncate leading-tight">{c.name?.full}</p>
          {anime && (
            <div className="flex items-center gap-1.5">
              <div className="relative h-4 w-3 rounded overflow-hidden shrink-0 ring-1 ring-white/10">
                <Image src={anime.node.coverImage?.medium || ""} alt="" fill className="object-cover" sizes="12px" />
              </div>
              <p className="text-[10px] text-white/40 truncate leading-tight">{bestTitle(anime.node.title)}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-white/30 pt-0.5">
            {c.favourites != null && (
              <span className="flex items-center gap-1" style={{ color }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                {c.favourites.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${color}15, transparent 60%)` }}
        />
      </div>
    </Link>
  );
}

/* ─── Anime Card (for grid) ─── */
function AnimeGridCard({ media, active, onClick }: { media: Media; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group text-left w-full">
      <div className={`relative overflow-hidden rounded-[12px] border transition-all duration-300 ${
        active ? "border-[#C026FF]/50 shadow-[0_0_20px_-8px_rgba(192,38,255,0.2)]" : "border-white/[0.06] hover:border-white/[0.12]"
      }`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a14]">
                    <Image src={media.coverImage?.large || media.coverImage?.medium || ""} alt="" fill className="object-cover transition-all duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
        </div>
        <div className="p-2">
          <p className="text-[11px] font-semibold text-white/80 leading-tight line-clamp-1">{bestTitle(media.title)}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[9px] text-white/30">
            {media.averageScore && <span>★{(media.averageScore / 10).toFixed(1)}</span>}
            {media.format && <span className="uppercase tracking-wider">{media.format}</span>}
            </div>
          </div>
        </div>
    </button>
  );
}

/* ─── Character row (expandable) ─── */
function AnimeCharacterRow({ mediaId, visible }: { mediaId: number; visible: boolean }) {
  const [chars, setChars] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetch(`/api/anilist/characters/${mediaId}?perPage=30`)
      .then((r) => r.json())
      .then((d) => setChars(d.characters?.edges || []))
      .catch(() => setChars([]))
      .finally(() => setLoading(false));
  }, [mediaId, visible]);

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
            ) : chars && chars.length === 0 ? (
              <p className="text-xs text-white/20 text-center py-4">No characters found.</p>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {chars?.map((e: any) => (
                  <Link key={e.node.id} href={`/character/${e.node.id}`} className="flex-shrink-0 w-[110px] group">
                    <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden bg-[#0a0a14] border border-white/[0.06]">
                      <Image src={e.node.image?.large || e.node.image?.medium} alt={e.node.name?.full || ""} fill className="object-cover transition-all duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                    </div>
                    <p className="mt-1.5 text-[10px] font-medium text-white/70 leading-tight truncate">{e.node.name?.full}</p>
                    <p className="text-[8px] text-white/30 uppercase tracking-wider">{e.role}</p>
                  </Link>
                ))}
              </div>
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
    if (!searchQuery.trim()) { setSearchResults([]); setSearching(false); return; }
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
            <CharCard key={c.id} c={c} rank={i + 11} />
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
          <span className="text-[10px] text-white/20 font-mono">Click to expand</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {popularAnime.map((media) => (
            <div key={media.id}>
              <AnimeGridCard
                media={media}
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
        Data from AniList • Sorted by favorites
      </div>
    </>
  ) : null;

  return (
    <ErrorBoundary label="Characters"><main className="min-h-dvh bg-[#05080f]">
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
            <Link href={`/character/${featured.id}`} className="shrink-0 group relative">
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

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2 text-[10px] font-semibold mb-1" style={{ color: featColor }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: featColor }} />
                TOP 10 MOST POPULAR
              </div>
              <h1 className="font-display text-3xl font-bold sm:text-5xl text-white drop-shadow-lg">{featured.name?.full}</h1>
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
        <div className="mx-auto max-w-lg">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] opacity-0 group-focus-within:opacity-100 blur-sm transition-all duration-700 animate-neon-rgb" />
            <div className="relative flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[var(--color-void)] backdrop-blur-sm px-4 py-3 transition-colors group-focus-within:border-white/[0.12]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 shrink-0 group-focus-within:text-[var(--color-magenta)] transition-colors">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search characters by name..."
                className="w-full bg-transparent text-sm outline-none text-white/80 placeholder:text-white/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-[var(--color-magenta)] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* ═══════════════ SEARCH RESULTS ═══════════════ */}
        {isSearching && (
          <section>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="h-4 w-1 rounded-full bg-[#C026FF]" />
              Search Results
            </h2>
            {searching ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C026FF] border-t-transparent" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {searchResults.map((c) => <CharCard key={c.id} c={c} />)}
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
