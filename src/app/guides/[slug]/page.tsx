"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function proxyImage(url: string): string {
  if (!url) return "";
  if (url.includes("animenewsnetwork.com")) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  source: string;
  tags: string[];
  publishedAt: string;
  externalUrl?: string;
}

function renderMarkdown(md: string): string {
  let html = md;
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-[var(--color-cyan)]">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-white">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black mt-0 mb-4 text-white">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 text-[var(--color-text)]">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc mb-4 space-y-1">${match}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-1 text-[var(--color-text)]">$1</li>');
  html = html.replace(/\n\n/g, '</p><p class="mb-4 text-[var(--color-text)] leading-relaxed">');
  html = `<p class="mb-4 text-[var(--color-text)] leading-relaxed">${html}</p>`;
  return html;
}

function renderPlainText(text: string): string {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (trimmed.startsWith("# ")) {
        return `<h1 class="text-2xl font-black mt-0 mb-4 text-white">${trimmed.slice(2)}</h1>`;
      }
      if (trimmed.startsWith("## ")) {
        return `<h2 class="text-xl font-bold mt-8 mb-3 text-white">${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith("### ")) {
        return `<h3 class="text-lg font-bold mt-6 mb-2 text-[var(--color-cyan)]">${trimmed.slice(4)}</h3>`;
      }
      const formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
        .replace(/- \*\*(.+?)\*\*:?\s*(.*)/g, '<li class="ml-4 mb-1"><strong class="text-white font-bold">$1</strong>: $2</li>')
        .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1 text-[var(--color-text)]">$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1 text-[var(--color-text)]">$2</li>');

      if (formatted.includes("<li")) {
        const lines = formatted.split("\n");
        const result: string[] = [];
        let inList = false;
        for (const line of lines) {
          if (line.includes("<li")) {
            if (!inList) { result.push('<ul class="list-disc mb-4 space-y-1">'); inList = true; }
            result.push(line);
          } else {
            if (inList) { result.push("</ul>"); inList = false; }
            result.push(`<p class="mb-4 text-[var(--color-text)] leading-relaxed">${line}</p>`);
          }
        }
        if (inList) result.push("</ul>");
        return result.join("\n");
      }

      return `<p class="mb-4 text-[var(--color-text)] leading-relaxed">${formatted}</p>`;
    })
    .join("\n");
}

export default function GuideDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/guides/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setArticle(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Article not found");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <style>{`
          @keyframes dBorder { 0%{border-color:#ff00ff;box-shadow:0 0 8px #ff00ff55} 20%{border-color:#00ffff;box-shadow:0 0 8px #00ffff55} 40%{border-color:#ff3366;box-shadow:0 0 8px #ff336655} 60%{border-color:#ffff00;box-shadow:0 0 8px #ffff0055} 80%{border-color:#ff0066;box-shadow:0 0 8px #ff006655} 100%{border-color:#ff00ff;box-shadow:0 0 8px #ff00ff55} }
          .neon-border-card { animation: dBorder 4s linear infinite; border-width: 1px; border-style: solid; }
        `}</style>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="h-10 w-3/4 rounded bg-white/10" />
          <div className="aspect-[16/9] w-full rounded-xl neon-border-card bg-white/5" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-5/6 rounded bg-white/5" />
            <div className="h-4 w-2/3 rounded bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-4/5 rounded bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 text-center">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-[var(--color-mute)] mb-4 font-display font-bold">{error || "Article not found"}</p>
        <Link href="/guides" className="text-[var(--color-cyan)] hover:underline text-sm">
          Back to Guides
        </Link>
      </div>
    );
  }

  const isMarkdown = article.content.includes("# ") || article.content.includes("**");
  const renderedContent = isMarkdown ? renderMarkdown(article.content) : renderPlainText(article.content);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <style>{`
        @keyframes dBorder { 0%{border-color:#ff00ff;box-shadow:0 0 8px #ff00ff55,inset 0 0 8px #ff00ff11} 20%{border-color:#00ffff;box-shadow:0 0 8px #00ffff55,inset 0 0 8px #00ffff11} 40%{border-color:#ff3366;box-shadow:0 0 8px #ff336655,inset 0 0 8px #ff336611} 60%{border-color:#ffff00;box-shadow:0 0 8px #ffff0055,inset 0 0 8px #ffff0011} 80%{border-color:#ff0066;box-shadow:0 0 8px #ff006655,inset 0 0 8px #ff006611} 100%{border-color:#ff00ff;box-shadow:0 0 8px #ff00ff55,inset 0 0 8px #ff00ff11} }
        @keyframes dBorderHover { 0%{border-color:#ff00ff;box-shadow:0 0 14px #ff00ff,0 0 28px #ff00ff88} 20%{border-color:#00ffff;box-shadow:0 0 14px #00ffff,0 0 28px #00ffff88} 40%{border-color:#ff3366;box-shadow:0 0 14px #ff3366,0 0 28px #ff336688} 60%{border-color:#ffff00;box-shadow:0 0 14px #ffff00,0 0 28px #ffff0088} 80%{border-color:#ff0066;box-shadow:0 0 14px #ff0066,0 0 28px #ff006688} 100%{border-color:#ff00ff;box-shadow:0 0 14px #ff00ff,0 0 28px #ff00ff88} }
        .neon-border-card { animation: dBorder 4s linear infinite; border-width: 1px; border-style: solid; }
        .neon-border-card:hover { animation: dBorderHover 1.5s linear infinite !important; }
        .neon-filter { animation: dBorder 4s linear infinite; border-width: 1px; border-style: solid; }
        .neon-filter:hover { animation: dBorderHover 1.5s linear infinite !important; transform: scale(1.05); }
      `}</style>

      <Link href="/guides" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-6">
        ← Back to Guides
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="rounded-full bg-[var(--color-magenta)] text-black px-2.5 py-0.5 text-[10px] font-bold uppercase">
            {article.source}
          </span>
          <span className="text-[10px] text-[var(--color-mute)]">{article.publishedAt}</span>
        </div>
        <div className="neon-rgb-border rounded-xl px-4 py-2">
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {article.title}
          </h1>
        </div>
        {article.excerpt && (
          <p className="mt-3 text-sm text-[var(--color-mute)] leading-relaxed">
            {article.excerpt}
          </p>
        )}
      </div>

      {article.image && !imgError && (
        <div className="neon-rgb-border rounded-xl overflow-hidden mb-8">
          <Image
            src={proxyImage(article.image)}
            alt={article.title}
            width={1600}
            height={900}
            className="w-full h-auto object-cover max-h-[450px]"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div
        className="mb-8 neon-rgb-border rounded-xl p-4"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />

      {article.externalUrl && (
        <div className="neon-filter rounded-xl p-5 bg-[var(--color-panel)] mb-8">
          <p className="text-xs text-[var(--color-mute)] uppercase tracking-wider mb-2">Read the full article on the original source</p>
          <a
            href={article.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-cyan)] hover:underline font-bold"
          >
            Open on {article.source === "ANN" ? "Anime News Network" : "MyAnimeList"} →
          </a>
        </div>
      )}

      {article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[var(--color-line)]">
          <p className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/guides?search=${encodeURIComponent(tag)}`}
                className="rounded bg-[var(--color-void)] px-2 py-1 text-[10px] text-[var(--color-mute)] neon-rgb-border hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-[var(--color-line)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-magenta)] flex items-center justify-center text-black font-bold text-sm">
          {article.source === "ANN" ? "A" : article.source === "MAL" ? "M" : "Z"}
        </div>
        <div>
          <p className="text-sm font-bold">{article.source === "ANN" ? "Anime News Network" : article.source === "MAL" ? "MyAnimeList" : "ZyniVerse Team"}</p>
          <p className="text-[10px] text-[var(--color-mute)]">{article.publishedAt}</p>
        </div>
      </div>
    </div>
  );
}
