"use client";

import { useState, useEffect, useCallback } from "react";
import TierListCard from "@/components/TierListCard";

interface TierListSummary {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  itemCount: number;
  voteCount: number;
  user: { id: string; username: string; avatar: string | null };
}

export default function TierListGrid() {
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [tierLists, setTierLists] = useState<TierListSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tierlist?sort=${sort}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setTierLists(data.tierLists || []);
      setTotal(data.total || 0);
    } catch {
      setTierLists([]);
    }
    setLoading(false);
  }, [sort, page]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {[
          { value: "recent", label: "Recent" },
          { value: "popular", label: "Popular" },
          { value: "top", label: "Top" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setSort(opt.value); setPage(1); }}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              sort === opt.value
                ? "bg-[var(--color-cyan)] text-black"
                : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--color-panel)]" />
          ))}
        </div>
      ) : tierLists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-mute)]">No tier lists yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tierLists.map((tl) => (
            <TierListCard key={tl.id} tierList={tl} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-mute)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
