"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportButton } from "@/components/ReportButton";

interface ClipItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  videoUrl: string | null;
  mediaTitle: string | null;
  mediaId: number | null;
  timestamp: string | null;
  tags: string;
  likes: number;
  views: number;
  likedByMe?: boolean;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

export default function ClipGallery() {
  const { data: session } = useSession();
  const [clips, setClips] = useState<ClipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [selectedClip, setSelectedClip] = useState<ClipItem | null>(null);
  const [error, setError] = useState("");

  const mountedRef = useRef(true);
  const pageRef = useRef(1);
  const [fetchKey, setFetchKey] = useState(0);
  const prevRef = useRef({ sort, search });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const prev = prevRef.current;
    if (prev.sort !== sort || prev.search !== search) {
      prevRef.current = { sort, search };
      pageRef.current = 1;
    }
    const currentPage = pageRef.current;
    async function load() {
      setLoading(true);
      if (currentPage === 1) setError("");
      try {
        const params = new URLSearchParams({ sort, page: String(currentPage), perPage: "20" });
        if (search.trim()) params.set("search", search.trim());
        const res = await fetch(`/api/clips?${params}`);
        if (!res.ok && !cancelled && mountedRef.current) {
          setError("Failed to load clips");
          setLoading(false);
          setLoadingMore(false);
          return;
        }
        const data = await res.json();
        if (!cancelled && mountedRef.current) {
          const newItems = data.clips || [];
          setClips((prev) => (currentPage === 1 ? newItems : [...prev, ...newItems]));
          setLikedIds((prev) => {
            const next = new Set(prev);
            for (const c of newItems) {
              if (c.likedByMe) next.add(c.id);
            }
            return next;
          });
          setHasNextPage(data.hasNextPage || false);
          setLoading(false);
          setLoadingMore(false);
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          setClips([]);
          setError("Failed to load clips");
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [sort, search, fetchKey]);

  async function loadMore() {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    pageRef.current += 1;
    setFetchKey((k) => k + 1);
  }

  async function handleLike(clipId: string) {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/clips/${clipId}/like`, { method: "POST" });
    const data = await res.json();
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, likes: data.likes } : c)));
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (data.liked) next.add(clipId);
      else next.delete(clipId);
      return next;
    });
  }

  const SORT_OPTIONS = [
    { value: "recent", label: "Recent", icon: "🕐" },
    { value: "popular", label: "Popular", icon: "🔥" },
  ];

  function youtubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
  }

  return (
    <>
      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="rgb-border rgb-border-always mb-8">
        <div className="glass-panel p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 rgb-border">
              <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm overflow-hidden transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3 shrink-0 text-[var(--color-mute)]">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clips..."
                  className="w-full bg-transparent py-3 pl-3 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-[var(--color-line)] bg-[var(--color-void)]/50 p-0.5">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setSort(opt.value)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      sort === opt.value ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] shadow-[0_0_12px_rgba(255,45,120,0.15)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}>
                    <span>{opt.icon}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
              <Link href={session?.user?.id ? "/clips/upload" : "/login"}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-magenta)]/20 to-[var(--color-violet)]/20 border border-[var(--color-magenta)]/30 px-4 py-2.5 text-sm font-semibold text-[var(--color-magenta)] hover:from-[var(--color-magenta)]/30 hover:to-[var(--color-violet)]/30 hover:shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all whitespace-nowrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="hidden sm:inline">{session?.user?.id ? "Upload" : "Sign in to Upload"}</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Gallery */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
                <div className="aspect-video shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-[var(--color-void)] rounded shimmer" />
                  <div className="h-3 w-1/2 bg-[var(--color-void)] rounded shimmer" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : clips.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-violet)]/20 border border-[var(--color-magenta)]/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-magenta)]">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2">No Clips Yet</h3>
            <p className="text-sm text-[var(--color-mute)] max-w-sm mx-auto mb-6">Be the first to share an amazing scene clip!</p>
            {session?.user?.id ? (
              <Link href="/clips/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,45,120,0.3)] hover:shadow-[0_0_40px_rgba(255,45,120,0.5)] transition-all">
                Upload First Clip
              </Link>
            ) : (
              <Link href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all">
                Login to Upload
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {clips.map((clip, i) => (
                <motion.div key={clip.id} initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.045, 0.35), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedClip(clip)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl meme-card-border bg-[#15121d]/85 backdrop-blur-xl">
                  <div className="meme-hairline pointer-events-none absolute inset-x-4 top-0 z-30 h-px" />
                  <div className="relative aspect-video overflow-hidden meme-aurora">
                    <Image src={clip.imageUrl} alt={clip.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="award-sheen" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />
                    {clip.timestamp && (
                      <span className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        {clip.timestamp}
                      </span>
                    )}
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--color-cyan)]/80 group-hover:bg-[var(--color-cyan)]/20 group-hover:shadow-[0_0_35px_rgba(0,255,224,0.4)] sm:h-14 sm:w-14">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-white transition-colors group-hover:text-[var(--color-cyan)]"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 p-3 sm:p-3.5">
                    <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.3em] text-[var(--color-cyan)]/70">✦ Scene Edit</p>
                    <p className="mt-1 truncate text-[13px] font-extrabold leading-snug text-[var(--color-ink)] transition-all sm:text-sm group-hover:bg-gradient-to-r group-hover:from-[var(--color-cyan)] group-hover:via-[var(--color-magenta)] group-hover:to-[var(--color-violet)] group-hover:bg-clip-text group-hover:text-transparent">
                      {clip.title}
                    </p>
                    {clip.mediaTitle && <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--color-mute)]">✦ {clip.mediaTitle}</p>}
                    {clip.tags && (
                      <p className="mt-1.5 truncate text-[10px]">
                        {clip.tags.split(",").slice(0, 2).map((t) => (
                          <span key={t} className="mr-1.5 text-[var(--color-cyan)]/80">#{t.trim()}</span>
                        ))}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 border-t border-white/5 pt-2">
                      <button onClick={(e) => { e.stopPropagation(); handleLike(clip.id); }}
                        className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${likedIds.has(clip.id) ? "text-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"}`}>
                        <motion.svg key={likedIds.has(clip.id) ? "cl-enabled" : "cl-disabled"} initial={{ scale: likedIds.has(clip.id) ? 1.5 : 1 }} animate={{ scale: 1 }}
                          width="13" height="13" viewBox="0 0 24 24" fill={likedIds.has(clip.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </motion.svg>
                        {clip.likes.toLocaleString()}
                      </button>
                      <span className="flex items-center gap-1 text-[11px] text-[var(--color-mute)]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        {clip.views.toLocaleString()}
                      </span>
                      <span className="ml-auto flex items-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[8px] font-black text-white shadow-[0_0_12px_rgba(255,45,120,0.5)] ring-2 ring-white/10">
                          {clip.user.username?.[0]?.toUpperCase() ?? "O"}
                        </span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button onClick={loadMore} disabled={loadingMore}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-3 text-sm font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/30 transition-all disabled:opacity-50">
                  {loadingMore ? (
                    <><div className="h-4 w-4 rounded-full border-2 border-[var(--color-cyan)]/30 border-t-[var(--color-cyan)] animate-spin" />Loading...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>Load More</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedClip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setSelectedClip(null)}>
            <motion.div initial={{ scale: 0.92, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl meme-card-border bg-[#15121d]/95 backdrop-blur-xl">
              <div className="meme-hairline pointer-events-none absolute inset-x-8 top-0 z-50 h-px" />
              <button onClick={() => setSelectedClip(null)}
                className="absolute top-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:rotate-90 hover:border-[var(--color-magenta)]/70 hover:bg-[var(--color-magenta)]/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <div className="relative aspect-video bg-black">
                <div className="pointer-events-none absolute inset-x-0 z-40 flex justify-center mix-blend-screen opacity-60">
                  <div className="h-48 w-2/3 bg-gradient-to-b from-[var(--color-magenta)]/25 to-transparent blur-2xl" />
                </div>
                {(() => {
                  const vid = selectedClip.videoUrl;
                  const yt = vid ? youtubeId(vid) : null;
                  if (yt) {
                    return (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
                        title={selectedClip.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    );
                  }
                  if (vid) {
                    return (
                      <video src={vid} controls autoPlay playsInline className="h-full w-full object-contain" />
                    );
                  }
                  return (
                    <Image src={selectedClip.imageUrl} alt={selectedClip.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  );
                })()}
              </div>
              <div className="p-5 sm:p-6">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.35em] text-[var(--color-cyan)]/70">✦ Premium Scene Edit</p>
                <h2 className="mt-1 font-display text-lg font-extrabold text-[var(--color-ink)] sm:text-xl">{selectedClip.title}</h2>
                {selectedClip.mediaTitle && <p className="mt-1 text-sm text-[var(--color-mute)]">✦ {selectedClip.mediaTitle}</p>}
                {selectedClip.description && <p className="mt-3 text-sm text-[var(--color-mute)]">{selectedClip.description}</p>}
                {selectedClip.tags && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedClip.tags.split(",").filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-cyan)]">#{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4">
                  <button onClick={() => handleLike(selectedClip.id)}
                    className={`group/like flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-all ${likedIds.has(selectedClip.id) ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] shadow-[0_0_25px_rgba(255,45,120,0.35)]" : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-magenta)]"}`}>
                    <motion.svg key={`mod-${likedIds.has(selectedClip.id)}`} initial={{ scale: 1.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 12 }}
                      width="16" height="16" viewBox="0 0 24 24" fill={likedIds.has(selectedClip.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </motion.svg>
                    {selectedClip.likes.toLocaleString()}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-[var(--color-mute)]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    {selectedClip.views.toLocaleString()}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[10px] font-black text-white shadow-[0_0_16px_rgba(255,45,120,0.5)] ring-2 ring-white/10">
                      {selectedClip.user.username?.[0]?.toUpperCase() ?? "O"}
                    </span>
                    <span className="text-xs text-[var(--color-mute)]">{selectedClip.user.username}</span>
                    <ReportButton contentType="CLIP" contentId={selectedClip.id} authorId={selectedClip.user.id} label="" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
