"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Loader from "@/components/Loader";
import type { FeedItem, FeedMode } from "@/lib/feed";

const TYPE_META: Record<FeedItem["type"], { label: string; color: string; accent: string; emoji: string }> = {
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

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function MetricChip({ icon, value }: { icon: string; value: number | null | undefined }) {
  if (value == null || value <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--color-mute)]">
      <span aria-hidden>{icon}</span>
      {formatCount(value)}
    </span>
  );
}

function FeedItemCard({ item, index }: { item: FeedItem; index: number }) {
  const meta = TYPE_META[item.type];
  const isVertical = item.type === "REEL" || item.type === "CLIP";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index % 8, 5) * 0.06, ease: CARD_EASE }}
      className="neon-premium group mb-4 break-inside-avoid rounded-[20px]"
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" />
      <div className="neon-premium-content rounded-[20px]">
        <Link href={item.href} className="block no-underline">
          <div className="p-5">
            {(item.image || item.video) && (
              <div className={`relative mb-4 w-full overflow-hidden rounded-xl bg-black/30 ${isVertical ? "aspect-[9/14]" : "aspect-video"}`}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  // Fallback for reels without a thumbnail: metadata-only video.
                  <video
                    src={item.video ?? undefined}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                {isVertical && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
                <span
                  className="absolute left-2.5 top-2.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md"
                  style={{ color: meta.color, borderColor: `${meta.accent}55`, background: `${meta.accent}1f` }}
                >
                  {meta.emoji} {meta.label}
                </span>
              </div>
            )}

            {item.type === "MOMENT" ? (
              <blockquote className="space-y-2">
                <p className="font-display text-lg font-bold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-cyan)]">
                  “{item.title}”
                </p>
                {item.body && <p className="text-xs font-semibold text-[var(--color-violet)]">— {item.body}</p>}
              </blockquote>
            ) : (
              <>
                <p className="line-clamp-2 text-sm font-bold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-cyan)]">
                  {item.title}
                </p>
                {item.body && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-mute)]">{item.body}</p>
                )}
              </>
            )}

            {/* Footer: author + time + engagement */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-3">
              {item.author?.avatar ? (
                <Image src={item.author.avatar} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-line)] font-mono text-[10px] font-bold uppercase text-[var(--color-mute)]">
                  {(item.author?.username?.[0] || "Z").charAt(0)}
                </span>
              )}
              <span className="text-xs font-bold text-[var(--color-cyan)]">
                {item.author ? item.author.username : "ZyniVerse"}
              </span>
              <span className="text-[10px] text-[var(--color-mute)]">· {timeAgo(item.createdAt)}</span>
              <span className="ml-auto flex items-center gap-3">
                <MetricChip icon="❤️" value={item.likes} />
                <MetricChip icon="👁" value={item.views} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}

export default function FeedClient({ initialItems }: { initialItems: FeedItem[] }) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [mode, setMode] = useState<FeedMode>("foryou");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 20);

  const cursorRef = useRef<number | null>(initialItems.length >= 20 ? initialItems.length : null);
  const loadingRef = useRef(false);
  const itemsRef = useRef<FeedItem[]>(items);
  const modeRef = useRef<FeedMode>(mode);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const load = useCallback(async (m: FeedMode, after: number | null, replace: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({ mode: m, limit: "20", after: String(after ?? 0) });
      const res = await fetch(`/api/feed?${params.toString()}`);
      if (!res.ok) throw new Error("feed request failed");
      const data = (await res.json()) as { items: FeedItem[]; nextCursor: number | null };
      setItems((prev) => {
        if (replace) return data.items;
        const seen = new Set(prev.map((i) => i.id));
        const fresh = data.items.filter((i) => !seen.has(i.id));
        if (fresh.length === 0) {
          // Every row in this window was already on screen — nothing left to load.
          setHasMore(false);
          return prev;
        }
        return [...prev, ...fresh];
      });
      cursorRef.current = data.nextCursor;
      setHasMore(Boolean(data.nextCursor));
    } catch {
      if (replace) setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const switchMode = useCallback(
    (m: FeedMode) => {
      if (m === modeRef.current) return;
      setMode(m);
      setItems([]);
      setHasMore(true);
      cursorRef.current = null;
      void load(m, null, true);
    },
    [load],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          void load(modeRef.current, cursorRef.current, false);
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [load, hasMore]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="neon-rgb-border glass-panel sticky top-16 z-30 p-3 sm:top-20">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "foryou", label: "For You", emoji: "✨" },
              { key: "following", label: "Following", emoji: "🤝" },
            ] as { key: FeedMode; label: string; emoji: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchMode(tab.key)}
              className={`flex-1 rounded-xl border px-4 py-2.5 font-display text-xs font-bold uppercase tracking-widest transition-all ${
                mode === tab.key
                  ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_16px_rgba(0,255,224,0.2)]"
                  : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
              }`}
            >
              <span className="mr-1.5">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1.5 pr-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)] sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-magenta)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />
            </span>
            Ranked feed
          </span>
        </div>
      </div>

      {/* Feed grid */}
      {items.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: CARD_EASE }}
          className="glass-panel flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-3xl border-2 border-dashed border-[var(--color-violet)]/40" />
            <span className="text-5xl">{mode === "following" ? "🤝" : "✨"}</span>
          </div>
          <p className="font-display text-xl font-bold text-white">
            {mode === "following" ? "Koi follow kar na?" : "Feed abhi khaali hai"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
            {mode === "following"
              ? "Apne favourite creators ko follow karo — unki posts, memes, reels aur moments sab yahaan dikhenge."
              : "Abhi kuch nahi hai — thodi der baad wapas aa, ya discover explore kar."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {mode === "following" && (
              <>
                <Link
                  href="/login"
                  className="neon-banner-btn rounded-xl px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl border border-[var(--color-line)] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                >
                  Join free
                </Link>
              </>
            )}
            <Link
              href="/discover"
              className="rounded-xl border border-[var(--color-line)] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
            >
              Explore discover →
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <FeedItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-2" />
      {loading && (
        <div className="py-8">
          <Loader />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center font-mono text-xs text-[var(--color-mute)]">
          — Yehi tha sab kuch 🎌 —
        </p>
      )}
    </div>
  );
}