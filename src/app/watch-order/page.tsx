"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { searchMedia, bestTitle, type Media } from "@/lib/anilist";

export default function WatchOrderPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [anilistResults, setAnilistResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch from AniList when debounced query changes
  const fetchAniList = useCallback(async (searchQuery: string, pageNum: number, append: boolean) => {
    if (!searchQuery.trim()) {
      setAnilistResults([]);
      setHasNextPage(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const result = await searchMedia({
        search: searchQuery,
        type: "ANIME",
        page: pageNum,
        perPage: 50,
        sort: "SEARCH_MATCH",
      });
      if (!controller.signal.aborted) {
        if (append) {
          setAnilistResults((prev) => [...prev, ...result.media]);
        } else {
          setAnilistResults(result.media);
        }
        setHasNextPage(result.pageInfo.hasNextPage);
      }
    } catch {
      // Rate limited or error — silently fail
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAniList(debouncedQuery, 1, false);
  }, [debouncedQuery, fetchAniList]);

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAniList(debouncedQuery, nextPage, true);
    }
  }, [loading, hasNextPage, page, debouncedQuery, fetchAniList]);

  // Filter watch-order guides
  const filteredGuides = useMemo(() => {
    if (!query.trim()) return WATCH_ORDERS;
    const q = query.toLowerCase();
    return WATCH_ORDERS.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.methods.some((m) => m.toLowerCase().includes(q)),
    );
  }, [query]);

  // Merge: guides first, then AniList results (skip duplicates)
  const allResults = useMemo(() => {
    const guideIds = new Set(filteredGuides.map((g) => g.anilistId));
    const uniqueAnilist = anilistResults.filter((m) => !guideIds.has(m.id));
    return { guides: filteredGuides, anilist: uniqueAnilist };
  }, [filteredGuides, anilistResults]);

  const totalCount = allResults.guides.length + allResults.anilist.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Watch Orders</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
          {/* watch orders */}
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">
          Anime Watch Order Guides
        </h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Search any anime — find watch order guides or explore the full catalog. Hundreds of anime at your fingertips.
        </p>
      </div>

      {/* Search Bar */}
      <div ref={ref} className="relative mb-8 max-w-xl">
        <div className="relative rounded-full">
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0"
              style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
            />
            <div className="absolute inset-[1.5px] rounded-full" style={{ background: "rgba(10,10,15,0.95)" }} />
          </div>

          <div className="relative z-10 flex items-center">
            <div className="pl-5 pr-1 flex items-center">
              {loading ? (
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
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") inputRef.current?.blur();
              }}
              placeholder="Search 200+ anime — try 'naruto', 'fate', 'evangelion'..."
              className="flex-1 bg-transparent py-3.5 px-2 text-sm outline-none placeholder-[var(--color-mute)]/60 text-[var(--color-ink)]"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setAnilistResults([]); inputRef.current?.focus(); }}
                className="pr-2 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-5 font-mono text-[11px] text-[var(--color-mute)] tracking-wider uppercase">
        {query.trim()
          ? `${totalCount} ${totalCount === 1 ? "result" : "results"} found`
          : `${allResults.guides.length} watch order guides`}
      </p>

      {/* Watch Order Guides Section */}
      {allResults.guides.length > 0 && (
        <>
          {query.trim() && (
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-magenta)] border border-[var(--color-magenta)]/20">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
                Watch Order Guides
              </span>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {allResults.guides.map((order, idx) => {
              const isHovered = hoveredId === order.id;
              return (
                <Link
                  key={order.id}
                  href={`/watch-order/${order.id}`}
                  className="group block rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[var(--color-magenta)]/30 hover:shadow-[0_8px_40px_-12px_rgba(255,45,120,0.15)]"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onMouseEnter={() => setHoveredId(order.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative h-40 sm:h-44 overflow-hidden">
                    <img
                      src={`https://img.anili.st/media/${order.anilistId}`}
                      alt={order.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono font-bold text-white/80 border border-white/10">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--color-cyan)]">
                          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        {order.entries} entries
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 text-2xl drop-shadow-lg">
                      {order.emoji}
                    </div>
                  </div>
                  <div className="relative p-4 pt-3">
                    <h3 className={`font-display font-bold text-base truncate transition-colors duration-200 ${isHovered ? "text-[var(--color-cyan)]" : "text-[var(--color-ink)]"}`}>
                      {order.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[var(--color-mute)] leading-relaxed line-clamp-2">
                      {order.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {order.methods.map((m) => (
                        <span
                          key={m}
                          className="rounded-full px-2 py-0.5 text-[9px] font-mono border transition-colors duration-200"
                          style={{
                            backgroundColor: isHovered ? "rgba(0,229,255,0.12)" : "rgba(0,229,255,0.06)",
                            borderColor: isHovered ? "rgba(0,229,255,0.35)" : "rgba(0,229,255,0.12)",
                            color: isHovered ? "var(--color-cyan)" : "rgba(41,242,224,0.7)",
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                    <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-semibold transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0 text-[var(--color-magenta)]" : "opacity-0 translate-x-2 text-transparent"}`}>
                      View Guide
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* AniList Search Results */}
      {allResults.anilist.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              All Anime
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allResults.anilist.map((media, idx) => (
              <Link
                key={media.id}
                href={`/watch-order/anime/${media.id}`}
                className="group block rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[var(--color-cyan)]/30 hover:shadow-[0_8px_40px_-12px_rgba(0,229,255,0.15)]"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="relative h-40 sm:h-44 overflow-hidden">
                  <img
                    src={media.coverImage?.large || media.coverImage?.medium || ""}
                    alt={bestTitle(media.title)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono font-bold text-white/80 border border-white/10">
                      {media.format && <span className="text-[var(--color-magenta)]">{media.format}</span>}
                      {media.episodes && <span className="text-[var(--color-mute)]">{media.episodes} ep</span>}
                    </span>
                  </div>
                  {media.averageScore && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] font-mono font-bold text-[var(--color-cyan)] border border-white/10">
                        {media.averageScore}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative p-4 pt-3">
                  <h3 className="font-display font-bold text-base truncate text-[var(--color-ink)] group-hover:text-[var(--color-cyan)] transition-colors duration-200">
                    {bestTitle(media.title)}
                  </h3>
                  <p className="mt-1.5 text-xs text-[var(--color-mute)] leading-relaxed line-clamp-2">
                    {media.genres?.slice(0, 3).join(" · ") || media.status || ""}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[var(--color-cyan)]">
                    View Watch Order
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-6 py-2.5 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More Anime"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {query.trim() && !loading && allResults.guides.length === 0 && allResults.anilist.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-[var(--color-panel)] border border-[var(--color-line)] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
          </div>
          <p className="font-display text-lg font-bold text-[var(--color-mute)]">No anime found</p>
          <p className="mt-1 text-sm text-[var(--color-mute)] opacity-60">
            Try searching for &ldquo;naruto&rdquo; or &ldquo;fate&rdquo;
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-4 rounded-full border border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 transition-all"
          >
            Clear search
          </button>
        </div>
      )}

      {/* FAQ Section — only when no search */}
      {!query.trim() && (
        <div className="mt-20 border-t border-[var(--color-line)] pt-12">
          <h2 className="font-display text-2xl font-bold mb-2">Why Watch Order Matters</h2>
          <p className="text-xs text-[var(--color-mute)] mb-8">Quick answers to common questions</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md p-5 transition-all duration-300 hover:border-[var(--color-magenta)]/20 hover:shadow-[0_4px_24px_-8px_rgba(255,45,120,0.1)]">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-magenta)]/10 text-xs font-bold text-[var(--color-magenta)] font-mono">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display font-semibold text-sm mb-2 text-[var(--color-ink)]">{item.q}</h3>
                <p className="text-xs text-[var(--color-mute)] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const WATCH_ORDERS = [
  { id: "aot", anilistId: 16498, title: "Attack on Titan", emoji: "🗡️", entries: 10, methods: ["Release Order"], description: "Seasons 1-3 → The Final Season (3 parts). Includes OVAs and spinoffs." },
  { id: "jojo", anilistId: 14719, title: "JoJo's Bizarre Adventure", emoji: "💎", entries: 6, methods: ["Part Order"], description: "Parts 1-6 adapted chronologically. Phantom Blood through Stone Ocean." },
  { id: "sao", anilistId: 11757, title: "Sword Art Online", emoji: "⚔️", entries: 10, methods: ["Release Order", "Chronological"], description: "Aincrad → Fairy Dance → Phantom Bullet → Alicization. Movies included." },
  { id: "demon-slayer", anilistId: 101922, title: "Demon Slayer", emoji: "⚡", entries: 6, methods: ["Release Order"], description: "Season 1 → Mugen Train → Entertainment District → Swordsmith Village." },
  { id: "monogatari", anilistId: 5081, title: "Monogatari Series", emoji: "🦊", entries: 30, methods: ["Release Order", "Chronological", "Light Novel"], description: "The most debated watch order in anime. Bake → Nise → Neko Kuro → etc." },
  { id: "steins-gate", anilistId: 9253, title: "Steins;Gate", emoji: "⚗️", entries: 5, methods: ["Release Order", "Chronological"], description: "The definitive experience. Original series → Movie → Steins;Gate 0." },
  { id: "fate", anilistId: 19603, title: "Fate Series", emoji: "⚔️", entries: 7, methods: ["Release Order", "Story Order"], description: "Stay Night → Zero → Unlimited Blade Works → Heaven's Feel." },
  { id: "code-geass", anilistId: 1575, title: "Code Geass", emoji: "♟️", entries: 5, methods: ["Release Order"], description: "R1 → R2 → Akito the Exiled → Re;surrection. The complete timeline." },
  { id: "rezero", anilistId: 21355, title: "Re:Zero", emoji: "🔄", entries: 7, methods: ["Release Order"], description: "Season 1 (Director's Cut) → Memory Snow → Frozen Bond → Season 2 → 3." },
  { id: "dragon-ball", anilistId: 223, title: "Dragon Ball", emoji: "🐉", entries: 7, methods: ["Release Order", "Chronological"], description: "Dragon Ball → DBZ → DBS → Super Hero. Includes movies and GT." },
  { id: "gundam", anilistId: 80, title: "Gundam UC", emoji: "🤖", entries: 9, methods: ["UC Timeline", "Release"], description: "0079 → Zeta → ZZ → CCA. The Universal Century timeline." },
  { id: "toaru", anilistId: 4654, title: "Toaru (Index / Railgun)", emoji: "⚡", entries: 6, methods: ["Release Order", "Chronological"], description: "Index, Railgun, Accelerator — where they intersect." },
  { id: "made-in-abyss", anilistId: 97986, title: "Made in Abyss", emoji: "🕳️", entries: 5, methods: ["Release Order", "Chronological"], description: "Season 1 → Dawn of the Deep Soul → Season 2. A masterpiece." },
  { id: "madoka", anilistId: 9756, title: "Madoka Magica", emoji: "✨", entries: 5, methods: ["Release Order", "Chronological"], description: "Series → Rebellion → Magia Record. The definitive watch order." },
  { id: "evangelion", anilistId: 30, title: "Neon Genesis Evangelion", emoji: "🤖", entries: 6, methods: ["Release Order", "Chronological"], description: "NGE → EoE → Rebuilds. The correct way to experience this classic." },
  { id: "naruto", anilistId: 1735, title: "Naruto", emoji: "🍥", entries: 8, methods: ["Release Order", "Chronological"], description: "Naruto → Shippuden → Boruto. Includes movies and OVAs placement." },
  { id: "bleach", anilistId: 269, title: "Bleach", emoji: "⚔️", entries: 5, methods: ["Release Order"], description: "Original series → Thousand-Year Blood War. The final arc is split into 4 cour." },
  { id: "fma", anilistId: 5114, title: "Fullmetal Alchemist", emoji: "⚗️", entries: 4, methods: ["Release Order", "Brotherhood First"], description: "Brotherhood is the definitive adaptation. 2003 version is an alternate telling." },
  { id: "one-piece", anilistId: 21, title: "One Piece", emoji: "🏴‍☠️", entries: 4, methods: ["Release Order"], description: "East Blue → Alabasta → Skypiea → Water 7 → Marineford → Wano → Egghead." },
  { id: "hunter-x-hunter", anilistId: 11061, title: "Hunter x Hunter", emoji: "🎯", entries: 3, methods: ["Release Order"], description: "2011 version covers the full manga. 1999 version is an alternate take." },
  { id: "mha", anilistId: 21459, title: "My Hero Academia", emoji: "💪", entries: 8, methods: ["Release Order"], description: "Seasons 1-7 + movies. Movies can be watched after their respective seasons." },
  { id: "psycho-pass", anilistId: 13927, title: "Psycho-Pass", emoji: "🔫", entries: 5, methods: ["Release Order", "Chronological"], description: "Season 1 → Movie → Season 2 → 3 → Providence. The extended universe." },
  { id: "haruhi", anilistId: 849, title: "The Melancholy of Haruhi Suzumiya", emoji: "🌸", entries: 4, methods: ["Chronological", "Broadcast Order"], description: "The infamous watch order debate. Chronological vs broadcast order explained." },
  { id: "durarara", anilistId: 6114, title: "Durarara!!", emoji: "🐉", entries: 4, methods: ["Release Order"], description: "Season 1 → Ketsu → Shou → Ten. The Ikebukuro underworld saga." },
  { id: "baccano", anilistId: 2251, title: "Baccano!", emoji: "🚂", entries: 2, methods: ["Release Order", "Chronological"], description: "Non-linear storytelling on a train. Watch order matters less than you think." },
  { id: "higurashi", anilistId: 934, title: "Higurashi: When They Cry", emoji: "🪓", entries: 5, methods: ["Release Order"], description: "Question Arcs → Answer Arcs → Rei → Gou → Sotsu. Don't skip arcs." },
  { id: "ghost-in-the-shell", anilistId: 43, title: "Ghost in the Shell", emoji: "🤖", entries: 5, methods: ["Release Order", "Timeline"], description: "Stand Alone Complex → Arise → Movies. The cyberpunk masterpiece." },
  { id: "gintama", anilistId: 979, title: "Gintama", emoji: "👽", entries: 5, methods: ["Release Order"], description: "Episodes 1-201 → Benizakura → 202-316 → Silver Soul Arc. Comedy meets action." },
  { id: "conan", anilistId: 235, title: "Detective Conan", emoji: "🔍", entries: 3, methods: ["Release Order", "Filler-Free"], description: "1000+ episodes. Focus on canon episodes for the main storyline." },
  { id: "digimon", anilistId: 180, title: "Digimon", emoji: "🦕", entries: 5, methods: ["Release Order", "Chronological"], description: "Adventure → 02 → Tamers → Frontier → Data Squad. Each season is standalone." },
  { id: "pokemon", anilistId: 2540, title: "Pokémon", emoji: "⚡", entries: 4, methods: ["Release Order"], description: "Indigo League → Advanced → Diamond & Pearl → XY → Sun & Moon → Horizons." },
  { id: "initial-d", anilistId: 467, title: "Initial D", emoji: "🏎️", entries: 6, methods: ["Stage Order"], description: "Stage 1 → 2 → 3 → 4 → 5 → Final. The legendary street racing anime." },
  { id: "symphogear", anilistId: 11813, title: "Symphogear", emoji: "🎵", entries: 5, methods: ["Release Order"], description: "5 seasons of singing, fighting, and saving the world. Pure hype." },
  { id: "macross", anilistId: 963, title: "Macross", emoji: "🚀", entries: 5, methods: ["Timeline", "Release Order"], description: "SDF Macross → Plus → Zero → Frontier → Delta. Mecha + music + love triangles." },
  { id: "yu-yu-hakusho", anilistId: 381, title: "YuYu Hakusho", emoji: "👻", entries: 3, methods: ["Release Order"], description: "Seasons 1-4 + movies + OVAs. Toguro Arc through Chapter Black." },
  { id: "slam-dunk", anilistId: 1629, title: "Slam Dunk", emoji: "🏀", entries: 3, methods: ["Release Order"], description: "TV Series → Movies → The First Slam Dunk. The GOAT sports anime." },
  { id: "precure", anilistId: 3816, title: "Pretty Cure (Precure)", emoji: "🎀", entries: 3, methods: ["Release Order", "Standalone"], description: "Each season is standalone but follows the same formula. Where to start guide." },
  { id: "katangatari", anilistId: 6595, title: "Katanagatari", emoji: "🗡️", entries: 1, methods: ["Release Order"], description: "12 episodes, 12 swords. A unique linguistic and martial arts adventure." },
  { id: "tiger-and-bunny", anilistId: 10075, title: "Tiger & Bunny", emoji: "🦸", entries: 3, methods: ["Release Order"], description: "Season 1 → Movie 1 → Movie 2 → Season 2. Superhero action comedy." },
];

const FAQ = [
  { q: "What is a watch order?", a: "A watch order tells you the correct sequence to watch anime in a franchise. Some series have multiple timelines, prequels released after sequels, or spinoffs that intersect with the main story." },
  { q: "Release vs Chronological?", a: "Release order is how the anime originally aired. Chronological order follows the story timeline. Each has pros — we explain both so you can choose." },
  { q: "Can I skip filler?", a: "Yes! Our filler guides complement these watch orders. Use them together to skip non-canon episodes while following the right sequence." },
  { q: "Spoiler-free?", a: "We avoid major plot spoilers. The guides focus on episode numbers, titles, and order — not story events. Safe for first-time viewers." },
];
