"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  searchMedia,
  searchAll,
  getGenres,
  getAllTags,
  getAnimeByStudioName as searchByStudio,
  getPopular,
  getSuggestions,
} from "@/lib/anilist";
import Link from "next/link";
import Image from "next/image";
import AnimeCard from "@/components/AnimeCard";
import AdBanner from "@/components/AdBanner";
import NativeBannerAd from "@/components/NativeBannerAd";
import ExpandingFlexCard from "@/components/ExpandingFlexCard";
import { CardSkeleton, ErrorState } from "@/components/Loader";
import { amazonSearchUrl } from "@/lib/affiliate-config";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import RevealTitle from "@/components/RevealTitle";
import RevealLabel from "@/components/RevealLabel";

import type { Media, Tag, Suggestion } from "@/lib/anilist";
import { logError } from "@/lib/logger";

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

/* Landing hero typewriter placeholder phrases (module-level: stable identity). */
const SEARCH_PHRASES = [
  "Search thousands of anime...",
  "jisme MC weak hai par strong ban jata hai...",
  "Hindi dub anime dhoondo...",
  "romance, isekai, thriller ya shonen...",
];

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeSugg, setActiveSugg] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const suggestSeq = useRef(0);
  const suggRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [animeResults, setAnimeResults] = useState<Media[]>([]);
  const [mangaResults, setMangaResults] = useState<Media[]>([]);
  const [pageInfo, setPageInfo] = useState<{
    hasNextPage: boolean;
    total: number;
  } | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [popularAnime, setPopularAnime] = useState<Media[]>([]);

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => {});
    getAllTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const seq = ++suggestSeq.current;
    const raw = inputVal.trim();
    const timer = setTimeout(async () => {
      if (!raw) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSuggestLoading(false);
        return;
      }
      setSuggestLoading(true);
      try {
        const res = await getSuggestions(raw);
        if (seq !== suggestSeq.current) return; // stale response - newer keystrokes win
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
        setActiveSugg(-1);
      } catch {
        if (seq !== suggestSeq.current) return;
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        if (seq === suggestSeq.current) setSuggestLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [inputVal]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestRef.current &&
        !suggestRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isLanding =
    !query &&
    !genre &&
    !genre2 &&
    !tag &&
    !format &&
    !statusFilter &&
    !season &&
    !yearFrom &&
    !yearTo &&
    !studioName &&
    sort === "POPULARITY_DESC";

  useEffect(() => {
    if (!isLanding) return;
    getPopular(24)
      .then(setPopularAnime)
      .catch(() => {});
  }, [isLanding]);

  useEffect(() => {
    if (query && query.length > 1) {
      fetch("/api/activity/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query }),
      }).catch(() => {});
    }
  }, [query]);

  /* Landing hero: cycling typewriter placeholder */
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");

  useEffect(() => {
    if (!isLanding) return;
    const phrase = SEARCH_PHRASES[phraseIdx % SEARCH_PHRASES.length];
    let i = 0;
    let stepTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (i <= phrase.length) {
        setTypedPlaceholder(phrase.slice(0, i));
        i += 1;
        stepTimer = setTimeout(step, 40);
      } else {
        holdTimer = setTimeout(
          () => setPhraseIdx((v) => (v + 1) % SEARCH_PHRASES.length),
          2600,
        );
      }
    };
    stepTimer = setTimeout(step, 350);
    return () => {
      clearTimeout(stepTimer);
      clearTimeout(holdTimer);
    };
  }, [phraseIdx, isLanding]);

  const searchOpts = useMemo(
    () => ({
      search: query,
      genre: genre || null,
      genre2: genre2 || null,
      genreOp: (genreOp as "AND" | "OR") || "AND",
      tag: tag || null,
      sort,
      type: type === "ALL" ? "ANIME" : type,
      format: format || null,
      season: season || null,
      yearFrom: yearFrom ? Number(yearFrom) : null,
      yearTo: yearTo ? Number(yearTo) : null,
      status: statusFilter || null,
    }),
    [query, genre, genre2, genreOp, tag, sort, type, format, season, yearFrom, yearTo, statusFilter],
  );

  // Changes on every new search/filter change — remounts result grids so the
  // stagger entrance replays instead of just appearing.
  const searchKey = `${query}|${type}|${genre}|${genre2}|${genreOp}|${tag}|${format}|${statusFilter}|${season}|${yearFrom}|${yearTo}|${studioName}|${sort}`;

  // Smart (AI) search fallback — activated when keyword search returns zero
  // results for a sentence-like query (natural language, not a title).
  const [smartResults, setSmartResults] = useState<
    {
      id: number;
      title: string;
      poster: string | null;
      year: number | null;
      format: string | null;
      score: number | null;
      reason: string;
    }[]
  >([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartInterpreted, setSmartInterpreted] = useState<string | null>(null);
  const [smartError, setSmartError] = useState<string | null>(null);

  const isSentenceLike = useCallback((s: string): boolean => {
    const t = s.trim();
    if (t.length < 6) return false;
    // A bare title usually has no spaces or is covered by keyword search;
    // treat spaced/clause-y queries as natural language candidates.
    return (
      t.split(/\s+/).length >= 3 ||
      /(anime|manga|one|who|kaun|hai|wala|like|about|want)/i.test(t)
    );
  }, []);

  const runSmartSearch = useCallback(async (text: string) => {
    setSmartLoading(true);
    setSmartError(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Smart search failed.");
      setSmartResults(data.results ?? []);
      setSmartInterpreted(data.interpreted ?? null);
    } catch (e) {
      setSmartResults([]);
      setSmartError(e instanceof Error ? e.message : "Smart search failed.");
    } finally {
      setSmartLoading(false);
    }
  }, []);

  // When keyword search finishes with zero hits and the query reads like a
  // sentence, offer + auto-run the AI natural-language fallback.
  useEffect(() => {
    if (loading || smartLoading) return;
    if (!query || animeResults.length > 0 || mangaResults.length > 0) return;
    if (type === "MANGA" || type === "ALL") return; // anime-only for now
    if (!isSentenceLike(query)) return;
    if (smartResults.length > 0 || smartError) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runSmartSearch(query);
  }, [
    loading,
    query,
    type,
    animeResults,
    mangaResults,
    smartResults,
    smartError,
    smartLoading,
    runSmartSearch,
    isSentenceLike,
  ]);

  const runSearch = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);

      try {
        if (type === "ALL") {
          const data = await searchAll({ ...searchOpts, page: pageNum, perPage: 12 });
          setAnimeResults(data.anime);
          setMangaResults(data.manga);
          setPageInfo({ hasNextPage: data.hasNextPage, total: data.total });
        } else if (studioName.trim()) {
          const data = await searchByStudio(studioName.trim(), pageNum, 24);
          setAnimeResults(data.results as Media[]);
          setMangaResults([]);
          setPageInfo({ hasNextPage: data.hasNextPage, total: data.total });
        } else {
          const data = await searchMedia({
            ...searchOpts,
            page: pageNum,
            perPage: 24,
          });
          if (type === "ANIME") {
            setAnimeResults(data.media);
            setMangaResults([]);
          } else {
            setMangaResults(data.media);
            setAnimeResults([]);
          }
          setPageInfo(data.pageInfo);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [type, searchOpts, studioName],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setAnimeResults([]);
    setMangaResults([]);
    runSearch(1);
  }, [runSearch]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`);
    },
    [searchParams, pathname, router],
  );

  function clearFilters() {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    router.push(`${pathname}?${next.toString()}`);
  }

  const loadMore = useCallback(async () => {
    const next = page + 1;
    setPage(next);
    try {
      if (type === "ALL") {
        const data = await searchAll({ ...searchOpts, page: next, perPage: 12 });
        setAnimeResults((prev) => [...prev, ...data.anime]);
        setMangaResults((prev) => [...prev, ...data.manga]);
        setPageInfo({ hasNextPage: data.hasNextPage, total: data.total });
      } else if (studioName.trim()) {
        const data = await searchByStudio(studioName.trim(), next, 24);
        setAnimeResults((prev) => [...prev, ...(data.results as Media[])]);
      } else {
        const data = await searchMedia({
          ...searchOpts,
          page: next,
          perPage: 24,
        });
        if (type === "ANIME")
          setAnimeResults((prev) => [...prev, ...data.media]);
        else setMangaResults((prev) => [...prev, ...data.media]);
        setPageInfo(data.pageInfo);
      }
    } catch (e) {
      logError(e);
    }
  }, [page, type, studioName, searchOpts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pageInfo?.hasNextPage && !loading)
          loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageInfo?.hasNextPage, loading, page, loadMore]);

  const displayAnime = type === "MANGA" ? [] : animeResults;
  const displayManga = type === "ANIME" ? [] : mangaResults;
  const displayAll =
    type === "ALL" && (animeResults.length > 0 || mangaResults.length > 0);
  const hasActiveFilters = Boolean(
    genre ||
    genre2 ||
    tag ||
    format ||
    statusFilter ||
    season ||
    yearFrom ||
    yearTo ||
    studioName ||
    sort !== "POPULARITY_DESC",
  );

  // "/" focuses the search bar anywhere on the page (no typing required).
  useEffect(() => {
    function onSlash(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        const el = searchInputRef.current;
        if (el) {
          el.focus();
          el.select();
        }
      }
    }
    window.addEventListener("keydown", onSlash);
    return () => window.removeEventListener("keydown", onSlash);
  }, []);

  // Keep the highlighted suggestion in view while arrow-key navigating.
  useEffect(() => {
    const el = suggRefs.current[activeSugg];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeSugg]);

  const goToSugg = useCallback(
    (s: Suggestion) => {
      setShowSuggestions(false);
      setSuggestions([]);
      setInputVal("");
      router.push(`/anime/${s.id}`);
    },
    [router],
  );

  // ArrowUp/Down cycle suggestions, Enter opens highlighted (or searches),
  // Escape closes the dropdown.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (suggestions.length && !showSuggestions) setShowSuggestions(true);
        if (suggestions.length)
          setActiveSugg((i) => (i + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (suggestions.length)
          setActiveSugg(
            (i) => (i - 1 + suggestions.length) % suggestions.length,
          );
      } else if (e.key === "Enter") {
        if (activeSugg >= 0 && suggestions[activeSugg]) {
          e.preventDefault();
          goToSugg(suggestions[activeSugg]);
        } else {
          setShowSuggestions(false);
          updateParam("q", inputVal);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setActiveSugg(-1);
      }
    },
    [showSuggestions, suggestions, activeSugg, inputVal, goToSugg, updateParam],
  );

  // Shared suggestion row (used by both the landing bar and quick search).
  const renderSuggestion = (s: Suggestion, idx: number) => {
    const active = idx === activeSugg;
    return (
      <motion.div
        key={s.id}
        variants={{
          hidden: { opacity: 0, y: 6 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-[var(--color-line)] last:border-0"
      >
        <Link
          ref={(el) => {
            suggRefs.current[idx] = el;
          }}
          href={`/anime/${s.id}`}
          onClick={() => {
            setShowSuggestions(false);
            setInputVal("");
          }}
          onMouseEnter={() => setActiveSugg(idx)}
          className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
            active ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          {s.poster && (
            <div className="relative h-10 w-7 rounded overflow-hidden border border-[var(--color-line)] shrink-0">
              <Image
                src={s.poster}
                alt=""
                fill
                className="object-cover"
                sizes="28px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{s.title}</p>
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
              {s.format && <span>{s.format}</span>}
              {s.year && <span>{s.year}</span>}
              {s.episodes && <span>{s.episodes} ep</span>}
              {s.status && (
                <span className="capitalize">{s.status.replace(/_/g, " ")}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // One-click removable chips summarizing every active filter.
  const activeChips = useMemo(() => {
    const out: { label: string; remove: () => void }[] = [];
    if (genre)
      out.push({
        label: genre,
        remove: () => {
          const n = new URLSearchParams(searchParams.toString());
          n.delete("genre");
          n.delete("genre2");
          n.delete("genreOp");
          router.push(`${pathname}?${n.toString()}`);
        },
      });
    if (genre2)
      out.push({
        label: `${genreOp === "AND" ? "AND" : "OR"} ${genre2}`,
        remove: () => updateParam("genre2", ""),
      });
    if (tag)
      out.push({ label: `#${tag}`, remove: () => updateParam("tag", "") });
    if (format)
      out.push({
        label: FORMAT_OPTIONS.find((f) => f.value === format)?.label ?? format,
        remove: () => updateParam("format", ""),
      });
    if (statusFilter)
      out.push({
        label:
          STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ??
          statusFilter,
        remove: () => updateParam("status", ""),
      });
    if (season)
      out.push({
        label: `${season.charAt(0)}${season.slice(1).toLowerCase()}`,
        remove: () => updateParam("season", ""),
      });
    if (yearFrom)
      out.push({
        label: yearTo ? `${yearFrom} - ${yearTo}` : yearFrom,
        remove: () => {
          const n = new URLSearchParams(searchParams.toString());
          n.delete("yearFrom");
          n.delete("yearTo");
          router.push(`${pathname}?${n.toString()}`);
        },
      });
    if (studioName)
      out.push({ label: studioName, remove: () => updateParam("studio", "") });
    if (sort !== "POPULARITY_DESC")
      out.push({
        label: SORT_OPTIONS.find((s) => s.value === sort)?.label ?? sort,
        remove: () => updateParam("sort", ""),
      });
    return out;
  }, [
    genre,
    genre2,
    genreOp,
    tag,
    format,
    statusFilter,
    season,
    yearFrom,
    yearTo,
    studioName,
    sort,
    searchParams,
    pathname,
    router,
    updateParam,
  ]);

  return (
    <PageTransition>
      {isLanding ? (
        <ErrorBoundary label="Search">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
            {/* Neon Search Bar */}
            <div
              className="mb-10 max-w-2xl mx-auto text-center relative"
              ref={suggestRef}
            >
              <RevealLabel className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-magenta)] mb-3">
                Discover Anime
              </RevealLabel>
              <motion.div
                className="neon-rgb-border rounded-xl px-4 py-2 inline-block"
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  filter: [
                    "drop-shadow(0 0 0px rgba(0,255,255,0))",
                    "drop-shadow(0 0 18px rgba(0,255,255,0.5))",
                    "drop-shadow(0 0 0px rgba(0,255,255,0))",
                  ],
                }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <RevealTitle
                  as="h1"
                  text="Search Anime"
                  className="font-display text-4xl sm:text-6xl font-black tracking-tight mb-6"
                />
              </motion.div>
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  filter: [
                    "drop-shadow(0 0 0px rgba(0,255,255,0))",
                    "drop-shadow(0 0 14px rgba(0,255,255,0.4))",
                    "drop-shadow(0 0 0px rgba(0,255,255,0))",
                  ],
                }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
              >
                <div className="neon-rgb-border rounded-xl flex items-center overflow-hidden transition-all duration-300 focus-within:scale-[1.01] focus-within:shadow-[0_0_30px_-6px_var(--color-cyan)]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="ml-4 text-[var(--color-mute)] shrink-0"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                    placeholder={typedPlaceholder || "Search thousands of anime..."}
                    className="w-full bg-transparent py-4 px-3 text-base text-white placeholder-[var(--color-mute)]/50 outline-none"
                  />
                  {inputVal ? (
                    <button
                      onClick={() => {
                        setInputVal("");
                        setSuggestions([]);
                        setShowSuggestions(false);
                        setActiveSugg(-1);
                      }}
                      aria-label="Clear search"
                      className="mr-2 shrink-0 rounded-full p-1.5 text-[var(--color-mute)] hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <kbd className="mr-3 hidden shrink-0 items-center rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-mute)] sm:flex">
                      /
                    </kbd>
                  )}
                </div>
              </motion.div>
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    key="sugg-landing"
                    initial={{ opacity: 0, y: -6, scale: 0.98, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, y: -6, scale: 0.98, x: "-50%" }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-1/2 mt-1 w-[500px] max-w-[90vw] rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50 text-left origin-top"
                  >
                    {suggestLoading && (
                      <div className="flex items-center gap-2 px-3 py-2.5 text-[11px] text-[var(--color-mute)]">
                        <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                        searching...
                      </div>
                    )}
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.03 } },
                      }}
                    >
                      {suggestions.map(renderSuggestion)}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-5">
                <p className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--color-mute)]">
                  <span className="text-[var(--color-cyan)]">✦</span>
                  Trending searches
                  <span className="text-[var(--color-magenta)]">✦</span>
                </p>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {popularAnime.slice(0, 6).map((p) => {
                    const t = p.title.english || p.title.romaji || "";
                    if (!t) return null;
                    return (
                      <motion.button
                        key={p.id}
                        variants={{
                          hidden: { opacity: 0, y: 8, scale: 0.9 },
                          visible: { opacity: 1, y: 0, scale: 1 },
                        }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => {
                          setInputVal(t);
                          setSuggestions([]);
                          setShowSuggestions(false);
                          updateParam("q", t);
                        }}
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] hover:shadow-[0_0_12px_rgba(0,255,224,0.25)] transition-all"
                      >
                        {t}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            <div className="mb-8 flex items-end justify-between">
              <div>
                <RevealLabel className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
                  Explore
                </RevealLabel>
                <RevealTitle
                  as="h2"
                  text="Most Popular"
                  className="font-display text-3xl font-black sm:text-5xl tracking-tight"
                  delay={0.05}
                />
                <p className="mt-1 text-sm text-[var(--color-mute)]">
                  Discover what everyone is watching
                </p>
              </div>
              <Link
                href="/search?sort=POPULARITY_DESC"
                className="shrink-0 text-xs uppercase tracking-wider text-[var(--color-mute)] hover:text-white transition-colors"
              >
                View all
              </Link>
            </div>
            {popularAnime.length > 0 ? (
              <ExpandingFlexCard items={popularAnime} />
            ) : (
              <>
                <div className="flex gap-3 overflow-x-auto pb-2 md:hidden -mx-4 px-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`ph-${i}`}
                      className="relative w-[140px] shrink-0 rounded-2xl bg-[var(--color-panel)] animate-pulse overflow-hidden"
                    >
                      <div className="h-[210px]" />
                    </div>
                  ))}
                </div>
                <div className="hidden md:flex h-[400px] gap-2 w-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`phd-${i}`}
                      className="flex-1 rounded-2xl bg-[var(--color-panel)] animate-pulse overflow-hidden"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary label="Search">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex items-end justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <RevealLabel
                  spacing="0.2em"
                  className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]"
                >
                  Search
                </RevealLabel>
                <motion.div
                  className="neon-rgb-border rounded-xl px-4 py-2 inline-block"
                  initial={{ opacity: 0, scale: 0.94, y: 8 }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: [
                      "drop-shadow(0 0 0px rgba(0,255,255,0))",
                      "drop-shadow(0 0 16px rgba(0,255,255,0.45))",
                      "drop-shadow(0 0 0px rgba(0,255,255,0))",
                    ],
                  }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h1 className="font-display text-3xl font-bold sm:text-4xl truncate">
                    {query ? `"${query}"` : "Browse All"}
                  </h1>
                </motion.div>
              </div>
              <button
                onClick={() => setShowFilters((o) => !o)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />
                )}
              </button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                key="filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 rounded-2xl bg-[var(--color-panel)] p-5 space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Genre
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={genre}
                        onChange={(e) => updateParam("genre", e.target.value)}
                        className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                      >
                        <option value="">Any</option>
                        {genres.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      {genre && (
                        <>
                          <select
                            value={genreOp}
                            onChange={(e) =>
                              updateParam("genreOp", e.target.value)
                            }
                            className="w-16 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-2 text-xs outline-none focus:border-[var(--color-cyan)]"
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                          <select
                            value={genre2}
                            onChange={(e) =>
                              updateParam("genre2", e.target.value)
                            }
                            className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                          >
                            <option value="">Any</option>
                            {genres
                              .filter((g) => g !== genre)
                              .map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => updateParam("format", e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    >
                      {FORMAT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => updateParam("status", e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Sort By
                    </label>
                    <select
                      value={sort}
                      onChange={(e) => updateParam("sort", e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    >
                      {SORT_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Season
                    </label>
                    <select
                      value={season}
                      onChange={(e) => updateParam("season", e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    >
                      {SEASON_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Year Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={yearFrom}
                        onChange={(e) =>
                          updateParam("yearFrom", e.target.value)
                        }
                        placeholder="From"
                        min={1970}
                        max={CURRENT_YEAR + 2}
                        className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                      />
                      <span className="text-[var(--color-mute)] text-xs">
                        —
                      </span>
                      <input
                        type="number"
                        value={yearTo}
                        onChange={(e) => updateParam("yearTo", e.target.value)}
                        placeholder="To"
                        min={1970}
                        max={CURRENT_YEAR + 2}
                        className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Tag
                    </label>
                    <select
                      value={tag}
                      onChange={(e) => updateParam("tag", e.target.value)}
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    >
                      <option value="">Any Tag</option>
                      {tags
                        .filter((t) => t.rank >= 50)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--color-mute)] mb-1.5">
                      Studio Name
                    </label>
                    <input
                      value={studioName}
                      onChange={(e) => updateParam("studio", e.target.value)}
                      placeholder="e.g. Kyoto Animation, MAPPA, Studio Ghibli..."
                      className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                    />
                  </div>
                  {/* This page only knows about AniList media. Written content
                    (wiki, blog, forum) is searched by meaning on its own
                    surface, so the two do not compete for the same box. */}
                  <div className="mt-2 flex justify-end">
                    <Link
                      href="/search/semantic"
                      className="text-xs text-[var(--color-mute)] underline-offset-2 hover:text-[var(--color-violet)] hover:underline"
                    >
                      Looking for articles or guides? Search by meaning →
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-line)]">
                  <span className="text-xs text-[var(--color-mute)]">
                    {pageInfo ? `${pageInfo.total} results` : "Searching..."}
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[var(--color-magenta)] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Quick Search + Tabs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:max-w-xs" ref={suggestRef}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  ref={searchInputRef}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                  placeholder="Search by name..."
                  className="w-full rounded-full neon-rgb-border bg-[var(--color-panel)] py-2 pl-9 pr-8 text-sm outline-none"
                />
                {inputVal && (
                  <button
                    onClick={() => {
                      setInputVal("");
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setActiveSugg(-1);
                    }}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-mute)] hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      key="sugg-quick"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute top-full left-0 mt-1 w-80 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50 origin-top"
                    >
                      {suggestLoading && (
                        <div className="flex items-center gap-2 px-3 py-2.5 text-[11px] text-[var(--color-mute)]">
                          <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)] animate-pulse" />
                          searching...
                        </div>
                      )}
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: { transition: { staggerChildren: 0.03 } },
                        }}
                      >
                        {suggestions.map(renderSuggestion)}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Type Tabs */}
            <div className="mt-4 flex items-center gap-1 border-b border-[var(--color-line)] flex-wrap">
              {(["ANIME", "MANGA", "ALL"] as const).map((t) => {
                const active =
                  type === t ||
                  (type === "ANIME" &&
                    t === "ANIME" &&
                    !searchParams.get("type"));
                return (
                  <button
                    key={t}
                    onClick={() => updateParam("type", t === "ANIME" ? "" : t)}
                    className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "text-[var(--color-magenta)]"
                        : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {t === "ALL"
                      ? "Both"
                      : t.charAt(0) + t.slice(1).toLowerCase()}
                    {active && (
                      <motion.span
                        layoutId="search-type-underline"
                        className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-[var(--color-magenta)] shadow-[0_0_8px_var(--color-magenta)]"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </button>
                );
              })}
              {type !== "ALL" && pageInfo && (
                <motion.span
                  key={`count-${pageInfo.total}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-auto text-xs text-[var(--color-mute)] font-mono"
                >
                  {pageInfo.total} results
                </motion.span>
              )}
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && activeChips.length > 0 && (
              <div className="mt-3 -mb-1 flex flex-wrap items-center gap-1.5">
                <AnimatePresence initial={false}>
                  {activeChips.map((c) => (
                    <motion.button
                      key={c.label}
                      layout
                      initial={{ opacity: 0, scale: 0.7, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.7, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      onClick={c.remove}
                      title="Remove this filter"
                      className="group inline-flex items-center gap-1 rounded-full border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/10 px-3 py-1 text-[11px] text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/60 transition-all"
                    >
                      {c.label}
                      <span className="ml-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                        ×
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
                <button
                  onClick={clearFilters}
                  className="ml-1 text-[11px] text-[var(--color-magenta)] hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results */}
            <div className="mt-8">
              {error ? (
                <ErrorState message={error} onRetry={() => runSearch(1)} />
              ) : (
                <>
                  {loading &&
                  displayAnime.length === 0 &&
                  displayManga.length === 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <CardSkeleton key={`s${i}`} />
                      ))}
                    </div>
                  ) : (
                    <>
                      {displayAnime.length > 0 && displayAll && (
                        <div className="mb-6">
                          <AdBanner placement="search" type="sidebar" />
                          <NativeBannerAd className="mt-3" />
                        </div>
                      )}
                      {displayAnime.length > 0 && (
                        <motion.div
                          key={`anime-${searchKey}`}
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.03 } },
                          }}
                        >
                          {displayAll && (
                            <motion.h3
                              variants={{
                                hidden: { opacity: 0, y: 8 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="font-display text-lg font-bold mb-3"
                            >
                              Anime
                            </motion.h3>
                          )}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {displayAnime.map((a) => (
                              <motion.div
                                key={`anime-${a.id}`}
                                variants={{
                                  hidden: { opacity: 0, y: 16 },
                                  visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <AnimeCard anime={a} />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {displayManga.length > 0 && (
                        <motion.div
                          key={`manga-${searchKey}`}
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.03 } },
                          }}
                          className={displayAll ? "mt-8" : ""}
                        >
                          {displayAll && (
                            <motion.h3
                              variants={{
                                hidden: { opacity: 0, y: 8 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="font-display text-lg font-bold mb-3"
                            >
                              Manga
                            </motion.h3>
                          )}
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {displayManga.map((m) => (
                              <motion.div
                                key={`manga-${m.id}`}
                                variants={{
                                  hidden: { opacity: 0, y: 16 },
                                  visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <AnimeCard anime={m} />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {!loading &&
                        displayAnime.length === 0 &&
                        displayManga.length === 0 && (
                          <>
                            {(smartLoading ||
                              smartResults.length > 0 ||
                              smartError) && (
                              <div className="mb-8">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(0,255,224,0.55)]" />
                                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cyan)]">
                                    ✦ Smart AI Match
                                  </span>
                                </div>
                                {smartInterpreted && (
                                  <p className="mt-1 text-xs text-[var(--color-mute)]">
                                    Understood as:{" "}
                                    <span className="text-[var(--color-cyan)]">
                                      {smartInterpreted}
                                    </span>
                                  </p>
                                )}
                                {smartLoading && (
                                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-mute)]">
                                    <svg
                                      className="animate-spin h-4 w-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M20 12L4 2M8 22a2 2 0 0 1 4-12a3 3 0 0 1 3-3M13 9l-1.5 1.5" />
                                    </svg>
                                    Zyni AI is interpreting your sentence…
                                  </div>
                                )}
                                {smartError && (
                                  <p className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                    {smartError}
                                  </p>
                                )}
                                {smartResults.length > 0 && (
                                  <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                      hidden: {},
                                      visible: {
                                        transition: { staggerChildren: 0.04 },
                                      },
                                    }}
                                    className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mt-3"
                                  >
                                    {smartResults.map((a) => (
                                      <motion.div
                                        key={`smart-${a.id}`}
                                        variants={{
                                          hidden: { opacity: 0, y: 14 },
                                          visible: { opacity: 1, y: 0 },
                                        }}
                                        transition={{
                                          duration: 0.3,
                                          ease: [0.22, 1, 0.36, 1],
                                        }}
                                      >
                                        <Link
                                          href={`/anime/${a.id}`}
                                          className="group block no-underline"
                                        >
                                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-[var(--color-line)] group-hover:border-[var(--color-cyan)] transition-all">
                                            {a.poster ? (
                                              <Image
                                                src={a.poster}
                                                alt={a.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width:768px) 50vw, 25vw"
                                              />
                                            ) : (
                                              <div className="flex h-full items-center justify-center text-xs text-[var(--color-mute)]">
                                                No art
                                              </div>
                                            )}
                                            {a.score ? (
                                              <span className="absolute top-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-[#ffd700]">
                                                ★ {(a.score / 10).toFixed(1)}
                                              </span>
                                            ) : null}
                                          </div>
                                          <p className="mt-1 truncate text-xs font-medium">
                                            {a.title}
                                          </p>
                                          {a.year && (
                                            <p className="truncate text-[10px] text-[var(--color-mute)]">
                                              {a.year}
                                            </p>
                                          )}
                                        </Link>
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                )}
                              </div>
                            )}
                            <EmptyState
                              icon="search"
                              title="No keyword results found"
                              description={
                                smartResults.length > 0 || smartLoading
                                  ? "But here's what matches your meaning — if this looks right, it means you were describing the vibe, not the title."
                                  : 'Try a natural-language search like "anime jisme MC weak hai par strong ban jata hai" — Smart Search can understand sentences.'
                              }
                              actionLabel="Clear Filters"
                              onAction={clearFilters}
                            />
                          </>
                        )}
                      <AnimatePresence initial={false}>
                        {loading && (
                          <motion.div
                            key="search-skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mt-4"
                          >
                            {Array.from({ length: 6 }).map((_, i) => (
                              <CardSkeleton key={`l${i}`} />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                  <div ref={sentinelRef} className="h-4" />
                  {pageInfo?.hasNextPage && loading && (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
                    </div>
                  )}
                  {/* Affiliate CTA */}
                  {!loading &&
                    (displayAnime.length > 0 || displayManga.length > 0) && (
                      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4">
                        <span className="text-xs text-[var(--color-mute)]">
                          Watch legally on:
                        </span>
                        <a
                          href="https://www.crunchyroll.com/search?ref=zyniverse"
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F47521] to-[#f59e0b] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
                        >
                          ▶ Crunchyroll
                        </a>
                        <a
                          href="https://www.netflix.com/in/browse/genus/7424?ref=zyniverse"
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#E50914] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                        >
                          ▶ Netflix
                        </a>
                        <a
                          href={amazonSearchUrl("anime")}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-1.5 rounded-full neon-rgb-border px-5 py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
                        >
                          📦 Amazon
                        </a>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </ErrorBoundary>
      )}
    </PageTransition>
  );
}
