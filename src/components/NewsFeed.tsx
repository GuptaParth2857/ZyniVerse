"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsItem } from "@/lib/news";
import EmptyState from "@/components/EmptyState";

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
    <div className="animate-pulse rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden flex">
      <div className="w-24 sm:w-32 shrink-0 bg-white/5" />
      <div className="flex-1 p-4 space-y-2">
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded-full bg-white/10" />
          <div className="h-4 w-12 rounded-full bg-white/10" />
        </div>
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
        <div className="flex gap-2 pt-1">
          <div className="h-3 w-14 rounded bg-white/5" />
          <div className="h-3 w-10 rounded bg-white/5" />
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
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)]/20 transition-all flex"
    >
      {item.image && (
        <Link href={item.url} className="w-24 sm:w-32 shrink-0 relative overflow-hidden">
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            sizes="128px"
          />
        </Link>
      )}
      {!item.image && (
        <div className="w-24 sm:w-32 shrink-0 bg-[var(--color-void)] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-mute)]">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
            <line x1="17" y1="17" x2="22" y2="17" />
          </svg>
        </div>
      )}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>
            {item.source}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeStyle}`}>
            {item.type}
          </span>
          <TimeAgo date={item.publishedAt} />
        </div>
        <Link href={item.url}>
          <h3 className="font-display text-sm font-bold leading-snug hover:text-[var(--color-cyan)] transition-colors line-clamp-2">
            {item.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-[var(--color-mute)] leading-relaxed line-clamp-2">{item.summary}</p>
        {item.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {item.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-mono text-[var(--color-mute)] bg-[var(--color-void)] px-1.5 py-0.5 rounded border border-[var(--color-line)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function NewsFeed({ defaultType = "all" }: { defaultType?: string }) {
  const [type, setType] = useState(defaultType);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?type=${t}`);
      const d = await res.json();
      setNews(d.news || []);
    } catch {
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
      {/* Filters */}
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

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <AnimatePresence mode="wait">
          {news.length > 0 ? (
            <motion.div
              key={type}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon="chat"
              title="No news yet."
              description="Check back later for the latest updates."
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
