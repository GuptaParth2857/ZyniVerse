"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsItem } from "@/lib/news";
const FILTERS = [
  { key: "all", label: "All" },
  { key: "trending", label: "Trending" },
  { key: "airing", label: "Airing" },
  { key: "seasonal", label: "Seasonal" },
  { key: "activity", label: "Community" },
] as const;

const SOURCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  AniList: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  Community: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  Seasonal: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
};

const TYPE_STYLES: Record<string, string> = {
  announcement: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  airing: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  trending: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  seasonal: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  community: "bg-green-500/15 text-green-400 border-green-500/30",
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
    <div className="neon-premium rounded-xl">
      <div className="neon-premium-track rounded-xl" />
      <div className="neon-premium-overlay rounded-[10.5px]" />
      <div className="neon-premium-content animate-pulse">
        <div className="h-28 w-full rounded-t-xl bg-white/5" />
        <div className="p-3 space-y-2">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
          <div className="flex gap-2 pt-1">
            <div className="h-3 w-14 rounded bg-white/5" />
            <div className="h-3 w-10 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const sourceStyle = SOURCE_STYLES[item.source] || SOURCE_STYLES.AniList;
  const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.community;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={item.url} className="neon-premium rounded-xl no-underline group block">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content">
          {item.image ? (
            <div className="relative h-28 w-full overflow-hidden rounded-t-xl">
              <div
                className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                style={{ background: `url(${item.image}) center/cover` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
            </div>
          ) : (
            <div className="h-28 w-full rounded-t-xl bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">{item.source}</span>
            </div>
          )}
          <div className="p-3">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>
                {item.source}
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${typeStyle}`}>
                {item.type}
              </span>
            </div>
            <h3 className="font-display font-bold text-xs group-hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
              {item.title}
            </h3>
            <p className="text-[10px] text-[var(--color-mute)] mt-1 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <TimeAgo date={item.publishedAt} />
              {item.tags.length > 0 && (
                <span className="text-[8px] font-mono text-[var(--color-mute)] bg-[var(--color-void)] px-1.5 py-0.5 rounded border border-[var(--color-line)]">
                  {item.tags[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function NewsFeed({ defaultType = "all" }: { defaultType?: string }) {
  const [type, setType] = useState(defaultType);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNews = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/news?type=${t}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const d = await res.json();
      setNews(d.news || []);
    } catch (e) {
      setError("Failed to load news");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(type);
  }, [type, fetchNews]);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setType(f.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              type === f.key
                ? "text-black shadow-lg"
                : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
            }`}
            style={type === f.key ? { backgroundColor: "var(--color-cyan)" } : {}}
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
            <div className="neon-premium rounded-xl text-center">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content py-20 px-6">
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
                <NewsCard key={item.id} item={item} />
              ))}
            </motion.div>
          ) : (
            <div className="neon-premium rounded-xl text-center">
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content py-20 px-6">
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
