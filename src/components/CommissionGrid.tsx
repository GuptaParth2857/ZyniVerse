"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function CommissionGrid() {
  const [items, setItems] = useState<CommissionItem[]>([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCommissions = useCallback(async (reset: boolean) => {
    setLoading(true);
    if (reset) setError("");
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      params.set("sort", sort);
      if (search) params.set("search", search);
      params.set("page", String(reset ? 1 : page));

      const res = await fetch(`/api/commissions?${params}`);
      if (!res.ok) {
        if (reset) setError("Failed to load commissions");
        setLoading(false);
        return;
      }
      const data = await res.json();

      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setHasNextPage(data.hasNextPage);
    } catch {
      if (reset) setError("Failed to load commissions");
    }
    setLoading(false);
  }, [category, sort, search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    fetchCommissions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort, search]);

  useEffect(() => {
    if (page > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCommissions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                category === c.value
                  ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] border border-[var(--color-magenta)]/30"
                  : "bg-white/5 text-white/40 border border-white/[0.06] hover:border-white/[0.14]"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
            {SORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  sort === s.value ? "bg-[var(--color-panel)] text-white shadow-sm" : "text-white/40 hover:text-white/60"
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-44 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--color-cyan)] transition-colors"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
          <span className="text-4xl mb-3 block">🛒</span>
          <p className="text-sm text-[var(--color-mute)]">No commissions found</p>
          <p className="text-xs text-[var(--color-mute)]/60 mt-1">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <CommissionCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <InfiniteScroll
        hasMore={hasNextPage}
        loading={loading}
        onLoadMore={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
