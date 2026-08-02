"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { logError } from "@/lib/logger";

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  mediaId: number | null;
  rating: number | null;
  image: string | null;
  createdAt: string;
  author: { id: string; username: string };
  commentCount: number;
  saveCount: number;
  isSaved: boolean;
}

function PostCard({ post, onSave, sessionUserId, index = 0 }: { post: Post; onSave: (id: string) => void; sessionUserId: string | null; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<{ id: string; content: string; author: { username: string }; createdAt: string }[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const showMore = post.content.length > 200;

  const loadComments = async () => {
    const res = await fetch(`/api/comments?postId=${post.id}`);
    const d = await res.json();
    setComments(d.comments || []);
    setShowComments(true);
  };

  const addComment = async () => {
    if (!commentText.trim() || !sessionUserId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, content: commentText.trim() }),
      });
      const d = await res.json();
      if (d.comment) {
        setComments((prev) => [...prev, d.comment]);
        setCommentText("");
      }
    } catch (e) { logError(e); }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 sm:p-5 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-cyan)]/20 text-[10px] font-bold text-[var(--color-cyan)]">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold">{post.author.username}</p>
            <p className="text-[10px] sm:text-[9px] font-mono text-[var(--color-mute)]">
              {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        {post.type === "CRITIQUE" && (
          <span className="text-[10px] sm:text-[9px] font-bold uppercase tracking-wider text-[var(--color-magenta)] bg-[var(--color-magenta)]/10 px-2 py-0.5 rounded-full border border-[var(--color-magenta)]/30">
            Critique
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-bold leading-snug group-hover:text-[var(--color-cyan)] transition-colors">{post.title}</h3>
        {post.rating != null && (
          <span className="font-mono text-sm font-bold shrink-0" style={{ color: post.rating >= 7 ? "var(--color-cyan)" : post.rating >= 5 ? "var(--color-amber)" : "var(--color-magenta)" }}>
            {post.rating}/10
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-xs text-[var(--color-mute)] leading-relaxed whitespace-pre-line">
          {showMore && !expanded ? `${post.content.slice(0, 200)}...` : post.content}
        </p>
        {showMore && (
          <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-[var(--color-cyan)] hover:underline mt-1">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {post.image && (
        <div className="mt-3 overflow-hidden rounded-lg neon-rgb-border">
          <Image src={post.image} alt={post.title} width={0} height={0} sizes="100vw" className="h-auto max-h-80 w-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-line)]/50">
        <button onClick={() => onSave(post.id)} className="flex items-center gap-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill={post.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          {post.saveCount}
        </button>
        <button onClick={() => { if (!showComments) loadComments(); else setShowComments(!showComments); }}
          className="flex items-center gap-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {post.commentCount}
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-2 border-t border-[var(--color-line)]/50 pt-3">
              {comments.length === 0 && <p className="text-[10px] text-[var(--color-mute)]">No comments yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-[10px] font-bold text-[var(--color-cyan)] shrink-0">{c.author.username}</span>
                  <p className="text-[10px] text-[var(--color-mute)]">{c.content}</p>
                </div>
              ))}
              {sessionUserId && (
                <div className="flex gap-2 pt-1">
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 neon-rgb-border bg-[var(--color-void)] rounded px-2 py-1 text-[10px] outline-none"
                    onKeyDown={(e) => e.key === "Enter" && addComment()}
                  />
                  <button onClick={addComment} disabled={submitting || !commentText.trim()}
                    className="text-[10px] font-bold text-[var(--color-cyan)] disabled:opacity-30 shrink-0"
                  >Post</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommunityContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [postType, setPostType] = useState<"POST" | "CRITIQUE">("POST");
  const [showCreate, setShowCreate] = useState(false);
  const { data: session } = useSession();
  const sessionUserId = session?.user?.id || null;
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/posts?type=ALL")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const createPost = async () => {
    if (!title.trim() || !content.trim() || !sessionUserId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), type: postType, image: image || undefined }),
      });
      const d = await res.json();
      if (d.post) {
        setPosts((prev) => [d.post, ...prev]);
        setTitle("");
        setContent("");
        setImage("");
        setPostType("POST");
        setShowCreate(false);
      }
    } catch (e) { logError(e); }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0,255,255,0.15)" }} />
            <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,0,255,0.1)" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,0,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.4 }} />
            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-rgb-border rounded-xl h-12 w-12 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "var(--color-cyan)", textShadow: "0 0 10px rgba(0,255,255,0.5)" }}>
                  Social Feed
                </span>
              </div>
              <div className="neon-rgb-border rounded-xl px-5 py-2 inline-block">
                <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight">
                  Social Feed
                </h1>
              </div>
              <p className="mt-3 text-sm text-[var(--color-mute)] max-w-lg">
                Quick posts, thoughts, and reactions. For structured discussions, visit the Forum. In-depth reviews live in Critiques.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <a href="/forum" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-cyan)] hover:underline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  Go to Forum →
                </a>
                <a href="/critiques" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-magenta)] hover:underline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 19l-6-6M5 13l6-6M19 5l-3-3M20 10l-5 5" /></svg>
                  View Critiques →
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Create form */}
        {sessionUserId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {showCreate ? (
              <div className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-4 sm:p-5 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full neon-rgb-border bg-[var(--color-void)] rounded-lg px-3 py-2 text-sm outline-none"
                />
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
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
                  <select value={postType} onChange={(e) => setPostType(e.target.value as "POST" | "CRITIQUE")}
                    className="neon-rgb-border bg-[var(--color-void)] rounded-lg px-3 py-1.5 text-xs outline-none"
                  >
                    <option value="POST">Discussion</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowCreate(false); setTitle(""); setContent(""); setImage(""); setPostType("POST"); }}
                      className="neon-rgb-border px-5 py-2.5 text-xs font-semibold rounded-lg text-[var(--color-mute)] hover:text-white transition-colors"
                    >Cancel</button>
                    <button onClick={createPost} disabled={submitting || !title.trim() || !content.trim()}
                      className="px-5 py-2.5 text-xs font-bold bg-[var(--color-cyan)] text-black rounded-lg neon-rgb-border disabled:opacity-30"
                    >{submitting ? "Posting..." : "Post"}</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreate(true)}
                className="w-full rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 backdrop-blur-sm py-4 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all"
              >+ Create a post</button>
            )}
          </motion.div>
        )}

        {loading && <Loader label="Loading community..." />}

        {!loading && (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {posts.length > 0 ? (
                posts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} onSave={toggleSave} sessionUserId={sessionUserId} />
                ))
              ) : (
                <EmptyState
                  icon="chat"
                  title="No posts yet."
                  description="Be the first to start a discussion!"
                  actionLabel="Explore Anime"
                  actionHref="/search"
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16"><Loader label="Loading community..." /></div>}>
      <CommunityContent />
    </Suspense>
  );
}
