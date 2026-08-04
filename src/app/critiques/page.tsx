"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";
import { getMediaBatch } from "@/lib/anilist";
import EmptyState from "@/components/EmptyState";
import { logError } from "@/lib/logger";
import TiltCard from "@/components/TiltCard";

interface Post {
  id: string;
  title: string;
  content: string;
  rating: number | null;
  mediaId: number | null;
  image: string | null;
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
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id || null;
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/posts?type=CRITIQUE")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
      } catch (e) { logError(e); }
      setCovers(new Map(map));
    })();
  }, [posts, covers]);

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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.url) setImage(d.url);
      else logError(new Error(d.error || "Upload failed"));
    } catch (err) { logError(err); }
    setUploading(false);
    e.target.value = "";
  };

  const createCritique = async () => {
    if (!title.trim() || !content.trim() || !sessionUserId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type: "CRITIQUE",
          rating: rating ? parseInt(rating) : null,
          image: image || undefined,
        }),
      });
      const d = await res.json();
      if (d.post) {
        setPosts((prev) => [d.post, ...prev]);
        setTitle("");
        setContent("");
        setRating("");
        setImage("");
        setShowCreate(false);
      }
    } catch (e) { logError(e); }
    setSubmitting(false);
  };

  const getColor = (r: number) => r >= 7 ? "var(--color-cyan)" : r >= 5 ? "var(--color-amber)" : "var(--color-magenta)";

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Critiques</p>
            <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">Anime Critiques</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">In-depth reviews and critiques from the community.</p>
        </motion.div>

        {sessionUserId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {showCreate ? (
              <div className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 sm:p-5 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Critique title..."
                  className="w-full neon-rgb-border bg-[var(--color-void)] rounded-lg px-3 py-2 text-sm outline-none"
                />
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="What are your thoughts? (Markdown supported)"
                  rows={5}
                  className="w-full neon-rgb-border bg-[var(--color-void)] rounded-lg px-3 py-2 text-sm outline-none resize-none"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input value={image} onChange={(e) => setImage(e.target.value)}
                      placeholder="Paste image URL (optional)"
                      className="flex-1 neon-rgb-border bg-[var(--color-void)] rounded-lg px-3 py-2 text-sm outline-none"
                    />
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="neon-rgb-border shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--color-cyan)] hover:text-white transition-colors disabled:opacity-50"
                    >{uploading ? "Uploading..." : "Upload"}</button>
                  </div>
                  {image && (
                    <div className="flex items-center gap-2">
                      <div className="relative overflow-hidden rounded-lg neon-rgb-border">
                        <Image src={image} alt="Preview" width={0} height={0} sizes="200px" className="h-20 w-auto max-w-[200px] object-cover" />
                      </div>
                      <button type="button" onClick={() => setImage("")}
                        className="text-[10px] text-[var(--color-magenta)] hover:underline"
                      >Remove</button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <select value={rating} onChange={(e) => setRating(e.target.value)}
                    className="neon-rgb-border bg-[var(--color-void)] rounded-lg px-3 py-1.5 text-xs outline-none"
                  >
                    <option value="">No rating</option>
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r}/10</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowCreate(false); setTitle(""); setContent(""); setRating(""); setImage(""); }}
                      className="neon-rgb-border px-5 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-mute)] hover:text-white transition-colors"
                    >Cancel</button>
                    <button onClick={createCritique} disabled={submitting || !title.trim() || !content.trim()}
                      className="px-5 py-2.5 text-xs font-bold bg-[var(--color-magenta)] text-black rounded-lg neon-rgb-border disabled:opacity-30"
                    >{submitting ? "Posting..." : "Post Critique"}</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreate(true)}
                className="w-full rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm py-4 text-sm text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-all"
              >+ Write a Critique</button>
            )}
          </motion.div>
        )}

        {loading && <Loader label="Loading critiques..." />}

        {!loading && (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {posts.length > 0 ? (
                posts.map((post, i) => {
                  const mc = post.mediaId ? covers.get(post.mediaId) : null;
                  return (
                    <TiltCard key={post.id} index={i}
                      className="rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-magenta)]/20 transition-all"
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
                        {post.image && (
                          <div className="mt-3 overflow-hidden rounded-lg neon-rgb-border">
                            <Image src={post.image} alt={post.title} width={0} height={0} sizes="100vw" className="h-auto max-h-72 w-full object-cover" />
                          </div>
                        )}
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
                    </TiltCard>
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
