"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PageTransition } from "@/components/PageTransition";

interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: "news" | "guide" | "review" | "feature" | "list" | "opinion";
  tags: string[];
  publishedAt: string;
  readTime: number;
  language: string;
  source: string;
  externalUrl?: string;
  featured?: boolean;
}

const CATEGORY_FILTERS = ["All", "guide", "news", "review", "feature", "list", "opinion"] as const;

export default function GuidesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<GuideArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/guides");
      if (!res.ok) throw new Error("Failed to fetch");
      const d = await res.json();
      setArticles(d.articles || []);
    } catch {
      setError("Failed to load articles");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArticles();
  }, [fetchArticles]);

  const filtered = articles.filter((a) => {
    if (categoryFilter !== "All" && (a.category || "feature") !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const searchable = [a.title, a.excerpt, a.content, a.category, a.author, a.source, ...a.tags].join(" ").toLowerCase();
      if (!q.split(/\s+/).some((w) => searchable.includes(w))) return false;
    }
    return true;
  });

  const featured = articles.filter(a => a.featured);

  const stats = {
    total: articles.length,
    featured: articles.filter(a => a.featured).length,
    sources: [...new Set(articles.map(a => a.source))].length,
    categories: [...new Set(articles.map(a => a.category))].length,
  };

  return (
    <PageTransition>
      <style>{`
        @keyframes guidesNeonBorder {
          0%   { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
          20%  { border-color: #00ffff; box-shadow: 0 0 8px #00ffff55, inset 0 0 8px #00ffff11; }
          40%  { border-color: #ff3366; box-shadow: 0 0 8px #ff336655, inset 0 0 8px #ff336611; }
          60%  { border-color: #ffff00; box-shadow: 0 0 8px #ffff0055, inset 0 0 8px #ffff0011; }
          80%  { border-color: #ff0066; box-shadow: 0 0 8px #ff006655, inset 0 0 8px #ff006611; }
          100% { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
        }
        .neon-border-card {
          animation: guidesNeonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
        @keyframes guidesNeonBorderHover {
          0%   { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
          20%  { border-color: #00ffff; box-shadow: 0 0 14px #00ffff, 0 0 28px #00ffff88; }
          40%  { border-color: #ff3366; box-shadow: 0 0 14px #ff3366, 0 0 28px #ff336688; }
          60%  { border-color: #ffff00; box-shadow: 0 0 14px #ffff00, 0 0 28px #ffff0088; }
          80%  { border-color: #ff0066; box-shadow: 0 0 14px #ff0066, 0 0 28px #ff006688; }
          100% { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
        }
        .neon-border-card:hover {
          animation: guidesNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.03);
        }
        .neon-filter {
          animation: guidesNeonBorder 4s linear infinite;
          animation-delay: calc(var(--fd, 0) * -1s);
          border-width: 1px;
          border-style: solid;
        }
        .neon-filter:hover {
          animation: guidesNeonBorderHover 1.5s linear infinite !important;
          transform: scale(1.05);
        }
        .guides-search:focus,
        .guides-search:focus-visible,
        .guides-search:focus-within {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
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

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search articles, topics, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="guides-search neon-border-card w-full rounded-xl border bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-mute)]"
            style={{ ["--i" as string]: -1 }}
          />
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              style={{ ["--fd" as string]: i }}
              className={`neon-filter rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                categoryFilter === f
                  ? "bg-[var(--color-magenta)] text-black shadow-[0_0_12px_var(--color-magenta),0_0_24px_var(--color-magenta)]"
                  : "bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-8 flex flex-wrap gap-3">
          <div className="neon-border-card rounded-xl bg-[var(--color-panel)] px-4 py-3" style={{ ["--i" as string]: 0 }}>
            <p className="text-sm font-bold text-[var(--color-cyan)]">{stats.total}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Articles</p>
          </div>
          <div className="neon-border-card rounded-xl bg-[var(--color-panel)] px-4 py-3" style={{ ["--i" as string]: 1 }}>
            <p className="text-sm font-bold text-yellow-400">{stats.featured}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Featured</p>
          </div>
          <div className="neon-border-card rounded-xl bg-[var(--color-panel)] px-4 py-3" style={{ ["--i" as string]: 2 }}>
            <p className="text-sm font-bold text-[var(--color-magenta)]">{stats.sources}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Sources</p>
          </div>
          <div className="neon-border-card rounded-xl bg-[var(--color-panel)] px-4 py-3" style={{ ["--i" as string]: 3 }}>
            <p className="text-sm font-bold text-green-400">{stats.categories}</p>
            <p className="text-[10px] text-[var(--color-mute)]">Categories</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl neon-border-card animate-pulse" style={{ ["--i" as string]: i }}>
                <div className="aspect-[16/9] w-full rounded-t-xl bg-white/5" />
                <div className="p-4 space-y-2.5">
                  <div className="h-5 w-3/4 rounded bg-white/10" />
                  <div className="h-3.5 w-full rounded bg-white/5" />
                  <div className="h-3.5 w-1/2 rounded bg-white/5" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-3 w-16 rounded bg-white/5" />
                    <div className="h-3 w-12 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="neon-border-card rounded-xl bg-[var(--color-panel)] py-20 text-center" style={{ ["--i" as string]: 0 }}>
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-[var(--color-mute)] mb-1 font-display font-bold">{error}</p>
            <p className="text-xs text-[var(--color-mute)]">Try refreshing the page.</p>
          </div>
        )}

        {/* Featured Articles */}
        {!loading && !error && featured.length > 0 && categoryFilter === "All" && !search && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold">Featured Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((article, i) => (
                <FeaturedCard key={article.id} article={article} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Article Grid */}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="neon-border-card rounded-xl bg-[var(--color-panel)] py-20 text-center" style={{ ["--i" as string]: 0 }}>
            <div className="text-4xl mb-3">📚</div>
            <p className="text-[var(--color-mute)] mb-1 font-display font-bold">No articles found</p>
            <p className="text-xs text-[var(--color-mute)]">Try a different search or filter.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function FeaturedCard({ article, index }: { article: GuideArticle; index: number }) {
  return (
    <a
      href={`/guides/${article.slug}`}
      className="neon-border-card group overflow-hidden rounded-xl bg-[var(--color-panel)] block no-underline"
      style={{ ["--i" as string]: index }}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 33vw"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider">{article.source}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white line-clamp-2">{article.title}</h3>
          <p className="text-xs text-white/70">{article.readTime} min read • {article.publishedAt}</p>
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-[var(--color-magenta)] px-2.5 py-0.5 text-xs font-bold text-black shadow-[0_0_8px_var(--color-magenta)]">
          FEATURED
        </span>
      </div>
    </a>
  );
}

function ArticleCard({ article, index }: { article: GuideArticle; index: number }) {
  const categoryColors: Record<string, string> = {
    news: "bg-blue-500 text-white",
    guide: "bg-[var(--color-cyan)] text-black",
    review: "bg-purple-500 text-white",
    feature: "bg-yellow-500 text-black",
    list: "bg-[var(--color-magenta)] text-black",
    opinion: "bg-orange-500 text-white",
  };

  return (
    <a
      href={`/guides/${article.slug}`}
      className="neon-border-card group overflow-hidden rounded-xl bg-[var(--color-panel)] block no-underline"
      style={{ ["--i" as string]: index }}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 33vw"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider">{article.source}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 rounded-full ${categoryColors[article.category || "feature"] || "bg-gray-500 text-white"} px-2.5 py-0.5 text-[10px] font-bold`}>
          {(article.category || "feature").toUpperCase()}
        </span>
        {article.source && article.source !== "ZyniVerse" && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white/80">
            {article.source}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-bold line-clamp-2 group-hover:text-[var(--color-cyan)] transition-colors">
          {article.title}
        </h3>
        <p className="mb-3 text-xs text-[var(--color-mute)] line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between text-[10px] text-[var(--color-mute)]">
          <span>{article.author}</span>
          <span>{article.readTime} min • {article.publishedAt}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-[var(--color-void)] px-1.5 py-0.5 text-[9px] text-[var(--color-mute)] border border-[var(--color-line)]">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
