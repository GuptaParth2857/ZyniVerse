"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ExternalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string;
  publishedAt: string;
  user: { username: string; avatar: string | null };
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isExternal: boolean;
  url: string;
  readingTime: number;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-black/30 rounded-lg p-4 my-4 text-sm overflow-x-auto font-mono'>$1</pre>");
  html = html.replace(/`([^`]+)`/g, "<code class='bg-black/30 px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>");
  html = html.replace(/^### (.+)$/gm, "<h3 class='font-display text-lg font-bold mt-8 mb-3 text-white'>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 class='font-display text-xl font-bold mt-10 mb-3 text-white'>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1 class='font-display text-2xl font-bold mt-10 mb-4 text-white'>$1</h1>");
  html = html.replace(/^> (.+)$/gm, "<blockquote class='border-l-2 border-[var(--color-cyan)] pl-4 my-4 text-[var(--color-mute)] italic'>$1</blockquote>");
  html = html.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-[var(--color-mute)]'>$1</li>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-[var(--color-cyan)] hover:underline'>$1</a>");
  html = html.replace(/\n\n/g, "</p><p class='my-4 leading-relaxed text-[var(--color-mute)]'>");
  html = html.replace(/\n/g, "<br/>");
  html = `<p class='my-4 leading-relaxed text-[var(--color-mute)]'>${html}</p>`;
  return html;
}

export default function ExternalBlogDetail({ id }: { id: string }) {
  const [post, setPost] = useState<ExternalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blog/external?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setPost(d.post);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-2 text-[var(--color-mute)]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading article...</span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[var(--color-mute)]">
        {error || "Article not found"}
        <div className="mt-4">
          <Link href="/blog" className="text-[var(--color-cyan)] hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const tags = post.tags ? post.tags.split(",").filter(Boolean) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Blog
      </Link>

      {/* Cover */}
      {post.coverImage ? (
        <div className="relative rounded-2xl overflow-hidden mb-8 h-64 sm:h-80">
          <div className="h-full w-full" style={{ background: `url(${post.coverImage}) center/cover` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.8)] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden mb-8 h-48 sm:h-56 bg-gradient-to-br from-[var(--color-cyan)]/10 via-[var(--color-panel)] to-[var(--color-magenta)]/10 flex items-center justify-center">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(0,255,224,0.15) 0%, transparent 70%)", filter: "blur(30px)" }}
          />
          <div className="text-center z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)] text-lg font-black text-black mx-auto mb-3 shadow-[0_0_30px_-4px_rgba(0,255,224,0.3)]">
              ZB
            </div>
            <p className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">Curated by ZyniBot</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)] text-xs font-black text-black">
            ZB
          </div>
          <div>
            <p className="text-sm font-bold text-white">ZyniBot</p>
            <p className="text-[10px] text-[var(--color-mute)]">Curated from dev.to · {post.readingTime} min read</p>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-white mb-3">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-base text-[var(--color-mute)] leading-relaxed max-w-3xl">{post.excerpt}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[var(--color-mute)]/70">
          <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {post.commentCount}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--color-cyan)]/8 border border-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)]/80">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent mb-8" />

      {/* Content */}
      <div className="prose-custom" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

      {/* Original Source */}
      <div className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
        <p className="text-xs text-[var(--color-mute)] mb-3">Originally published on dev.to by {post.user.username}</p>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/20 px-5 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5 transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          View on dev.to
        </a>
      </div>
    </div>
  );
}
