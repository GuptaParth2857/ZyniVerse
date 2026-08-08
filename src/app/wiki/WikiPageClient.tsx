"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import AdBanner from "@/components/AdBanner";

const CATEGORIES = [
  { value: "", label: "All", icon: "📚" },
  { value: "anime", label: "Anime", icon: "🎬" },
  { value: "manga", label: "Manga", icon: "📖" },
  { value: "character", label: "Characters", icon: "👤" },
  { value: "studio", label: "Studios", icon: "🏢" },
  { value: "genre", label: "Genres", icon: "🏷️" },
  { value: "guide", label: "Guides", icon: "📋" },
  { value: "help", label: "Help", icon: "❓" },
];

const CATEGORY_CHIP: Record<string, string> = {
  anime: "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]",
  manga: "bg-[var(--color-magenta)]/10 text-[var(--color-magenta)]",
  character: "bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  studio: "bg-[var(--color-purple)]/10 text-[var(--color-purple)]",
  genre: "bg-green-500/10 text-green-400",
  guide: "bg-orange-500/10 text-orange-400",
  help: "bg-sky-500/10 text-sky-400",
};

const CATEGORY_LABEL: Record<string, string> = {
  anime: "Anime", manga: "Manga", character: "Character", studio: "Studio",
  genre: "Genre", guide: "Guide", help: "Help", wiki: "Wiki",
};

interface WikiPageSummary {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  category: string;
  tags: string;
  version: number;
  updatedAt: string;
  editor: { id: string; username: string };
  _count: { history: number };
  isExternal?: boolean;
  coverImage?: string | null;
}

interface TrendingItem {
  title: string;
  extract: string;
  thumbnail: string | null;
  slug: string;
}

interface WikiPageEntry {
  title: string;
  extract?: string;
  thumbnail?: { source?: string };
}

const TRENDING_TOPICS = [
  "Naruto", "Attack_on_Titan", "One_Piece", "Demon_Slayer:_Kimetsu_no_Yaiba",
  "Jujutsu_Kaisen",
];

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function Card3D({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      {children}
    </motion.div>
  );
}

export default function WikiPageClient() {
  const { data: session } = useSession();
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const abort = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setPages([]);
    setHasMore(false);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("limit", String(PAGE_SIZE));
    params.set("page", "1");

    fetch(`/api/wiki?${params.toString()}`, { signal: abort.signal })
      .then((r) => r.json())
      .then((data) => {
        if (abort.signal.aborted) return;
        const fetched = data.pages || [];
        setPages(fetched);
        setTotal(data.total || 0);
        setHasMore(fetched.length === PAGE_SIZE && fetched.length < (data.total || 0));
      })
      .catch(() => { if (!abort.signal.aborted) setPages([]); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });

    return () => abort.abort();
  }, [category, search]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || loading || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = Math.ceil(pages.length / PAGE_SIZE) + 1;
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(nextPage));

      const data = await fetch(`/api/wiki?${params.toString()}`).then((r) => r.json());
      const fetched = data.pages || [];
      const nextTotal = data.total || 0;
      setPages((prev) => [...prev, ...fetched]);
      setTotal(nextTotal);
      setHasMore(fetched.length === PAGE_SIZE && nextPage * PAGE_SIZE < nextTotal);
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [category, search, loading, hasMore, pages.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, hasMore]);

  useEffect(() => {
    const abort = new AbortController();
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&exlimit=max&exintro&explaintext&pithumbsize=400&format=json&origin=*&titles=${TRENDING_TOPICS.join("|")}`,
      { headers: { "User-Agent": "ZyniVerse/1.0" }, signal: abort.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        if (abort.signal.aborted) return;
        const pages = data.query?.pages || {};
        const items: TrendingItem[] = Object.values(pages).map((p) => {
          const page = p as WikiPageEntry;
          return {
            title: page.title,
            extract: (page.extract || "").slice(0, 200),
            thumbnail: page.thumbnail?.source || null,
            slug: page.title.replace(/ /g, "_"),
          };
        });
        setTrending(items);
      })
      .catch(() => {});

    return () => abort.abort();
  }, []);

  const trendingFiltered = useMemo(() => {
    const shown = new Set(pages.map((p) => p.title.toLowerCase().replace(/ /g, "_")));
    return trending.filter((t) => !shown.has(t.slug.toLowerCase()));
  }, [trending, pages]);

  const lastUpdated = useMemo(
    () => pages.find((p) => !p.isExternal)?.updatedAt || pages[0]?.updatedAt || "",
    [pages]
  );

  const internalCount = pages.filter((p) => !p.isExternal).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Knowledge Base</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Wiki</h1>
        </div>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Community-driven knowledge base for anime, manga, characters, studios, and more. Contribute and grow the archive.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="relative overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 transition-transform duration-200 hover:-translate-y-0.5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--color-cyan)]/50 via-[var(--color-magenta)]/50 to-transparent" />
          <p className="font-display text-2xl font-bold bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">{loading ? "…" : total}</p>
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mt-0.5">Articles</p>
        </div>
        <div className="relative overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 transition-transform duration-200 hover:-translate-y-0.5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--color-cyan)]/50 via-[var(--color-magenta)]/50 to-transparent" />
          <p className="font-display text-2xl font-bold bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">{loading ? "…" : internalCount}</p>
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mt-0.5">Community Pages</p>
        </div>
        <div className="relative overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 transition-transform duration-200 hover:-translate-y-0.5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--color-cyan)]/50 via-[var(--color-magenta)]/50 to-transparent" />
          <p className="font-display text-2xl font-bold bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">{CATEGORIES.length - 1}</p>
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mt-0.5">Categories</p>
        </div>
        <div className="relative overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 transition-transform duration-200 hover:-translate-y-0.5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--color-cyan)]/50 via-[var(--color-magenta)]/50 to-transparent" />
          <p className="font-display text-lg font-bold leading-8 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">{lastUpdated ? formatDate(lastUpdated) : "—"}</p>
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mt-0.5">Last Updated</p>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 rounded-full neon-rgb-border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              category === cat.value
                ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] shadow-[0_0_16px_-6px_var(--color-magenta)] scale-105"
                : "bg-[var(--color-panel)]/60 text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5"
            }`}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search + Create */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles and Wikipedia..."
            className="w-full rounded-xl neon-rgb-border bg-[var(--color-panel)] pl-9 pr-3 py-2 text-sm outline-none text-[var(--color-ink)] placeholder-[var(--color-mute)]"
          />
        </div>
        <div className="flex items-center gap-3">
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
            >
              Clear search
            </button>
          )}
          {session && (
            <Link href="/wiki/create" className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity no-underline shrink-0">
              + New Page
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 max-w-[728px] mx-auto">
        <AdBanner placement="wiki" type="sidebar" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 animate-pulse">
              <div className="h-32 w-full bg-[var(--color-line)] rounded-lg mb-3" />
              <div className="h-4 w-2/3 bg-[var(--color-line)] rounded mb-2" />
              <div className="h-3 w-full bg-[var(--color-line)] rounded" />
            </div>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] text-center py-20 px-6">
          <p className="text-[var(--color-mute)] mb-4">No articles found{search ? ` for "${search}"` : " in this category yet"}</p>
          {session ? (
            <Link href="/wiki/create" className="inline-flex rounded-xl bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity no-underline">
              Create a page
            </Link>
          ) : (
            <Link href="/login" className="inline-flex rounded-xl bg-[var(--color-cyan)]/10 px-6 py-3 text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors no-underline">
              Sign in to contribute
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page, i) => (
            <Card3D key={page.id} index={i}>
              <Link
                href={`/wiki/${page.slug}`}
                className="block h-full rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden no-underline"
              >
              {page.coverImage ? (
                <div className="relative h-32 w-full overflow-hidden bg-[var(--color-void)]">
                  <Image
                    src={page.coverImage}
                    alt={page.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
                  <span className="absolute top-2 right-2 text-2xl opacity-30">
                    {CATEGORIES.find((c) => c.value === page.category)?.icon || "📚"}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-widest">
                    {CATEGORY_LABEL[page.category] || page.category}
                  </span>
                </div>
              )}
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-sm group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
                    {page.title}
                  </h3>
                  {page.isExternal && (
                    <svg className="w-3 h-3 text-[var(--color-cyan)]/40 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </div>
                {page.summary && (
                  <p className="text-[11px] text-[var(--color-mute)] mt-1.5 line-clamp-2 leading-relaxed">
                    {page.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--color-mute)] flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${CATEGORY_CHIP[page.category] || "bg-white/5 text-[var(--color-mute)]"}`}>
                    {CATEGORY_LABEL[page.category] || page.category}
                  </span>
                  {page.isExternal ? (
                    <span className="text-[var(--color-cyan)]/60">via Wikipedia</span>
                  ) : (
                    <>
                      <span className="text-[var(--color-cyan)]/70">{page.editor.username}</span>
                      <span>·</span>
                      <span>v{page.version}</span>
                      <span>·</span>
                      <span>{formatDate(page.updatedAt)}</span>
                    </>
                  )}
                </div>
              </div>
              </Link>
            </Card3D>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && pages.length > 0 && hasMore && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div ref={sentinelRef} className="h-px w-full" />
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-xl neon-rgb-border bg-[var(--color-panel)] px-6 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5 transition-all disabled:opacity-60 no-underline"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-[var(--color-cyan)]/30 border-t-[var(--color-cyan)] animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {/* Trending */}
      {!search && trendingFiltered.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-display text-xl font-bold">Trending on Wikipedia</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-cyan)]/30 to-transparent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {trendingFiltered.map((item, i) => (
              <Card3D key={item.title} index={i}>
                <Link
                  href={`/wiki/${item.slug}`}
                  className="block h-full rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden no-underline"
                >
                {item.thumbnail ? (
                  <div className="relative h-32 w-full overflow-hidden bg-[var(--color-void)]">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-widest">trending</span>
                  </div>
                )}
                <div className="p-3.5">
                  <h3 className="font-display font-bold text-sm group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[var(--color-mute)] mt-1.5 line-clamp-2 leading-relaxed">
                    {item.extract}
                  </p>
                </div>
              </Link>
              </Card3D>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
