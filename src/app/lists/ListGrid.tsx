"use client";

import { useState, useEffect, useCallback } from "react";
import UserListCard from "@/components/UserListCard";

interface ListSummary {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isFeatured: boolean;
  likes: number;
  createdAt: string;
  itemCount: number;
  coverImages: string[];
  user: { id: string; username: string; avatar: string | null };
}

export default function ListGrid() {
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [featured, setFeatured] = useState<ListSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page: String(page), limit: String(limit) });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/lists?${params}`);
      const data = await res.json();
      setLists(data.lists || []);
      setTotal(data.total || 0);
    } catch {
      setLists([]);
    }
    setLoading(false);
  }, [sort, search, page]);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch("/api/lists/featured");
      const data = await res.json();
      setFeatured(data.lists || []);
    } catch {}
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchLists(); }, [fetchLists]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Featured */}
      {featured.length > 0 && page === 1 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Featured Lists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((l) => (
              <UserListCard key={l.id} list={l} />
            ))}
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search lists..."
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors w-48"
        />
        {[
          { value: "recent", label: "Recent" },
          { value: "popular", label: "Popular" },
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[var(--color-panel)] animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-mute)]">No lists found. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((l) => (
            <UserListCard key={l.id} list={l} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
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
