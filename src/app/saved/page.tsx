"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  rating: number | null;
  createdAt: string;
  author: { id: string; username: string };
  commentCount: number;
  saveCount: number;
  isSaved: boolean;
}

function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => { if (d?.user?.id) setSessionUserId(d.user.id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (postId: string) => {
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const sorted = [...posts].sort((a, b) =>
    sortBy === "newest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Saved</p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">Your Saved Posts</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">Bookmark discussions and critiques to read later.</p>
        </motion.div>

        {loading && <Loader label="Loading saved posts..." />}

        {!loading && posts.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            {(["newest", "oldest"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                  sortBy === s
                    ? "bg-[var(--color-cyan)] text-black border-[var(--color-cyan)]"
                    : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
                }`}
              >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {sorted.length > 0 ? (
                sorted.map((post) => (
                  <motion.div key={post.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 transition-all hover:border-[var(--color-cyan)]/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm font-bold truncate">{post.title}</h3>
                        {post.type === "CRITIQUE" && (
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Critique
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--color-mute)]">by {post.author.username}</span>
                        <span className="text-[9px] font-mono text-[var(--color-mute)]">
                          {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <span className="text-[10px] text-[var(--color-mute)]">· {post.commentCount} comments</span>
                      </div>
                    </div>
                    <button onClick={() => unsave(post.id)}
                      className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/50 hover:text-[var(--color-magenta)] transition-all opacity-0 group-hover:opacity-100"
                    >Unsave</button>
                  </motion.div>
                ))
              ) : (
                <EmptyState icon="bookmark" title="No saved posts yet." description="Posts you save will appear here." actionLabel="Browse Community" actionHref="/community" />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default SavedPage;
