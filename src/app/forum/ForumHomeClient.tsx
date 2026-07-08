"use client";

import { useEffect, useState } from "react";
import ForumThreadCard from "@/components/ForumThreadCard";
import ForumSidebar from "@/components/ForumSidebar";

export default function ForumHomeClient() {
  const [threads, setThreads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forum/threads?page=${page}&limit=${limit}&sort=${sort}`)
      .then(r => r.json())
      .then(d => { setThreads(d.threads || []); setTotal(d.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, sort]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {["recent", "popular", "top"].map((s) => (
              <button key={s} onClick={() => { setSort(s); setPage(1); }}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  sort === s
                    ? "bg-[var(--color-cyan)] text-black"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]"
                }`}
              >{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
          <span className="text-[11px] text-[var(--color-mute)]">{total} threads</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
            <p className="text-sm text-[var(--color-mute)]">No threads yet.</p>
            <Link href="/forum/create" className="text-[var(--color-cyan)] hover:underline text-sm mt-1 inline-block">Start a discussion →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <ForumThreadCard key={t.id} thread={t} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs disabled:opacity-30"
            >Prev</button>
            <span className="text-xs text-[var(--color-mute)]">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs disabled:opacity-30"
            >Next</button>
          </div>
        )}
      </div>

      <aside className="hidden lg:block">
        <ForumSidebar />
      </aside>
    </div>
  );
}

function Link({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  return <a href={href} className={className}>{children}</a>;
}
