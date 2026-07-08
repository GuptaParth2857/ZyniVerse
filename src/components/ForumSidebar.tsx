"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  threadCount: number;
}

export default function ForumSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentThreads, setRecentThreads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/forum/categories").then(r => r.json()).then(d => setCategories(d.categories)).catch(() => {});
    fetch("/api/forum/threads?limit=5").then(r => r.json()).then(d => setRecentThreads(d.threads || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-cyan)] mb-3">Categories</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/forum/category/${cat.slug}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-white/5 transition-colors"
            >
              <span>{cat.name}</span>
              <span className="text-[10px] font-mono text-[var(--color-mute)]">{cat.threadCount}</span>
            </Link>
          ))}
        </div>
      </div>

      {recentThreads.length > 0 && (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-cyan)] mb-3">Recent Threads</h3>
          <div className="space-y-2">
            {recentThreads.map((t: any) => (
              <Link key={t.id} href={`/forum/thread/${t.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-white/5 transition-colors truncate"
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
