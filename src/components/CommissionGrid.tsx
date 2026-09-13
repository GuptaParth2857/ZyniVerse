"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommissionCard from "./CommissionCard";
import InfiniteScroll from "./InfiniteScroll";

interface CommissionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: string | null;
  portfolio: string;
  requestCount: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const CATEGORIES = [
  { value: "all", label: "All", icon: "🌐" },
  { value: "fanart", label: "Fan Art", icon: "🎨" },
  { value: "cosplay", label: "Cosplay", icon: "📸" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "editing", label: "Editing", icon: "✂️" },
  { value: "other", label: "Other", icon: "✨" },
];

const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
];

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="aspect-[4/3] bg-white/[0.04]" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-2/3 rounded-full bg-white/[0.06]" />
        <div className="h-2.5 w-full rounded-full bg-white/[0.05]" />
        <div className="h-2.5 w-4/5 rounded-full bg-white/[0.05]" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-20 rounded-md bg-white/[0.06]" />
          <div className="h-5 w-14 rounded-md bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

export default function CommissionGrid() {
  const [items, setItems] = useState<CommissionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ category: "all", sort: "recent", search: "" });
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (filters.category !== "all") params.set("category", filters.category);
    params.set("sort", filters.sort);
    if (filters.search) params.set("search", filters.search);
    params.set("page", String(page));

    fetch(`/api/commissions?${params}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load commissions");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setTotal(data.total ?? 0);
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setHasNextPage(data.hasNextPage);
      })
      .catch(() => {
        if (!cancelled && page === 1) setError("Failed to load commissions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  const setFilter = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const loadMore = () => setPage((p) => p + 1);

  const showSkeletons = loading && items.length === 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="flex flex-wrap gap-1.5"
        >
          {CATEGORIES.map((c) => {
            const active = filters.category === c.value;
            return (
              <motion.button
                key={c.value}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                onClick={() => setFilter({ category: c.value })}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "text-white" : "bg-white/5 text-white/40 hover:text-white/60"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="comm-cat-pill"
                    className="absolute inset-0 rounded-lg border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/15"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">{c.icon} {c.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter({ sort: s.value })}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  filters.sort === s.value ? "bg-[var(--color-panel)] text-white shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={filters.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Search..."
              className="w-40 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--color-cyan)] transition-colors sm:w-44"
            />
          </div>
        </div>
      </div>

      {!showSkeletons && (items.length > 0 || total > 0) && (
        <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-mute)]">
          {total} listing{total !== 1 ? "s" : ""}
          {filters.category !== "all" && ` • ${CATEGORIES.find((c) => c.value === filters.category)?.label}`}
          {filters.search && ` • matching &ldquo;${filters.search}&rdquo;`}
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showSkeletons ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: CARD_EASE }}
          className="neon-rgb-ring relative overflow-hidden rounded-2xl p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
          <div className="relative z-10">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="mb-3 block text-4xl"
            >
              🖌️
            </motion.span>
            <p className="font-display text-lg font-bold">No commissions found</p>
            <p className="mt-1 text-xs text-[var(--color-mute)]">
              Try adjusting your filters or check back later
            </p>
            <button
              onClick={() => setFilter({ category: "all", sort: "recent", search: "" })}
              className="mt-5 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20"
            >
              Reset filters
            </button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={filters.search + filters.category + filters.sort}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((item) => (
              <div key={item.id}>
                <CommissionCard item={item} index={0} />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <InfiniteScroll hasMore={hasNextPage} loading={loading} onLoadMore={loadMore} />
    </div>
  );
}