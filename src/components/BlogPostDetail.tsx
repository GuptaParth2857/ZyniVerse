"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isDraft: boolean;
  publishedAt?: string | null;
  createdAt: string;
  user: { id: string; username: string; avatar?: string | null };
}

interface BlogPostDetailProps {
  post: BlogPostData;
  author: { id: string; username: string; avatar?: string | null };
  isLiked: boolean;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-black/30 rounded-lg p-3 my-2 text-xs overflow-x-auto font-mono'>$1</pre>");
  html = html.replace(/`([^`]+)`/g, "<code class='bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>");
  html = html.replace(/^### (.+)$/gm, "<h3 class='font-display text-lg font-bold mt-6 mb-2'>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 class='font-display text-xl font-bold mt-6 mb-2'>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1 class='font-display text-2xl font-bold mt-6 mb-2'>$1</h1>");
  html = html.replace(/^> (.+)$/gm, "<blockquote class='border-l-2 border-[var(--color-cyan)] pl-4 my-2 text-[var(--color-mute)] italic'>$1</blockquote>");
  html = html.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-[var(--color-mute)]'>$1</li>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-[var(--color-cyan)] hover:underline'>$1</a>");
  html = html.replace(/\n\n/g, "</p><p class='my-3 leading-relaxed text-[var(--color-mute)]'>");
  html = `<p class='my-3 leading-relaxed text-[var(--color-mute)]'>${html}</p>`;

  return html;
}

export default function BlogPostDetail({ post, author, isLiked: initialLiked }: BlogPostDetailProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(post.likeCount);
  const [comments, setComments] = useState<{ id: string; content: string; createdAt: string; user: { id: string; username: string; avatar?: string | null } }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [tab, setTab] = useState<"preview" | "comments">("preview");

  const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];

  useEffect(() => {
    fetch(`/api/blog/${post.id}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {});
  }, [post.id]);

  const handleLike = async () => {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/blog/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikes(data.likes);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !session?.user?.id) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/blog/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
    } catch {}
    setPostingComment(false);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="mb-8">
        {post.coverImage && (
          <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-6">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="100vw" />
          </div>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-sm font-bold text-black">
            {author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{author.username}</p>
            <p className="text-[10px] text-[var(--color-mute)]">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Draft"}
              {" · "}{post.viewCount} views
            </p>
          </div>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">{post.title}</h1>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag.trim())}`}
                className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
              >{tag.trim()}</Link>
            ))}
          </div>
        )}
      </header>

      {/* Actions bar */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--color-line)]">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            liked ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]" : "bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
          }`}
        >{liked ? "♥" : "♡"} {likes}</button>

        <button onClick={() => setTab("comments")}
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all"
        >💬 {comments.length}</button>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="rounded-full bg-[var(--color-panel)] px-3 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all"
          >🔗 Copy Link</button>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-[var(--color-panel)] px-5 py-2.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-all"
          >𝕏 Share</a>
        </div>

        {session?.user?.id === author.id && (
          <Link href={`/blog/edit/${post.id}`}
            className="rounded-full bg-[var(--color-magenta)]/20 px-4 py-2 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-all"
          >Edit</Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[var(--color-line)]">
        <button onClick={() => setTab("preview")}
          className={`pb-2 text-sm font-semibold transition-colors ${tab === "preview" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}
        >Content</button>
        <button onClick={() => setTab("comments")}
          className={`pb-2 text-sm font-semibold transition-colors ${tab === "comments" ? "text-[var(--color-cyan)] border-b-2 border-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}
        >Comments ({comments.length})</button>
      </div>

      {tab === "preview" && (
        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
      )}

      {tab === "comments" && (
        <div>
          {session?.user?.id ? (
            <div className="flex gap-3 mb-6">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={postingComment || !commentText.trim()}
                className="rounded-lg bg-[var(--color-magenta)] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >{postingComment ? "..." : "Post"}</button>
            </div>
          ) : (
            <p className="mb-6 text-sm text-[var(--color-mute)]">
              <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Log in</Link> to leave a comment.
            </p>
          )}

          <div className="space-y-4">
            {comments.length === 0 && <p className="text-sm text-[var(--color-mute)]">No comments yet.</p>}
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-[8px] font-bold text-black">
                    {c.user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold">{c.user.username}</span>
                  <span className="text-[10px] text-[var(--color-mute)] ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-[var(--color-mute)]">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
