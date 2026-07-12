"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";
import { getMediaBatch } from "@/lib/anilist";
import EmptyState from "@/components/EmptyState";

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  mediaId: number | null;
  rating: number | null;
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

type Tab = "feed" | "critiques";

function PostCard({ post, onSave, sessionUserId }: { post: Post; onSave: (id: string) => void; sessionUserId: string | null }) {
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
    } catch {}
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:p-5 transition-all hover:border-[var(--color-cyan)]/20"
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
        <h3 className="font-display text-base font-bold leading-snug">{post.title}</h3>
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
                    className="flex-1 bg-transparent border border-[var(--color-line)] rounded px-2 py-1 text-[10px] outline-none focus:border-[var(--color-cyan)]"
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

function CritiqueCard({ post, cover, onSave, sessionUserId }: { post: Post; cover?: MediaCover; onSave: (id: string) => void; sessionUserId: string | null }) {
  const getColor = (r: number) => r >= 7 ? "var(--color-cyan)" : r >= 5 ? "var(--color-amber)" : "var(--color-magenta)";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-magenta)]/20 transition-all"
    >
      {cover && (
        <div className="relative h-32 sm:h-40 overflow-hidden">
          <Image src={cover.cover} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="font-display text-lg font-bold text-white drop-shadow-lg">{post.title}</h2>
            <p className="text-[10px] text-white/70 font-mono">{cover.title}</p>
          </div>
          {post.rating != null && (
            <div className="absolute top-3 right-3 font-mono text-sm font-bold px-2.5 py-1 rounded-lg shadow-lg backdrop-blur-sm border"
              style={{ color: getColor(post.rating), background: `${getColor(post.rating)}15`, borderColor: `${getColor(post.rating)}30` }}
            >{post.rating}/10</div>
          )}
        </div>
      )}
      {!cover && (
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
          <div className="h-5 w-5 rounded-full bg-[var(--color-magenta)]/20 flex items-center justify-center text-[10px] sm:text-[8px] font-bold text-[var(--color-magenta)]">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <p className="text-[10px] font-semibold">{post.author.username}</p>
          <p className="text-[10px] sm:text-[9px] font-mono text-[var(--color-mute)] ml-auto">
            {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <p className="text-xs text-[var(--color-mute)] leading-relaxed line-clamp-3">{post.content}</p>
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[var(--color-line)]/50">
          <button onClick={() => onSave(post.id)} className="flex items-center gap-1 text-[10px] text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill={post.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            {post.saveCount}
          </button>
          <button onClick={() => {}} className="flex items-center gap-1 text-[10px] text-[var(--color-mute)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {post.commentCount}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CommunityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [covers, setCovers] = useState<Map<number, MediaCover>>(new Map());
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"POST" | "CRITIQUE">("POST");
  const [showCreate, setShowCreate] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setCovers(new Map());
    const type = tab === "critiques" ? "CRITIQUE" : "ALL";
    fetch(`/api/posts?type=${type}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

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

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => { if (d?.user?.id) setSessionUserId(d.user.id); })
      .catch(() => {});
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    router.replace(`${pathname}?tab=${t}`, { scroll: false });
  };

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

  const createPost = async () => {
    if (!title.trim() || !content.trim() || !sessionUserId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), type: postType }),
      });
      const d = await res.json();
      if (d.post) {
        setPosts((prev) => [d.post, ...prev]);
        setTitle("");
        setContent("");
        setPostType("POST");
        setShowCreate(false);
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: tab === "critiques" ? "var(--color-magenta)" : "var(--color-cyan)" }}>
            {tab === "critiques" ? "Critiques" : "Community"}
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            {tab === "critiques" ? "Anime Critiques" : "Community Feed"}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            {tab === "critiques" ? "In-depth reviews and critiques from the community." : "Discuss anime, share thoughts, and connect with fans."}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["feed", "critiques"] as const).map((t) => (
            <button key={t} onClick={() => switchTab(t)}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                tab === t
                  ? "text-black shadow-lg"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
              }`}
              style={tab === t ? { backgroundColor: t === "critiques" ? "var(--color-magenta)" : "var(--color-cyan)" } : {}}
            >
              {t === "feed" ? "Feed" : "Critiques"}
            </button>
          ))}
        </div>

        {/* Create form (only for Feed tab) */}
        {sessionUserId && tab === "feed" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {showCreate ? (
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title..."
                  className="w-full bg-transparent border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                />
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full bg-transparent border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] resize-none"
                />
                <div className="flex items-center justify-between">
                  <select value={postType} onChange={(e) => setPostType(e.target.value as "POST" | "CRITIQUE")}
                    className="bg-transparent border border-[var(--color-line)] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[var(--color-cyan)]"
                  >
                    <option value="POST">Discussion</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowCreate(false); setTitle(""); setContent(""); setPostType("POST"); }}
                      className="px-5 py-2.5 text-xs font-semibold border border-[var(--color-line)] rounded-lg hover:border-[var(--color-cyan)]/50"
                    >Cancel</button>
                    <button onClick={createPost} disabled={submitting || !title.trim() || !content.trim()}
                      className="px-5 py-2.5 text-xs font-bold bg-[var(--color-cyan)] text-black rounded-lg disabled:opacity-30"
                    >{submitting ? "Posting..." : "Post"}</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreate(true)}
                className="w-full rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/50 py-4 text-sm text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)] transition-all"
              >+ Create a post</button>
            )}
          </motion.div>
        )}

        {loading && <Loader label={`Loading ${tab === "critiques" ? "critiques" : "community"}...`} />}

        {!loading && (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {posts.length > 0 ? (
                tab === "critiques" ? (
                  posts.map((post) => (
                    <CritiqueCard key={post.id} post={post}
                      cover={post.mediaId ? covers.get(post.mediaId) : undefined}
                      onSave={toggleSave} sessionUserId={sessionUserId}
                    />
                  ))
                ) : (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} onSave={toggleSave} sessionUserId={sessionUserId} />
                  ))
                )
              ) : (
                <EmptyState
                  icon="chat"
                  title={tab === "critiques" ? "No critiques yet." : "No posts yet."}
                  description={tab === "critiques" ? "Be the first to share your thoughts on an anime." : "Be the first to start a discussion!"}
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
