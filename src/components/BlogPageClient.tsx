"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import NativeBannerAd from "@/components/NativeBannerAd";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string | null;
  isExternal?: boolean;
  url?: string;
  user: { id?: string; username: string; avatar?: string | null };
}

const TAG_CLOUD = [
  "anime", "review", "recommendation", "top-10", "opinion",
  "seasonal", "classic", "movie", "manga", "news",
];

export default function BlogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSearch = searchParams.get("search") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSort = searchParams.get("sort") || "recent";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const fetchPosts = useCallback(async (search: string, tag: string, sort: string, page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "12");
    params.set("sort", sort);
    params.set("page", page.toString());
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);

    try {
      const res = await fetch(`/api/blog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts(currentSearch, currentTag, currentSort, currentPage);
  }, [currentSearch, currentTag, currentSort, currentPage, fetchPosts]);

  const pushParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/blog?${params.toString()}`);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("search", value.trim());
      else params.delete("search");
      params.delete("page");
      router.push(`/blog?${params.toString()}`);
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) params.set("search", searchInput.trim());
    else params.delete("search");
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const featured = posts.length > 0 ? [...posts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Blog</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Anime Blog</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.
        </p>
      </div>

      {/* Search Bar — Premium Neon Border */}
      <div className="mb-8 max-w-xl">
        <div className="relative rounded-full">
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0"
              style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
            />
            <div className="absolute inset-[1.5px] rounded-full" style={{ background: "rgba(10,10,15,0.95)" }} />
          </div>

          <form onSubmit={handleSearchSubmit} className="relative z-10 flex items-center">
            <div className="pl-5 pr-1 flex items-center">
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-[var(--color-cyan)]" viewBox="0 0 24 24" fill="none">
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
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search anime blogs, reviews, recommendations..."
              className="flex-1 bg-transparent py-3 px-2 text-sm outline-none placeholder-[var(--color-mute)]/60 text-[var(--color-ink)]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="pr-2 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="mr-1.5 rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-4 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition-opacity shrink-0"
            >Search</button>
          </form>
        </div>

        {currentSearch && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[var(--color-mute)]">
              {loading ? "Searching..." : `Found ${total} result${total !== 1 ? "s" : ""} for`}
            </span>
            {!loading && (
              <>
                <span className="text-xs font-bold text-[var(--color-cyan)]">&quot;{currentSearch}&quot;</span>
                <button onClick={handleClearSearch} className="text-[10px] text-[var(--color-magenta)] hover:underline font-bold">Clear</button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <Link href="/blog/create"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity"
        >✏️ Write a Post</Link>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-mute)]">Sort:</span>
          <button
            onClick={() => pushParams("sort", "recent")}
            className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${currentSort === "recent" ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}
          >Latest</button>
          <button
            onClick={() => pushParams("sort", "popular")}
            className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${currentSort === "popular" ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}
          >Popular</button>
        </div>
      </div>

      {/* Featured */}
      {!currentSearch && !currentTag && featured && (
        <div className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-3">Featured Post</p>
          <Link
            href={featured.isExternal ? `/blog/external/${featured.id}` : `/blog/${featured.slug}`}
            className="group block relative rounded-[20px] no-underline"
          >
            <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
              <div className="absolute inset-0"
                style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
              />
              <div className="absolute inset-[1.5px] rounded-[18.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
            </div>

            <div className="relative z-10 rounded-[20px] overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {featured.coverImage ? (
                  <div className="relative h-52 sm:h-60 sm:w-[420px] shrink-0 overflow-hidden">
                    <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                      style={{ background: `url(${featured.coverImage}) center/cover` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.7)] via-transparent to-transparent sm:bg-gradient-to-r" />
                  </div>
                ) : (
                  <div className="h-52 sm:h-60 sm:w-[420px] shrink-0 bg-gradient-to-br from-[var(--color-cyan)]/10 via-[var(--color-panel)] to-[var(--color-magenta)]/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                    <div className="text-center z-10 px-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)] text-sm font-black text-black mx-auto mb-2">
                        {featured.isExternal ? "ZB" : featured.user?.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">Featured</span>
                    </div>
                  </div>
                )}
                <div className="p-6 sm:p-8 flex flex-col justify-center min-w-0">
                  <h2 className="font-display text-xl sm:text-2xl font-bold group-hover:text-[var(--color-cyan)] transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-2 text-sm text-[var(--color-mute)] line-clamp-2 leading-relaxed">{featured.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]/70">
                    <div className="flex items-center gap-1.5">
                      {featured.isExternal ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)] text-[7px] font-black text-black">ZB</div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[7px] font-bold text-black">
                          {featured.user?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <span>{featured.isExternal ? "ZyniBot" : featured.user?.username}</span>
                    </div>
                    {featured.publishedAt && <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {featured.viewCount}
                    </span>
                    {featured.isExternal && <span className="text-[var(--color-cyan)]/40 text-[8px]">via dev.to</span>}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">
        {/* Posts Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative rounded-[16px]">
                  <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
                    <div className="absolute inset-0" style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }} />
                    <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
                  </div>
                  <div className="relative z-10 p-4 animate-pulse">
                    <div className="h-44 w-full rounded-t-xl bg-white/5 mb-4" />
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-full bg-white/5" />
                      <div className="h-3 w-20 rounded bg-white/5" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-white/5 mb-2" />
                    <div className="h-3 w-full rounded bg-white/5 mb-1" />
                    <div className="h-3 w-2/3 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="relative rounded-[16px] text-center">
              <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
                <div className="absolute inset-0"
                  style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
                />
                <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
              </div>
              <div className="relative z-10 py-20 px-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[var(--color-ink)] mb-1">
                  {currentSearch ? "No posts found" : "No posts yet"}
                </p>
                <p className="text-xs text-[var(--color-mute)]">
                  {currentSearch ? `Try a different search term` : "Be the first to write!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {total > currentPage * 12 && (
            <div className="mt-8 text-center">
              <Link href={`/blog?page=${currentPage + 1}${currentTag ? `&tag=${currentTag}` : ""}${currentSearch ? `&search=${currentSearch}` : ""}${currentSort !== "recent" ? `&sort=${currentSort}` : ""}`}
                className="text-sm text-[var(--color-cyan)] hover:underline">Load more posts →</Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="relative rounded-[16px]">
            <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
              <div className="absolute inset-0"
                style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
              />
              <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
            </div>
            <div className="relative z-10 p-5">
              <h3 className="font-display text-sm font-bold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {TAG_CLOUD.map((tag) => (
                  <button key={tag} onClick={() => pushParams("tag", currentTag === tag ? "" : tag)}
                    className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${
                      currentTag === tag
                        ? "bg-[var(--color-cyan)]/15 border border-[var(--color-cyan)]/20 text-[var(--color-cyan)]"
                        : "bg-[var(--color-cyan)]/8 border border-[var(--color-cyan)]/10 text-[var(--color-cyan)]/80 hover:bg-[var(--color-cyan)]/15"
                    }`}
                  >{tag}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative rounded-[16px]">
            <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
              <div className="absolute inset-0"
                style={{ background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)", animation: "spin 6s linear infinite", willChange: "transform" }}
              />
              <div className="absolute inset-[1.5px] rounded-[14.5px]" style={{ background: "rgba(10,10,15,0.92)" }} />
            </div>
            <div className="relative z-10 p-5 text-center">
              <h3 className="font-display text-sm font-bold mb-2">Write for ZyniVerse</h3>
              <p className="text-xs text-[var(--color-mute)] mb-4">Share your anime thoughts with the community.</p>
              <Link href="/blog/create"
                className="inline-block rounded-full bg-[var(--color-magenta)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity"
              >Start Writing</Link>
            </div>
          </div>
        </aside>
      </div>
      <div className="mx-auto max-w-7xl pb-6 mt-8">
        <NativeBannerAd />
      </div>
    </div>
  );
}
