"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsItem } from "@/lib/news";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "trending", label: "Trending" },
  { key: "airing", label: "Airing" },
  { key: "seasonal", label: "Seasonal" },
  { key: "activity", label: "Community" },
  { key: "news", label: "News" },
] as const;

const SOURCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Trending: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  Community: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  Seasonal: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  News: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
};

const TYPE_STYLES: Record<string, string> = {
  announcement: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  airing: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  trending: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  seasonal: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  community: "bg-green-500/15 text-green-400 border-green-500/30",
  rss: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

function TimeAgo({ date }: { date: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function compute() {
      const diff = Date.now() - new Date(date).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) { setLabel("just now"); return; }
      if (mins < 60) { setLabel(`${mins}m ago`); return; }
      const hours = Math.floor(mins / 60);
      if (hours < 24) { setLabel(`${hours}h ago`); return; }
      const days = Math.floor(hours / 24);
      if (days < 7) { setLabel(`${days}d ago`); return; }
      const weeks = Math.floor(days / 7);
      if (weeks < 4) { setLabel(`${weeks}w ago`); return; }
      setLabel(new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    }
    compute();
    const timer = setInterval(compute, 60000);
    return () => clearInterval(timer);
  }, [date]);

  return <span className="text-[10px] font-mono text-[var(--color-mute)]">{label}</span>;
}

function NewsCardSkeleton() {
  return (
    <div className="rounded-xl neon-border-card animate-pulse" style={{ ["--i" as string]: 0 }}>
      <div className="h-48 w-full rounded-t-xl bg-white/5" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 w-3/4 rounded bg-white/10" />
        <div className="h-3.5 w-full rounded bg-white/5" />
        <div className="h-3.5 w-1/2 rounded bg-white/5" />
        <div className="flex gap-2 pt-1">
          <div className="h-3 w-16 rounded bg-white/5" />
          <div className="h-3 w-12 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const sourceStyle = SOURCE_STYLES[item.source] || SOURCE_STYLES.Trending;
  const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.community;
  const href = item.type === "rss" ? `/news/${item.id}` : item.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={href} className="rounded-xl neon-border-card no-underline group block overflow-hidden bg-[var(--color-panel)]">
        {item.image ? (
          <div className="relative h-48 w-full overflow-hidden">
            <div
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
              style={{ background: `url(${item.image}) center/cover` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider">{item.source}</span>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>
              {item.source}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeStyle}`}>
              {item.type}
            </span>
          </div>
          <h3 className="font-display font-bold text-sm group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-[var(--color-mute)] mt-1.5 line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <TimeAgo date={item.publishedAt} />
            {item.tags.length > 0 && (
              <span className="text-[10px] font-mono text-[var(--color-mute)] bg-[var(--color-void)] px-1.5 py-0.5 rounded border border-[var(--color-line)]">
                {item.tags[0]}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function NewsFeed({ defaultType = "all" }: { defaultType?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState(() => searchParams.get("type") || defaultType);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const switchType = useCallback((newType: string) => {
    setType(newType);
    const params = new URLSearchParams(window.location.search);
    params.set("type", newType);
    router.replace(`/news?${params.toString()}`, { scroll: false });
  }, [router]);

  const fetchNews = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/news?type=${t}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const d = await res.json();
      setNews(d.news || []);
    } catch {
      setError("Failed to load news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNews(type);
  }, [type, fetchNews]);

  return (
    <div>
      <style>{`
        @keyframes newsNeonBorder {
          0%   { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
          20%  { border-color: #00ffff; box-shadow: 0 0 8px #00ffff55, inset 0 0 8px #00ffff11; }
          40%  { border-color: #ff3366; box-shadow: 0 0 8px #ff336655, inset 0 0 8px #ff336611; }
          60%  { border-color: #ffff00; box-shadow: 0 0 8px #ffff0055, inset 0 0 8px #ffff0011; }
          80%  { border-color: #ff0066; box-shadow: 0 0 8px #ff006655, inset 0 0 8px #ff006611; }
          100% { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
        }
        .neon-border-card {
          animation: newsNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
        @keyframes newsNeonBorderHover {
          0%   { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
          20%  { border-color: #00ffff; box-shadow: 0 0 14px #00ffff, 0 0 28px #00ffff88; }
          40%  { border-color: #ff3366; box-shadow: 0 0 14px #ff3366, 0 0 28px #ff336688; }
          60%  { border-color: #ffff00; box-shadow: 0 0 14px #ffff00, 0 0 28px #ffff0088; }
          80%  { border-color: #ff0066; box-shadow: 0 0 14px #ff0066, 0 0 28px #ff006688; }
          100% { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
        }
        .neon-border-card:hover {
          animation: newsNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.03);
        }
        .neon-filter {
          animation: newsNeonBorder 4s linear infinite;
          animation-delay: calc(var(--fd, 0) * -1s);
          border-width: 1px;
          border-style: solid;
        }
        .neon-filter:hover {
          animation: newsNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.05);
        }
      `}</style>
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f, i) => (
          <button
            key={f.key}
            onClick={() => switchType(f.key)}
            style={{ ["--fd" as string]: i }}
            className={`neon-filter rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              type === f.key
                ? "bg-[var(--color-magenta)] text-black shadow-[0_0_12px_var(--color-magenta),0_0_24px_var(--color-magenta)]"
                : "bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="wait">
          {error ? (
            <div className="rounded-xl neon-border-card text-center bg-[var(--color-panel)]">
              <div className="py-20 px-6">
                <p className="text-[var(--color-mute)]">{error}</p>
              </div>
            </div>
          ) : news.length > 0 ? (
            <motion.div
              key={type}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {news.map((item, i) => (
                <div key={item.id} style={{ ["--i" as string]: i }}>
                  <NewsCard item={item} />
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-xl neon-border-card text-center bg-[var(--color-panel)]">
              <div className="py-20 px-6">
                <div className="text-4xl mb-3">📰</div>
                <p className="text-[var(--color-mute)] mb-1 font-display font-bold">No news yet</p>
                <p className="text-xs text-[var(--color-mute)]">Check back later for the latest updates.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
