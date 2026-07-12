"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

const TRENDING_TOPICS = [
  "Naruto", "Attack_on_Titan", "One_Piece", "Demon_Slayer:_Kimetsu_no_Yaiba",
  "Jujutsu_Kaisen",
];

export default function WikiPageClient() {
  const { data: session } = useSession();
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState<TrendingItem[]>([]);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("limit", "50");

    fetch(`/api/wiki?${params.toString()}`, { signal: abort.signal })
      .then((r) => r.json())
      .then((data) => { if (!abort.signal.aborted) setPages(data.pages || []); })
      .catch(() => { if (!abort.signal.aborted) setPages([]); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });

    return () => abort.abort();
  }, [category, search]);

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
        const items: TrendingItem[] = Object.values(pages).map((p: any) => ({
          title: p.title,
          extract: (p.extract || "").slice(0, 200),
          thumbnail: p.thumbnail?.source || null,
          slug: p.title.replace(/ /g, "_"),
        }));
        setTrending(items);
      })
      .catch(() => {});

    return () => abort.abort();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Knowledge Base</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Wiki</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Community-driven knowledge base for anime, manga, characters, studios, and more.
        </p>
      </div>

      {/* Neon category buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className="neon-premium rounded-lg"
          >
            <div className="neon-premium-track rounded-lg" />
            <div className="neon-premium-overlay rounded-[6.5px]" />
            <div className={`neon-premium-content flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-300 ${
              category === cat.value
                ? "bg-[var(--color-magenta)]/10 text-[var(--color-magenta)] shadow-[inset_0_0_20px_-8px_var(--color-magenta)]"
                : "text-[var(--color-mute)] hover:bg-[var(--color-cyan)]/5 hover:text-[var(--color-cyan)]"
            }`}>
              <span className="text-xl">{cat.icon}</span>
              <span className="text-[10px] font-semibold text-center">{cat.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Search + Create with neon */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="neon-premium rounded-lg flex-1 max-w-xs">
          <div className="neon-premium-track rounded-lg" />
          <div className="neon-premium-overlay rounded-[6.5px]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wiki across Wikipedia..."
            className="neon-premium-content rounded-lg border-0 bg-transparent px-3 py-1.5 text-sm outline-none w-full text-[var(--color-ink)] placeholder-[var(--color-mute)]"
          />
        </div>
        {session && (
          <Link href="/wiki/create" className="neon-premium rounded-xl no-underline shrink-0">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <span className="neon-premium-content flex items-center px-4 py-1.5 text-xs font-bold text-[var(--color-magenta)] hover:text-white transition-colors rounded-xl">
              + New Page
            </span>
          </Link>
        )}
      </div>

      <div className="mb-6 max-w-[728px] mx-auto">
        <AdBanner placement="wiki" type="sidebar" />
      </div>

      {/* Pages list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="neon-premium rounded-xl" style={{ minHeight: 72 }}>
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-4 animate-pulse">
                <div className="h-5 w-1/3 bg-[var(--color-line)] rounded mb-2" />
                <div className="h-3 w-2/3 bg-[var(--color-line)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="neon-premium rounded-xl text-center">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content py-20 px-6">
            <p className="text-[var(--color-mute)] mb-4">No wiki pages yet</p>
            {session && (
              <Link href="/wiki/create" className="neon-premium rounded-xl inline-flex no-underline">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <span className="neon-premium-content flex items-center px-6 py-3 text-sm font-bold text-[var(--color-magenta)] hover:text-white transition-colors rounded-xl">
                  Create the first page
                </span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/wiki/${page.slug}`}
              className="neon-premium rounded-xl no-underline group"
            >
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content">
                {page.coverImage ? (
                  <div className="relative h-28 w-full overflow-hidden rounded-t-xl">
                    <div
                      className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `url(${page.coverImage}) center/cover` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="h-28 w-full rounded-t-xl bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">{page.category}</span>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-xs group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
                      {page.title}
                    </h3>
                    {page.isExternal && (
                      <svg className="w-3 h-3 text-[var(--color-cyan)]/40 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </div>
                  {page.summary && (
                    <p className="text-[10px] text-[var(--color-mute)] mt-1 line-clamp-2 leading-relaxed">
                      {page.summary}
                      {page.isExternal && (
                        <span className="text-[var(--color-cyan)] ml-1 text-[8px]">(Wikipedia)</span>
                      )}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[9px] text-[var(--color-mute)] flex-wrap">
                    <span className="rounded-full bg-[var(--color-cyan)]/10 px-1.5 py-0.5 text-[8px] font-medium text-[var(--color-cyan)]">
                      {page.category}
                    </span>
                    {!page.isExternal && (
                      <>
                        <span>v{page.version}</span>
                        <span>by {page.editor.username}</span>
                      </>
                    )}
                    {page.isExternal && (
                      <span className="text-[var(--color-cyan)]/60">via Wikipedia</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Trending */}
      {!search && trending.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-display text-xl font-bold">Trending on Wikipedia</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-cyan)]/30 to-transparent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {trending.map((item) => (
              <Link
                key={item.title}
                href={`/wiki/${item.slug}`}
                className="neon-premium rounded-xl no-underline group"
              >
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <div className="neon-premium-content">
                  {item.thumbnail ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-t-xl">
                      <div
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        style={{ background: `url(${item.thumbnail}) center/cover` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-t-xl bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">trending</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-display font-bold text-xs group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-[var(--color-mute)] mt-1 line-clamp-2 leading-relaxed">
                      {item.extract}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
