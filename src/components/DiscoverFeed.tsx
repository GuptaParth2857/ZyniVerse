"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Loader from "@/components/Loader";
import type { FeedCard } from "@/lib/feed";

const TYPE_META: Record<FeedCard["type"], { label: string; color: string; accent: string; emoji: string }> = {
  POST: { label: "Post", color: "text-blue-400", accent: "#60a5fa", emoji: "💬" },
  MOMENT: { label: "Moment", color: "text-violet-400", accent: "#a78bfa", emoji: "💬" },
  REEL: { label: "Reel", color: "text-pink-400", accent: "#f472b6", emoji: "🎬" },
  MEME: { label: "Meme", color: "text-amber-400", accent: "#facc15", emoji: "😂" },
  CLIP: { label: "Clip", color: "text-orange-400", accent: "#fb923c", emoji: "🎞️" },
  FANART: { label: "Fan Art", color: "text-cyan-400", accent: "#22d3ee", emoji: "🎨" },
  COSPLAY: { label: "Cosplay", color: "text-emerald-400", accent: "#34d399", emoji: "📸" },
  WALLPAPER: { label: "Wallpaper", color: "text-teal-300", accent: "#5eead4", emoji: "🖼️" },
  BLOG: { label: "Blog", color: "text-blue-400", accent: "#60a5fa", emoji: "✍️" },
  NEWS: { label: "News", color: "text-red-400", accent: "#f87171", emoji: "📰" },
};

const TYPE_OPTIONS: { key: FeedCard["type"] | "ALL"; label: string; emoji: string }[] = [
  { key: "ALL", label: "All", emoji: "✨" },
  { key: "NEWS", label: "News", emoji: "📰" },
  { key: "POST", label: "Posts", emoji: "💬" },
  { key: "MEME", label: "Memes", emoji: "😂" },
  { key: "REEL", label: "Reels", emoji: "🎬" },
  { key: "CLIP", label: "Clips", emoji: "🎞️" },
  { key: "MOMENT", label: "Moments", emoji: "💬" },
  { key: "FANART", label: "Fan Art", emoji: "🎨" },
  { key: "COSPLAY", label: "Cosplay", emoji: "📸" },
  { key: "WALLPAPER", label: "Wallpapers", emoji: "🖼️" },
  { key: "BLOG", label: "Blogs", emoji: "✍️" },
];

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function FeedCardItem({ card, index }: { card: FeedCard; index: number }) {
  const meta = TYPE_META[card.type];
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 9) * 0.07, ease: CARD_EASE }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group mb-4 break-inside-avoid"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium rounded-[20px]">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" />
        <div className="neon-premium-content rounded-[20px]">
          <Link href={card.href} className="block no-underline">
            <div className="p-5">
              {/* Media */}
              {(card.image || card.video) && (
                <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-black/30">
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <video
                      src={card.video ?? undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  {card.video && (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)] backdrop-blur-md">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Reel
                    </span>
                  )}
                </div>
              )}

              {/* Top badges row (voice-lines style) */}
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full" style={{ background: meta.accent, boxShadow: `0 0 10px ${meta.accent}88` }} />
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: meta.color, borderColor: `${meta.accent}55`, background: `${meta.accent}1a` }}
                >
                  {meta.emoji} {meta.label}
                </span>
                <span className="ml-auto rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--color-mute)]">
                  {timeAgo(card.createdAt)} ago
                </span>
              </div>

              <p className="line-clamp-2 text-sm font-bold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-cyan)]">
                {card.title}
              </p>
              {card.body && (
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-mute)]">{card.body}</p>
              )}

              {/* Footer (voice-lines style) */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-3">
                {card.author?.avatar ? (
                  <Image src={card.author.avatar} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-line)] font-mono text-[10px] font-bold uppercase text-[var(--color-mute)]">
                    {(card.author?.username?.[0] || "Z").charAt(0)}
                  </span>
                )}
                <span className="text-xs font-bold text-[var(--color-cyan)]">
                  {card.author ? card.author.username : "ZyniVerse"}
                </span>
                {card.author && (
                  <span className="text-[10px] text-[var(--color-mute)]">· user of ZyniVerse</span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DiscoverFeed() {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [filter, setFilter] = useState<FeedCard["type"] | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [newPosts, setNewPosts] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);
  const cardsRef = useRef<FeedCard[]>([]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  function load(p: number, replace: boolean) {
    setLoading(true);
    fetch(`/api/feed?page=${p}&perPage=12`)
      .then((r) => r.json())
      .then((d: { items: FeedCard[]; hasNextPage: boolean }) => {
        setCards((prev) => (replace ? d.items : [...prev, ...d.items]));
        setHasNext(d.hasNextPage);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setInitialLoading(false);
      });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialLoading(true);
    setCards([]);
    setPage(1);
    load(1, true);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasNext) {
        const next = pageRef.current + 1;
        setPage(next);
        load(next, false);
      }
    }, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasNext]);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    let cancelled = false;
    let toastTimer: ReturnType<typeof setTimeout> | undefined;

    async function pollNewPosts() {
      if (cancelled || document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/feed?page=1&perPage=12");
        const data = (await res.json()) as { items: FeedCard[] };
        const existing = new Set(cardsRef.current.map((c) => c.id));
        const fresh = data.items.filter((c) => !existing.has(c.id));
        if (fresh.length > 0) {
          setCards((prev) => [...fresh, ...prev]);
          setNewPosts(fresh.length);
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => setNewPosts(0), 6000);
        }
      } catch {
        /* keep the feed as-is on network errors */
      }
    }

    const interval = setInterval(pollNewPosts, 120000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (toastTimer) clearTimeout(toastTimer);
    };
  }, []);

  const total = cards.length;

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      if (filter !== "ALL" && c.type !== filter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        (c.body || "").toLowerCase().includes(q) ||
        (c.author?.username || "").toLowerCase().includes(q) ||
        TYPE_META[c.type].label.toLowerCase().includes(q)
      );
    });
  }, [cards, filter, search]);

  const isFiltered = filter !== "ALL" || search.trim() !== "";

  function handleReset() {
    setFilter("ALL");
    setSearch("");
  }

  return (
    <div className="space-y-8">
      {/* ─────────── LIVE FEED BADGE ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: CARD_EASE }}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-magenta)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />
            </span>
            Live Feed
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-magenta)]/40 to-transparent" />
        </div>
      </motion.div>

      {/* ─────────── FILTERS ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: CARD_EASE }}
        className="neon-rgb-border glass-panel sticky top-20 z-30 p-3 lg:top-16"
      >
        {/* Filter panel header */}
        <div className="mb-2 flex items-center gap-2 px-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-magenta)]">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-mute)]">
            Filter the feed
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-magenta)]/40 via-[var(--color-cyan)]/40 to-transparent" />
          {isFiltered && (
            <button
              onClick={handleReset}
              className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-cyan)] transition-colors hover:text-[var(--color-magenta)] hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div
            className={`neon-rgb-border flex min-w-[200px] flex-1 items-center gap-2 rounded-xl px-3 transition-colors ${
              search ? "bg-[var(--color-cyan)]/5" : "bg-[var(--color-void)]/40"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-mute)]">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the feed..."
              className="w-full bg-transparent py-3 pr-2 text-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="shrink-0 text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/40 px-4">
            <span className="font-mono text-xs text-[var(--color-mute)]">
              <span className="font-bold text-[var(--color-cyan)]">{shown.length}</span> / {total} posts
            </span>
          </div>
        </div>

        {/* Type pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setFilter(o.key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === o.key
                  ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.2)]"
                  : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]"
              }`}
            >
              <span className="mr-1">{o.emoji}</span>
              {o.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active filter chips */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2">
          {filter !== "ALL" && (
            <button onClick={() => setFilter("ALL")} className="glass-tag text-[var(--color-ink)]">
              {TYPE_OPTIONS.find((o) => o.key === filter)?.emoji} {TYPE_OPTIONS.find((o) => o.key === filter)?.label}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          {search && (
            <button onClick={() => setSearch("")} className="glass-tag text-[var(--color-ink)]">
              🔍 {search}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          <button onClick={handleReset} className="text-[11px] font-medium text-[var(--color-cyan)] hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* ─────────── CONTENT ─────────── */}
      {initialLoading ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-panel)]">
              <div className="shimmer aspect-video w-full" />
              <div className="p-4">
                <div className="mb-2 h-1.5 w-8 rounded-full bg-[var(--color-line)]" />
                <div className="space-y-2">
                  <div className="shimmer h-3.5 w-full rounded" />
                  <div className="shimmer h-3.5 w-4/5 rounded" />
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
                  <div className="shimmer h-5 w-5 rounded-full" />
                  <div className="shimmer h-3 w-24 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: CARD_EASE }}
          className="glass-panel flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-3xl border-2 border-dashed border-[var(--color-violet)]/40" />
            <span className="text-5xl">🌐</span>
          </div>
          <p className="font-display text-xl font-bold text-white">Nothing here yet</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
            {isFiltered
              ? "Try adjusting your search or filters — feed ishn category me kuch nahi mila."
              : "The feed is empty. Check back soon for fresh anime content!"}
          </p>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="neon-banner-btn mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: CARD_EASE }}
        >
          <div className="mb-4 flex items-center gap-3">
            <p className="text-sm text-[var(--color-mute)]">
              Showing <span className="font-semibold text-[var(--color-cyan)]">{shown.length}</span> of{" "}
              <span className="font-semibold text-[var(--color-cyan)]">{total}</span> posts
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>

          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {shown.map((card, i) => (
              <FeedCardItem key={card.id} card={card} index={i} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-2" />
          {loading && (
            <div className="py-8">
              <Loader />
            </div>
          )}
          {!hasNext && shown.length > 0 && (
            <p className="py-6 text-center font-mono text-xs text-[var(--color-mute)]">
              — You reached the end 🎌 —
            </p>
          )}
        </motion.div>
      )}

      {/* ─────────── NEW POSTS TOAST ─────────── */}
      {newPosts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: CARD_EASE }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="neon-banner-btn flex items-center gap-2 rounded-full px-5 py-3 text-xs font-bold text-[var(--color-void)] shadow-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-void)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-void)]" />
            </span>
            +{newPosts} new post{newPosts > 1 ? "s" : ""} ✨
          </button>
        </motion.div>
      )}
    </div>
  );
}