"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ForumSignature from "@/components/ForumSignature";

interface ForumThreadDetailProps {
  threadId: string;
}

export default function ForumThreadDetail({ threadId }: ForumThreadDetailProps) {
  const router = useRouter();
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    fetchThread();
    fetch("/api/auth/session").then(r => r.json()).then(d => setSessionUser(d?.user?.id || null)).catch(() => {});
  }, [threadId, page]);

  async function fetchThread() {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/threads/${threadId}?page=${page}&limit=${limit}`);
      const data = await res.json();
      setThread(data.thread);
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      setThread(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/forum/threads/${threadId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      setReplyContent("");
      const lastPage = Math.ceil((total + 1) / limit);
      setPage(lastPage);
      await fetchThread();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReplying(false);
    }
  }

  async function handleVote(postId: string, vote: number) {
    try {
      await fetch("/api/forum/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, vote }),
      });
      await fetchThread();
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-mute)]">Thread not found.</p>
        <Link href="/forum" className="text-[var(--color-cyan)] hover:underline text-sm mt-2 inline-block">Back to Forum</Link>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Link href="/forum" className="text-sm text-[var(--color-cyan)] hover:underline inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
        Back to Forum
      </Link>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <div className="flex items-center gap-2 mb-2">
          {thread.isPinned && <span className="text-xs text-[var(--color-magenta)]">📌 Pinned</span>}
          {thread.isLocked && <span className="text-xs text-[var(--color-mute)]">🔒 Locked</span>}
          {thread.category && (
            <Link href={`/forum/category/${thread.category.slug}`}
              className="rounded-full bg-[var(--color-cyan)]/10 px-2.5 py-0.5 text-[10px] text-[var(--color-cyan)] font-medium"
            >{thread.category.name}</Link>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold">{thread.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-mute)]">
          <div className="flex items-center gap-1.5">
            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-[var(--color-line)]">
              {thread.user.avatar ? (
                <Image src={thread.user.avatar} alt="" fill className="object-cover" sizes="24px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] sm:text-[9px] font-bold">{thread.user.username[0]?.toUpperCase()}</span>
              )}
            </div>
            <span className="font-medium text-[var(--color-ink)]">{thread.user.username}</span>
          </div>
          <span>{timeAgo(thread.createdAt)}</span>
          <span>{thread.viewCount.toLocaleString()} views</span>
          <span>{total} replies</span>
        </div>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center text-sm text-[var(--color-mute)]">
            No replies yet. Be the first to respond!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <div className="flex items-start gap-4">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[var(--color-line)] shrink-0">
                  {post.user.avatar ? (
                    <Image src={post.user.avatar} alt="" fill className="object-cover" sizes="40px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-[var(--color-mute)]">
                      {post.user.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{post.user.username}</span>
                    <span className="text-[10px] text-[var(--color-mute)]">{timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="text-sm text-[var(--color-mute)] leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                  <ForumSignature signature={post.user.signature} />
                  <div className="flex items-center gap-3 mt-3">
                    {sessionUser && !thread.isLocked && (
                      <>
                        <button onClick={() => handleVote(post.id, 1)}
                          className="flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-green-400 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 15l7-7 7 7" /></svg>
                          {post._count?.votes || 0}
                        </button>
                        <button onClick={() => handleVote(post.id, -1)}
                          className="flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-red-400 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs disabled:opacity-30"
          >Prev</button>
          <span className="text-xs text-[var(--color-mute)]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs disabled:opacity-30"
          >Next</button>
        </div>
      )}

      {sessionUser && !thread.isLocked && (
        <form onSubmit={handleReply} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h3 className="font-display text-sm font-bold mb-3">Reply</h3>
          <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)] resize-y"
          />
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={replying || !replyContent.trim()}
              className="rounded-xl bg-[var(--color-cyan)] px-5 py-2.5 text-xs font-bold text-black disabled:opacity-50 hover:opacity-90 transition"
            >{replying ? "Posting..." : "Post Reply"}</button>
          </div>
        </form>
      )}

      {!sessionUser && (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-center text-sm text-[var(--color-mute)]">
          <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Log in</Link> to reply to this thread.
        </div>
      )}
    </div>
  );
}
