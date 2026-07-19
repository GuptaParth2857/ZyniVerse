"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { NewsItem } from "@/lib/news";

function TimeAgo({ date }: { date: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    function compute() {
      const diff = Date.now() - new Date(date).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) { setLabel("just now"); return; }
      if (mins < 60) { setLabel(`${mins}m ago`); return; }
      const hours = Math.floor(mins / 60);
      if (hours < 24) { setLabel(`${hours}h ago`); return; }
      const days = Math.floor(hours / 24);
      if (days < 7) { setLabel(`${days}d ago`); return; }
      const weeks = Math.floor(days / 7);
      if (weeks < 4) { setLabel(`${weeks}w ago`); return; }
      setLabel(new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
    }
    compute();
    const timer = setInterval(compute, 60000);
    return () => clearInterval(timer);
  }, [date]);
  return <span>{label}</span>;
}

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/news/${encodeURIComponent(id)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setItem(d.item);
        setLoading(false);
      })
      .catch(() => {
        setError("Article not found");
        setLoading(false);
      });
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

  if (error || !item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[var(--color-mute)]">
        {error || "Article not found"}
        <div className="mt-4">
          <Link href="/news" className="text-[var(--color-cyan)] hover:underline">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/news" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to News
      </Link>

      {item.image ? (
        <div className="relative rounded-2xl overflow-hidden mb-8 h-64 sm:h-80">
          <div className="h-full w-full" style={{ background: `url(${item.image}) center/cover` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.8)] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden mb-8 h-48 sm:h-56 bg-gradient-to-br from-[var(--color-cyan)]/10 via-[var(--color-panel)] to-[var(--color-magenta)]/10 flex items-center justify-center">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
          <div className="text-center z-10">
            <div className="text-4xl mb-2">📰</div>
            <p className="text-[10px] font-semibold text-[var(--color-mute)] uppercase tracking-wider">{item.source}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/30">
            {item.source}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-orange-500/15 text-orange-400 border-orange-500/30">
            {item.type}
          </span>
          {item.tags.filter((t) => t !== "ANN" && t !== "MAL").map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--color-cyan)]/8 border border-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-medium text-[var(--color-cyan)]/80">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-white mb-3">
          {item.title}
        </h1>

        <p className="text-sm text-[var(--color-mute)] leading-relaxed max-w-3xl mb-4">
          {item.summary}
        </p>

        <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-mute)]/70">
          <TimeAgo date={item.publishedAt} />
          <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-line)] to-transparent mb-8" />

      {item.content ? (
        <div
          className="prose-custom text-[var(--color-mute)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-sm text-[var(--color-mute)] mb-4">Full article content available on the original source.</p>
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
        <p className="text-xs text-[var(--color-mute)] mb-3">
          Originally published on {item.source === "News" ? "Anime News Network" : "MyAnimeList"}
        </p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/20 px-5 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5 transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          View Original Article
        </a>
      </div>
    </div>
  );
}
