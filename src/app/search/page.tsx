"use client";

import { Suspense, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { searchMedia, searchAll, getGenres, getAllTags, getAnimeByStudioName as searchByStudio, getPopular, getSuggestions } from "@/lib/anilist";
import Link from "next/link";
import AnimeCard from "@/components/AnimeCard";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";
import { CardSkeleton, ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

import type { Media, Tag, Suggestion } from "@/lib/anilist";

const SORT_OPTIONS = [
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "SCORE_DESC", label: "Top Rated" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "FAVOURITES_DESC", label: "Most Favorited" },
  { value: "EPISODES_DESC", label: "Most Episodes" },
];

const FORMAT_OPTIONS = [
  { value: "", label: "Any Format" },
  { value: "TV", label: "TV" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Any Status" },
  { value: "RELEASING", label: "Currently Releasing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Not Yet Released" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "HIATUS", label: "On Hiatus" },
];

const SEASON_OPTIONS = [
  { value: "", label: "Any Season" },
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const genre2 = searchParams.get("genre2") || "";
  const genreOp = searchParams.get("genreOp") || "AND";
  const sort = searchParams.get("sort") || "POPULARITY_DESC";
  const type = searchParams.get("type") || "ANIME";
  const format = searchParams.get("format") || "";
  const statusFilter = searchParams.get("status") || "";
  const season = searchParams.get("season") || "";
  const yearFrom = searchParams.get("yearFrom") || "";
  const yearTo = searchParams.get("yearTo") || "";
  const studioName = searchParams.get("studio") || "";
  const tag = searchParams.get("tag") || "";
  const [inputVal, setInputVal] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  const [animeResults, setAnimeResults] = useState<Media[]>([]);
  const [mangaResults, setMangaResults] = useState<Media[]>([]);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; total: number } | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [popularAnime, setPopularAnime] = useState<Media[]>([]);

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {});
    getAllTags().then(setTags).catch(() => {});
  }, []);

  useEffect(() => {
    if (!inputVal.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(inputVal.trim());
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [inputVal]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isLanding = !query && !genre && !genre2 && !tag && !format && !statusFilter && !season && !yearFrom && !yearTo && !studioName && sort === "POPULARITY_DESC";

  useEffect(() => {
    if (!isLanding) return;
    getPopular(24).then(setPopularAnime).catch(() => {});
  }, [isLanding]);

  const searchOpts = useMemo(() => ({
    search: query,
    genre: genre || null,
    tag: tag || null,
    sort,
    type: type === "ALL" ? "ANIME" : type,
    format: format || null,
    season: season || null,
    seasonYear: yearFrom ? Number(yearFrom) : null,
    status: statusFilter || null,
  }), [query, genre, tag, sort, type, format, season, yearFrom, statusFilter]);

  const runSearch = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);

      const multiGenre = [genre, genre2].filter(Boolean);
      const genreFilter = multiGenre.length > 0 ? multiGenre[0] : (genre || null);
      const genre2Filter = multiGenre.length > 1 ? multiGenre[1] : null;

      try {
        if (type === "ALL") {
          const data = await searchAll(query, pageNum, 12);
          setAnimeResults(data.anime);
          setMangaResults(data.manga);
          setPageInfo(null);
        } else if (studioName.trim()) {
          const data = await searchByStudio(studioName.trim(), pageNum, 24);
          setAnimeResults(data.results as Media[]);
          setMangaResults([]);
          setPageInfo({ hasNextPage: data.hasNextPage, total: data.total });
        } else {
          const data = await searchMedia({
            ...searchOpts,
            genre: genreFilter,
            page: pageNum,
            perPage: 24,
          });
          if (type === "ANIME") { setAnimeResults(data.media); setMangaResults([]); }
          else { setMangaResults(data.media); setAnimeResults([]); }
          setPageInfo(data.pageInfo);
        }
      } catch (e: any) {
        setError(e.message || "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [query, type, genre, genre2, genreOp, searchOpts, studioName]
  );

  useEffect(() => {
    setPage(1);
    setAnimeResults([]);
    setMangaResults([]);
    runSearch(1);
  }, [runSearch]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function clearFilters() {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    router.push(`${pathname}?${next.toString()}`);
  }

  async function loadMore() {
    const next = page + 1;
    setPage(next);
    try {
      if (type === "ALL") {
        const data = await searchAll(query, next, 12);
        setAnimeResults((prev) => [...prev, ...data.anime]);
        setMangaResults((prev) => [...prev, ...data.manga]);
      } else if (studioName.trim()) {
        const data = await searchByStudio(studioName.trim(), next, 24);
        setAnimeResults((prev) => [...prev, ...(data.results as Media[])]);
      } else {
        const data = await searchMedia({ ...searchOpts, page: next, perPage: 24 });
        if (type === "ANIME") setAnimeResults((prev) => [...prev, ...data.media]);
        else setMangaResults((prev) => [...prev, ...data.media]);
        setPageInfo(data.pageInfo);
      }
    } catch {}
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pageInfo?.hasNextPage && !loading) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageInfo?.hasNextPage, loading, page]);

  const displayAnime = type === "MANGA" ? [] : animeResults;
  const displayManga = type === "ANIME" ? [] : mangaResults;
  const displayAll = type === "ALL" && (animeResults.length > 0 || mangaResults.length > 0);
  const hasActiveFilters = Boolean(genre || genre2 || tag || format || statusFilter || season || yearFrom || yearTo || studioName || sort !== "POPULARITY_DESC");

  return (
    <PageTransition>
      {isLanding && popularAnime.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
          {/* Neon Search Bar */}
          <div className="mb-10 max-w-2xl mx-auto text-center relative" ref={suggestRef}>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-magenta)] mb-3">// Discover Anime</p>
            <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight mb-6">
              Search Anime
            </h1>
            <style>{`
              @keyframes rgbShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .rgb-border {
                position: relative;
                border-radius: 0.75rem;
              }
              .rgb-border::before {
                content: "";
                position: absolute;
                inset: -2px;
                border-radius: 0.85rem;
                background: linear-gradient(60deg, #ff00ff, #00ffff, #ff00ff, #00ffff, #ff00ff);
                background-size: 300% 300%;
                animation: rgbShift 3s ease infinite;
                z-index: -1;
                transition: opacity 0.4s;
              }
              .rgb-border:focus-within::before {
                opacity: 1;
                filter: blur(4px);
              }
            `}</style>
            <div className="rgb-border">
              <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] shrink-0"
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggestions(false); updateParam("q", inputVal); } }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search thousands of anime..."
                  className="w-full bg-transparent py-4 pl-12 pr-4 text-base text-white placeholder-[var(--color-mute)]/50 outline-none"
                />
              </div>
            </div>
            {showSuggestions && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-[500px] max-w-[90vw] rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50 text-left">
                {suggestions.map((s) => (
                  <Link key={s.id} href={`/anime/${s.id}`}
                    onClick={() => { setShowSuggestions(false); setInputVal(""); }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-[var(--color-line)] last:border-0"
                  >
                    {s.poster && (
                      <img src={s.poster} alt="" className="h-12 w-8 rounded object-cover border border-[var(--color-line)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                        {s.format && <span>{s.format}</span>}
                        {s.year && <span>{s.year}</span>}
                        {s.episodes && <span>{s.episodes} ep</span>}
                        {s.status && <span className="capitalize">{s.status.replace(/_/g, " ")}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-mute)]">
              <span className="text-[var(--color-cyan)]">✦</span>
              <span>Popular right now</span>
              <span className="text-[var(--color-magenta)]">✦</span>
            </div>
          </div>

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">// Explore</p>
              <h2 className="font-display text-3xl font-black sm:text-5xl tracking-tight">Most Popular</h2>
              <p className="mt-1 text-sm text-[var(--color-mute)]">Discover what everyone is watching</p>
            </div>
            <Link href="/search?sort=POPULARITY_DESC" className="shrink-0 text-xs uppercase tracking-wider text-[var(--color-mute)] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <ExpandingFlexCard items={popularAnime} />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex items-end justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">// Search</p>
              <h1 className="font-display text-3xl font-bold sm:text-4xl truncate">
                {query ? `"${query}"` : "Browse All"}
              </h1>
            </div>
            <button
              onClick={() => setShowFilters((o) => !o)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filters
              {hasActiveFilters && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Genre</label>
                  <div className="flex gap-2">
                    <select value={genre} onChange={(e) => updateParam("genre", e.target.value)}
                      className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    >
                      <option value="">Any</option>
                      {genres.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
                    {genre && (
                      <>
                        <select value={genreOp} onChange={(e) => updateParam("genreOp", e.target.value)}
                          className="w-16 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-2 text-xs outline-none focus:border-[var(--color-cyan)]"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                        <select value={genre2} onChange={(e) => updateParam("genre2", e.target.value)}
                          className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                        >
                          <option value="">Any</option>
                          {genres.filter((g) => g !== genre).map((g) => (<option key={g} value={g}>{g}</option>))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Format</label>
                  <select value={format} onChange={(e) => updateParam("format", e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                  >
                    {FORMAT_OPTIONS.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Status</label>
                  <select value={statusFilter} onChange={(e) => updateParam("status", e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                  >
                    {STATUS_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Sort By</label>
                  <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                  >
                    {SORT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Season</label>
                  <select value={season} onChange={(e) => updateParam("season", e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                  >
                    {SEASON_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Year Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={yearFrom} onChange={(e) => updateParam("yearFrom", e.target.value)}
                      placeholder="From" min={1970} max={CURRENT_YEAR + 2}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    />
                    <span className="text-[var(--color-mute)] text-xs">—</span>
                    <input type="number" value={yearTo} onChange={(e) => updateParam("yearTo", e.target.value)}
                      placeholder="To" min={1970} max={CURRENT_YEAR + 2}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Tag</label>
                  <select value={tag} onChange={(e) => updateParam("tag", e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                  >
                    <option value="">Any Tag</option>
                    {tags.filter((t) => t.rank >= 50).sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">Studio Name</label>
                  <input value={studioName} onChange={(e) => updateParam("studio", e.target.value)}
                    placeholder="e.g. Kyoto Animation, MAPPA, Studio Ghibli..."
                    className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-line)]">
                <span className="text-xs text-[var(--color-mute)]">
                  {pageInfo ? `${pageInfo.total} results` : "Searching..."}
                </span>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="text-xs text-[var(--color-magenta)] hover:underline"
                  >Clear all filters</button>
                )}
              </div>
            </div>
          )}

          {/* Quick Search + Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs" ref={suggestRef}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]"
              >
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggestions(false); updateParam("q", inputVal); } }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search by name..."
                className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[var(--color-cyan)]"
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50">
                  {suggestions.map((s) => (
                    <Link key={s.id} href={`/anime/${s.id}`}
                      onClick={() => { setShowSuggestions(false); setInputVal(""); }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-[var(--color-line)] last:border-0"
                    >
                      {s.poster && (
                        <img src={s.poster} alt="" className="h-10 w-7 rounded object-cover border border-[var(--color-line)]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                          {s.format && <span>{s.format}</span>}
                          {s.year && <span>{s.year}</span>}
                          {s.episodes && <span>{s.episodes} ep</span>}
                          {s.status && <span className="capitalize">{s.status.replace(/_/g, " ")}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type Tabs */}
          <div className="mt-4 flex items-center gap-2 border-b border-[var(--color-line)] pb-3 flex-wrap">
            {(["ANIME", "MANGA", "ALL"] as const).map((t) => (
              <button key={t} onClick={() => updateParam("type", t === "ANIME" ? "" : t)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                  (type === t) || (type === "ANIME" && t === "ANIME" && !searchParams.get("type"))
                    ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]"
                    : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >{t === "ALL" ? "Both" : t.charAt(0) + t.slice(1).toLowerCase()}</button>
            ))}
            {type !== "ALL" && pageInfo && (
              <span className="ml-auto text-xs text-[var(--color-mute)] font-mono">{pageInfo.total} results</span>
            )}
          </div>

          {/* Results */}
          <div className="mt-8">
            {error ? (
              <ErrorState message={error} onRetry={() => runSearch(1)} />
            ) : (
              <>
                {loading && displayAnime.length === 0 && displayManga.length === 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
                  </div>
                ) : (
                  <>
                    {displayAnime.length > 0 && (
                      <div>
                        {displayAll && <h3 className="font-display text-lg font-bold mb-3">Anime</h3>}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                          {displayAnime.map((a) => <AnimeCard key={a.id} anime={a} />)}
                        </div>
                      </div>
                    )}
                    {displayManga.length > 0 && (
                      <div className={displayAll ? "mt-8" : ""}>
                        {displayAll && <h3 className="font-display text-lg font-bold mb-3">Manga</h3>}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                          {displayManga.map((m) => <AnimeCard key={m.id} anime={m} />)}
                        </div>
                      </div>
                    )}
                    {!loading && displayAnime.length === 0 && displayManga.length === 0 && (
                      <EmptyState
                        icon="search"
                        title="No results found"
                        description="Try adjusting your filters or search terms."
                        actionLabel="Clear Filters"
                        onAction={clearFilters}
                      />
                    )}
                    {loading && (
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mt-4">
                        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`l${i}`} />)}
                      </div>
                    )}
                  </>
                )}
                <div ref={sentinelRef} className="h-4" />
                {pageInfo?.hasNextPage && loading && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
