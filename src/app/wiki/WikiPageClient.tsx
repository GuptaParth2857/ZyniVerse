"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const CATEGORIES = [
  { value: "", label: "All", icon: "📚" },
  { value: "anime", label: "Anime", icon: "🎬" },
  { value: "manga", label: "Manga", icon: "📖" },
  { value: "character", label: "Characters", icon: "👤" },
  { value: "studio", label: "Studios", icon: "🏢" },
  { value: "genre", label: "Genres", icon: "🏷️" },
  { value: "guide", label: "Guides", icon: "📋" },
  { value: "help", label: "Help", icon: "❓" },
];

interface WikiPageSummary {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  category: string;
  tags: string;
  version: number;
  updatedAt: string;
  editor: { id: string; username: string };
  _count: { history: number };
}

export default function WikiPageClient() {
  const { data: session } = useSession();
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("limit", "50");

    fetch(`/api/wiki?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setPages(data.pages || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Knowledge Base</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Wiki</h1>
        <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
          Community-driven knowledge base for anime, manga, characters, studios, and more.
        </p>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-4 transition-all ${
              category === cat.value
                ? "border-[var(--color-magenta)] bg-[var(--color-magenta)]/10 text-[var(--color-magenta)]"
                : "border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="text-[10px] font-semibold text-center">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search + Create */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wiki..."
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm outline-none focus:border-[var(--color-cyan)] w-full sm:w-64"
        />
        {session && (
          <Link href="/wiki/create" className="rounded-xl bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity">
            + New Page
          </Link>
        )}
      </div>

      {/* Pages list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 animate-pulse">
              <div className="h-5 w-1/3 bg-[var(--color-line)] rounded mb-2" />
              <div className="h-3 w-2/3 bg-[var(--color-line)] rounded" />
            </div>
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--color-mute)] mb-4">No wiki pages yet</p>
          {session && (
            <Link href="/wiki/create" className="rounded-xl bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity">
              Create the first page
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/wiki/${page.slug}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-cyan)]/40 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-sm group-hover:text-[var(--color-cyan)] transition-colors">
                  {page.title}
                </h3>
                {page.summary && <p className="text-xs text-[var(--color-mute)] mt-0.5 line-clamp-1">{page.summary}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--color-mute)]">
                  <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] sm:text-[9px] font-medium text-[var(--color-cyan)]">{page.category}</span>
                  <span>v{page.version}</span>
                  <span>by {page.editor.username}</span>
                  <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
