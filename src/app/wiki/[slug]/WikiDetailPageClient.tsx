"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import WikiPageView from "@/components/WikiPage";

interface WikiPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  category: string;
  tags: string;
  version: number;
  updatedAt: string;
  createdAt: string;
  editor: { id: string; username: string; avatar?: string | null };
  _count: { history: number };
  isExternal?: boolean;
  coverImage?: string | null;
  sourceUrl?: string;
}

export default function WikiDetailPageClient() {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;
  const { data: session } = useSession();

  const [page, setPage] = useState<WikiPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof slug !== "string") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/wiki/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setPage(data.page);
      })
      .catch(() => setError("Failed to load page"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-[var(--color-line)] rounded" />
          <div className="h-4 w-1/2 bg-[var(--color-line)] rounded" />
          <div className="h-64 bg-[var(--color-line)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-[var(--color-mute)]">{error || "Page not found on Wikipedia"}</p>
      </div>
    );
  }

  if (page.isExternal) {
    const CATEGORY_LABELS: Record<string, string> = {
      anime: "Anime", manga: "Manga", character: "Character",
      studio: "Studio", genre: "Genre", guide: "Guide", help: "Help",
    };

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-mute)] mb-2">
          <Link href="/wiki" className="hover:text-[var(--color-cyan)]">Wiki</Link>
          <span>/</span>
          <span className="text-[var(--color-cyan)]">{CATEGORY_LABELS[page.category] || page.category}</span>
        </div>

        {/* Cover image */}
        {page.coverImage && (
          <div className="neon-premium rounded-xl mb-8">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content">
              <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden">
                <img
                  src={page.coverImage}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Title section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">{page.title}</h1>
              {page.summary && (
                <p className="mt-2 text-sm text-[var(--color-mute)]">{page.summary}</p>
              )}
            </div>
            <a
              href={page.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Wikipedia
            </a>
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-[var(--color-mute)]">
            <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--color-cyan)]">Wikipedia</span>
            <span>Imported from Wikipedia</span>
          </div>
        </div>

        {/* Content */}
        <div className="neon-premium rounded-xl">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content p-6">
            <div className="prose prose-sm prose-invert max-w-none">
              {page.content.split("\n").map((line, i) => {
                if (line.startsWith("== ")) return <h2 key={i} className="text-xl font-bold mt-5 mb-2">{line.replace(/^==\s*/, "").replace(/\s*==$/, "")}</h2>;
                if (line.startsWith("=== ")) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace(/^===\s*/, "").replace(/\s*===$/, "")}</h3>;
                if (line.match(/^\[?https?:\/\//)) return <a key={i} href={line} target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyan)] hover:underline text-sm block my-1">{line}</a>;
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm text-[var(--color-mute)] leading-relaxed">{line}</p>;
              })}
            </div>
          </div>
        </div>

        {/* Source link */}
        <div className="mt-6 text-center">
          <a
            href={page.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)] transition-colors"
          >
            Read full article on Wikipedia →
          </a>
        </div>
      </div>
    );
  }

  return <WikiPageView page={page} />;
}
