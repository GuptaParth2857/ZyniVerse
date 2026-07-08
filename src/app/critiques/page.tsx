"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";
import { getMediaBatch } from "@/lib/anilist";
import EmptyState from "@/components/EmptyState";

interface Post {
  id: string;
  title: string;
  content: string;
  rating: number | null;
  mediaId: number | null;
  createdAt: string;
  author: { id: string; username: string };
  commentCount: number;
  saveCount: number;
  isSaved: boolean;
}

interface MediaCover {
  id: number;
  cover: string;
  title: string;
}

function CritiquesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [covers, setCovers] = useState<Map<number, MediaCover>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/posts?type=CRITIQUE")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => { if (d?.user?.id) setSessionUserId(d.user.id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mIds = [...new Set(posts.filter((p) => p.mediaId).map((p) => p.mediaId!))];
    if (mIds.length === 0) return;
    (async () => {
      const map = new Map(covers);
      const needed = mIds.filter((id) => !map.has(id));
      if (needed.length === 0) return;
      try {
        const batch = await getMediaBatch(needed);
        for (const m of batch) {
          map.set(m.id, { id: m.id, cover: m.coverImage?.extraLarge || m.coverImage?.large || "", title: m.title?.romaji || "" });
        }
      } catch {}
      setCovers(new Map(map));
    })();
  }, [posts]);

  const toggleSave = async (postId: string) => {
    if (!sessionUserId) return;
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const d = await res.json();
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isSaved: d.saved, saveCount: d.saved ? p.saveCount + 1 : p.saveCount - 1 } : p));
  };

  const getColor = (r: number) => r >= 7 ? "var(--color-cyan)" : r >= 5 ? "var(--color-amber)" : "var(--color-magenta)";

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Critiques</p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">Anime Critiques</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">In-depth reviews and critiques from the community.</p>
        </motion.div>

        {loading && <Loader label="Loading critiques..." />}

        {!loading && (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {posts.length > 0 ? (
                posts.map((post) => {
                  const mc = post.mediaId ? covers.get(post.mediaId) : null;
                  return (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-magenta)]/20 transition-all"
                    >
                      {mc && (
                        <div className="relative h-32 sm:h-40 overflow-hidden">
                          <Image src={mc.cover} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/40 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4">
                            <h2 className="font-display text-lg font-bold text-white drop-shadow-lg">{post.title}</h2>
                            <p className="text-[10px] text-white/70 font-mono">{mc.title}</p>
                          </div>
                          {post.rating != null && (
                            <div className="absolute top-3 right-3 font-mono text-sm font-bold px-2.5 py-1 rounded-lg shadow-lg backdrop-blur-sm border"
                              style={{ color: getColor(post.rating), background: `${getColor(post.rating)}15`, borderColor: `${getColor(post.rating)}30` }}
                            >{post.rating}/10</div>
                          )}
                        </div>
                      )}
                      {!mc && (
                        <div className="p-4 border-b border-[var(--color-line)]/50">
                          <div className="flex items-start justify-between">
                            <h2 className="font-display text-lg font-bold">{post.title}</h2>
                            {post.rating != null && (
                              <span className="font-mono text-sm font-bold" style={{ color: getColor(post.rating) }}>{post.rating}/10</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="p-4 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-5 w-5 rounded-full bg-[var(--color-magenta)]/20 flex items-center justify-center text-[8px] font-bold text-[var(--color-magenta)]">
                            {post.author.username.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-[10px] font-semibold">{post.author.username}</p>
                          <p className="text-[9px] font-mono text-[var(--color-mute)] ml-auto">
                            {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--color-mute)] leading-relaxed line-clamp-3">{post.content}</p>
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[var(--color-line)]/50">
                          <button onClick={() => toggleSave(post.id)} className="flex items-center gap-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={post.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                            </svg>
                            {post.saveCount}
                          </button>
                          <span className="flex items-center gap-1 text-[10px] text-[var(--color-mute)]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <EmptyState icon="edit" title="No critiques yet." description="Be the first to share your thoughts on an anime." actionLabel="Explore Anime" actionHref="/search" />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default CritiquesPage;
