"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  const sortOptions = [
    { id: "recent", label: "Latest", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "#ff00ff" },
    { id: "popular", label: "Popular", icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z", color: "#00ffff" },
    { id: "top", label: "Top", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "#ff3366" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="neon-premium rounded-xl p-0.5">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content relative flex items-center gap-1 p-1">
              {sortOptions.map((s) => (
                <button 
                  key={s.id} 
                  onClick={() => { setSort(s.id); setPage(1); }}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                    sort === s.id
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                  style={sort === s.id ? {
                    color: s.color,
                    textShadow: `0 0 10px ${s.color}`
                  } : {}}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={s.icon} />
                  </svg>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-[#ff00ff]" style={{ textShadow: "0 0 10px rgba(255,0,255,0.3)" }}>{total}</span> discussions
            </span>
          </div>
        </div>

        {/* Thread List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border-2 border-[#ff00ff] border-t-transparent animate-spin" style={{ boxShadow: "0 0 15px rgba(255,0,255,0.3)" }} />
              <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-[#00ffff] border-b-transparent animate-spin" style={{ animationDuration: "1.5s", boxShadow: "0 0 15px rgba(0,255,255,0.3)" }} />
            </div>
            <p className="text-sm text-gray-500">Loading discussions...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="neon-premium rounded-xl text-center">
            <div className="neon-premium-track rounded-xl" />
            <div className="neon-premium-overlay rounded-[10.5px]" />
            <div className="neon-premium-content py-20 px-6 relative">
              <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No discussions yet</h3>
              <p className="text-sm text-gray-500 mb-4">Be the first to start a conversation!</p>
              <Link href="/forum/create" className="neon-premium rounded-xl inline-flex">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <span className="neon-premium-content flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#ff00ff] hover:text-white transition-colors rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Start Discussion
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((t, i) => (
              <ForumThreadCard key={t.id} thread={t} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium disabled:opacity-30 hover:border-[#ff00ff]/30 hover:bg-white/5 transition-all text-gray-400 hover:text-[#ff00ff]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page + i - 2;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className="h-9 w-9 rounded-lg text-xs font-medium transition-all"
                    style={page === pageNum ? {
                      background: "rgba(255,0,255,0.1)",
                      color: "#ff00ff",
                      border: "1px solid rgba(255,0,255,0.3)",
                      boxShadow: "0 0 15px rgba(255,0,255,0.2)",
                      textShadow: "0 0 10px rgba(255,0,255,0.5)"
                    } : {
                      color: "#666",
                      background: "transparent",
                      border: "1px solid transparent"
                    }}
                    onMouseEnter={(e) => {
                      if (page !== pageNum) {
                        e.currentTarget.style.color = "#00ffff";
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== pageNum) {
                        e.currentTarget.style.color = "#666";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium disabled:opacity-30 hover:border-[#00ffff]/30 hover:bg-white/5 transition-all text-gray-400 hover:text-[#00ffff]"
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <aside className="hidden lg:block">
        <ForumSidebar />
      </aside>
    </div>
  );
}
