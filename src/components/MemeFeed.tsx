"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import MemeCard from "./MemeCard";
import InfiniteScroll from "./InfiniteScroll";
import { useSession } from "next-auth/react";
import { applyUserVotes, fetchViewerState } from "@/lib/client/viewer-state";

interface MemeItem {
  id: string;
  title: string;
  imageUrl: string;
  mediaTitle: string | null;
  tags: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: 1 | -1 | 0;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
  live?: boolean;
}

const SORTS = [
  { value: "hot", label: "Hot", icon: "🔥" },
  { value: "new", label: "New", icon: "✨" },
  { value: "top", label: "Top", icon: "🏆" },
];

export default function MemeFeed() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<MemeItem[]>([]);
  const [sort, setSort] = useState("hot");
  const [tag, setTag] = useState("all");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveItems, setLiveItems] = useState<MemeItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveAdded, setLiveAdded] = useState(0);

  const loadLive = async () => {
    if (liveLoading) return;
    setLiveLoading(true);
    try {
      const res = await fetch("/api/memes/live?count=12");
      const data = await res.json();
      const more = (data.items || []) as MemeItem[];
      setLiveItems((prev) => {
        const seen = new Set(prev.map((m) => m.imageUrl).concat(items.map((m) => m.imageUrl)));
        const fresh = more.filter((m) => !seen.has(m.imageUrl));
        return [...prev, ...fresh];
      });
      setLiveAdded((n) => n + more.length);
    } catch {
      setError("Could not load fresh memes. Try again.");
    } finally {
      setLiveLoading(false);
    }
  };

  const fetchMemes = useCallback(async (whichPage: number, append: boolean, useSort: string, useTag: string) => {
    setLoading(true);
    if (!append) setError("");
    try {
      const params = new URLSearchParams();
      params.set("sort", useSort);
      if (useTag !== "all") params.set("tag", useTag);
      params.set("page", String(whichPage));

      const res = await fetch(`/api/memes?${params}`);
      if (!res.ok) {
        if (!append) setError("Failed to load memes");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const next: MemeItem[] = data.items || [];

      if (status === "authenticated") {
        // The visitor's own vote is fetched separately, so the feed itself
        // stays identical for everyone and can come from the CDN.
        const states = await fetchViewerState("memeVotes", next.map((m) => m.id));
        applyUserVotes(next, states);
      }

      setItems((prev) => (append ? [...prev, ...next] : next));
      setHasNextPage(data.hasNextPage);
    } catch {
      if (!append) setError("Failed to load memes");
    }
    setLoading(false);
  }, [status]);

  const changeFilters = (newSort: string, newTag: string) => {
    setSort(newSort);
    setTag(newTag);
    setPage(1);
    void fetchMemes(1, false, newSort, newTag);
  };

  useEffect(() => {
    if (status === "loading") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMemes(1, false, sort, tag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchMemes(nextPage, true, sort, tag);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => changeFilters(s.value, tag)}
              className={`flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                sort === s.value ? "bg-[var(--color-panel)] text-white shadow-sm" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tag}
            onChange={(e) => changeFilters(sort, e.target.value)}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-xs text-white outline-none focus:border-[var(--color-cyan)] transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[var(--color-panel)]">All Tags</option>
            <option value="cringe" className="bg-[var(--color-panel)]">#cringe</option>
            <option value="wholesome" className="bg-[var(--color-panel)]">#wholesome</option>
            <option value="meme" className="bg-[var(--color-panel)]">#meme</option>
            <option value="funny" className="bg-[var(--color-panel)]">#funny</option>
            <option value="shonen" className="bg-[var(--color-panel)]">#shonen</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={loadLive}
            disabled={liveLoading}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--color-void)] bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {liveLoading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M4 12a8 8 0 018-8v4" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
                </span>
                Fresh Memes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {status === "authenticated" && session?.user?.id && (
        <div className="mb-6 rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/50 p-3">
          <a
            href="/memes/upload"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-cyan)] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Share a meme...
          </a>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {items.length === 0 && liveItems.length === 0 && !loading ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
          <span className="text-4xl mb-3 block">😴</span>
          <p className="text-sm text-[var(--color-mute)]">No memes here yet</p>
          <p className="text-xs text-[var(--color-mute)]/60 mt-1">Be the first to share one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {liveItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 px-3 py-2"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-cyan)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                </span>
                {liveAdded} live memes streamed from Reddit
              </span>
              <span className="text-[10px] text-[var(--color-mute)]/60">— like/comment karo to save ho jayenge</span>
              <button
                onClick={() => setLiveItems([])}
                className="ml-auto text-[10px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[var(--color-magenta)]"
              >
                Clear ×
              </button>
            </motion.div>
          )}
          {[...liveItems, ...items].map((item, i) => (
            <MemeCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <InfiniteScroll
        hasMore={hasNextPage}
        loading={loading}
        onLoadMore={loadMore}
      />
    </div>
  );
}
