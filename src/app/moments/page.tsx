"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20", sort });
    if (search.trim()) params.set("search", search.trim());

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
  }, [page, sort, search]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-3">
              <h1 className="font-display text-3xl font-bold text-white">Moments</h1>
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
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search quotes, characters, anime..."
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]"
            />
          </div>
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setSort(o.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  sort === o.value
                    ? "bg-[var(--color-violet)] text-white"
                    : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-mute)] text-lg mb-4">No moments yet. Be the first to create one!</p>
            <Link href="/moments/create" className="neon-rgb-border rounded-xl px-6 py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors inline-block">
              ✦ Create Moment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moments.map((m) => (
              <Link key={m.id} href={`/moments/${m.id}`} className="group">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[var(--color-line)] hover:border-[var(--color-cyan)] transition-colors">
                  {m.animeCover ? (
                    <>
                      <Image src={m.animeCover} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[#1a0a2e] to-[var(--color-void)]" />
                  )}

                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
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
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-[var(--color-mute)] hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-sm text-[var(--color-mute)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-[var(--color-mute)] hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
