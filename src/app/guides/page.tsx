"use client";

import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { EDITORIAL_ARTICLES, EDITORIAL_STATS } from "@/lib/editorial-articles";
import type { EditorialArticle } from "@/lib/editorial-articles";

const CATEGORY_FILTERS = ["All", "news", "guide", "review", "feature", "list"] as const;

export default function GuidesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = EDITORIAL_ARTICLES.filter((a) => {
    if (categoryFilter !== "All" && a.category !== categoryFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featured = EDITORIAL_ARTICLES.filter(a => a.featured);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Guides & Articles
          </p>
          <h1 className="font-display text-3xl font-black sm:text-4xl tracking-tight mt-1">
            Anime Guides & Editorial
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            In-depth guides, reviews, and editorial content about anime in India.
          </p>
        </div>

        {/* Featured Articles */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold">Featured Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((article) => (
                <FeaturedCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--color-cyan)]">{EDITORIAL_STATS.totalArticles}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Articles</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-3">
            <p className="text-sm font-bold text-yellow-400">{EDITORIAL_STATS.featured}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Featured</p>
          </div>
          <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-3">
            <p className="text-sm font-bold text-green-400">{EDITORIAL_STATS.languages.length}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Languages</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
          />
          <div className="flex gap-1 rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-1">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  categoryFilter === f
                    ? "bg-[var(--color-cyan)] text-black"
                    : "text-[var(--color-mute)] hover:text-[var(--color-text)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Article Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-[var(--color-mute)]">
            No articles found matching your filters.
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function FeaturedCard({ article }: { article: EditorialArticle }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--color-cyan)] bg-[var(--color-surface1)] transition-all hover:shadow-lg hover:shadow-[var(--color-cyan)]/10">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white line-clamp-2">{article.title}</h3>
          <p className="text-xs text-white/70">{article.readTime} min read • {article.publishedAt}</p>
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-[var(--color-cyan)] px-2.5 py-0.5 text-xs font-bold text-black">
          FEATURED
        </span>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: EditorialArticle }) {
  const categoryColors: Record<string, string> = {
    news: "bg-blue-500",
    guide: "bg-green-500",
    review: "bg-purple-500",
    feature: "bg-yellow-500",
    list: "bg-cyan-500",
    opinion: "bg-orange-500",
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] transition-all hover:border-[var(--color-cyan)] hover:shadow-lg hover:shadow-[var(--color-cyan)]/5">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 rounded-full ${categoryColors[article.category]} px-2.5 py-0.5 text-[10px] font-bold text-white`}>
          {article.category.toUpperCase()}
        </span>
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-bold line-clamp-2 group-hover:text-[var(--color-cyan)]">
          {article.title}
        </h3>
        <p className="mb-3 text-xs text-[var(--color-mute)] line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between text-[10px] text-[var(--color-mute)]">
          <span>{article.author}</span>
          <span>{article.readTime} min • {article.publishedAt}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-[var(--color-surface2)] px-1.5 py-0.5 text-[9px] text-[var(--color-mute)]">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
