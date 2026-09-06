"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";
import { logError } from "@/lib/logger";

interface Moment {
  id: string;
  quote: string;
  character: string;
  animeTitle: string;
  animeCover: string | null;
  episode: string | null;
  timestamp: string | null;
  style: string;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null } | null;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Liked" },
  { value: "trending", label: "Trending" },
];

const STYLE_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: "", label: "All Styles", emoji: "🎨" },
  { value: "classic", label: "Classic", emoji: "📜" },
  { value: "neon", label: "Neon", emoji: "💜" },
  { value: "minimal", label: "Minimal", emoji: "⬜" },
  { value: "sakura", label: "Sakura", emoji: "🌸" },
  { value: "dark", label: "Dark", emoji: "🌑" },
];

const PAGE_SIZE = 20;

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setPage(1);
    setMoments([]);
    const params = new URLSearchParams({ page: "1", limit: PAGE_SIZE.toString(), sort });
    if (search.trim()) params.set("search", search.trim());
    if (style) params.set("style", style);

    fetch(`/api/moments?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setMoments(d.moments || []);
        setTotalPages(d.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch((e) => { logError(e); if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sort, search, style]);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setLoadingMore(true);
    const params = new URLSearchParams({ page: next.toString(), limit: PAGE_SIZE.toString(), sort });
    if (search.trim()) params.set("search", search.trim());
    if (style) params.set("style", style);
    try {
      const d = await fetch(`/api/moments?${params}`).then((r) => r.json());
      const more = (d.moments || []) as Moment[];
      setMoments((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...more.filter((m) => !ids.has(m.id))];
      });
      setTotalPages(d.pagination?.totalPages || totalPages);
      setPage(next);
    } catch (e) {
      logError(e);
    } finally {
      setLoadingMore(false);
    }
  }, [page, totalPages, sort, search, style, loadingMore]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [sort, search, style]);

  const browseMode = !search.trim() && !style;
  const featured = browseMode ? moments[0] : undefined;
  const gridMoments = featured ? moments.slice(1) : moments;
  const remaining = totalPages > 1 ? Math.max(0, totalPages * PAGE_SIZE - moments.length) : 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-3">
              <h1 className="neon-glow-text font-display text-3xl font-bold text-white">Moments</h1>
            </div>
            <p className="text-[var(--color-mute)] max-w-xl">
              Create and share your favorite anime quote cards. Browse the community gallery or make your own.
            </p>
          </div>
          <Link
            href="/moments/create"
            className="neon-rgb-border rounded-xl px-6 py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors text-center whitespace-nowrap"
          >
            ✦ Create Moment
          </Link>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              placeholder="Search quotes, characters, anime..."
              className="w-full rounded-xl neon-rgb-border bg-[var(--color-panel)] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setSort(o.value); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  sort === o.value
                    ? "neon-rgb-border bg-[var(--color-violet)] text-white"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s.value || "all"}
              onClick={() => setStyle(s.value)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                style === s.value
                  ? "neon-rgb-border bg-[var(--color-violet)] text-white"
                  : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
              }`}
            >
              <span className="mr-1">{s.emoji}</span>{s.label}
            </button>
          ))}
        </div>

        {/* Featured spotlight */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href={`/moments/${featured.id}`} className="group block">
              <div className="relative rounded-3xl overflow-hidden neon-rgb-border bg-[var(--color-void)] min-h-[320px] sm:min-h-[360px]">
                {featured.animeCover ? (
                  <>
                    <Image
                      src={featured.animeCover}
                      alt=""
                      fill
                      priority
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[#1a0a2e] to-[var(--color-void)]" />
                )}

                <div className="absolute inset-0 z-10 flex flex-col items-start justify-center px-6 sm:px-10 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="on-air-badge">✦ FEATURED</span>
                    {featured.style ? (
                      <span className="neon-rgb-border rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 capitalize">
                        {featured.style}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-2xl sm:text-4xl leading-snug font-light italic text-white drop-shadow-lg line-clamp-3">
                    &ldquo;{featured.quote}&rdquo;
                  </p>
                  <p className="mt-4 text-sm sm:text-base font-bold text-white/80">— {featured.character}</p>
                  <p className="text-xs text-white/40 font-mono mt-1">{featured.animeTitle}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      {featured.user?.avatar ? (
                        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-white/20">
                          <Image src={featured.user.avatar} alt="" fill className="object-cover" sizes="28px" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                          {featured.user?.username?.[0]?.toUpperCase() || "A"}
                        </div>
                      )}
                      <span className="text-xs text-white/60">{featured.user?.username || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>♥ {featured.likesCount}</span>
                      <span>👁 {featured.viewsCount}</span>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                      View Detail <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl neon-rgb-border bg-[var(--color-panel)] animate-pulse" />
            ))}
          </div>
        ) : moments.length === 0 ? (
          <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] text-center py-20">
            <p className="text-[var(--color-mute)] text-lg mb-4">No moments yet. Be the first to create one!</p>
            <Link href="/moments/create" className="neon-rgb-border rounded-xl px-6 py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors inline-block">
              ✦ Create Moment
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridMoments.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <Link href={`/moments/${m.id}`} className="group block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden neon-rgb-border bg-[var(--color-void)] transition-transform duration-300 group-hover:-translate-y-1">
                      {m.animeCover ? (
                        <>
                          <Image src={m.animeCover} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[#1a0a2e] to-[var(--color-void)]" />
                      )}

                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                        {m.style ? (
                          <span className="mb-3 neon-rgb-border rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 capitalize">
                            {m.style}
                          </span>
                        ) : null}
                        <p className="text-base sm:text-lg leading-relaxed font-light italic text-white/95 drop-shadow-lg line-clamp-5">
                          &ldquo;{m.quote}&rdquo;
                        </p>
                        <p className="mt-3 text-sm font-bold text-white/80">— {m.character}</p>
                        <p className="text-xs text-white/40 font-mono mt-1">{m.animeTitle}</p>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {m.user?.avatar ? (
                            <div className="relative h-6 w-6 rounded-full overflow-hidden border border-white/20">
                              <Image src={m.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                              {m.user?.username?.[0]?.toUpperCase() || "A"}
                            </div>
                          )}
                          <span className="text-[11px] text-white/60">{m.user?.username || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/40">
                          <span>♥ {m.likesCount}</span>
                          <span>👁 {m.viewsCount}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Show more */}
            {remaining > 0 && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl neon-rgb-border text-sm font-semibold bg-white/5 text-[var(--color-mute)] hover:bg-white/10 hover:text-white disabled:opacity-40 transition-all"
                >
                  {loadingMore ? "Loading..." : `Show more (${Math.min(PAGE_SIZE, remaining)} more of ${remaining})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}