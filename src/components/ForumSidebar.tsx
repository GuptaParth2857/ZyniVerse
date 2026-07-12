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
  const [onlineUsers, setOnlineUsers] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/forum/categories").then(r => r.json()).then(d => setCategories(d.categories)).catch(() => {});
    fetch("/api/forum/threads?limit=5").then(r => r.json()).then(d => setRecentThreads(d.threads || [])).catch(() => {});
    fetch("/api/forum/stats").then(r => r.json()).then(d => setOnlineUsers(d.onlineCount)).catch(() => {});

    const id = setInterval(() => {
      fetch("/api/forum/stats").then(r => r.json()).then(d => setOnlineUsers(d.onlineCount)).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      "General": "💬",
      "Anime Discussion": "🎬",
      "Manga": "📚",
      "Recommendations": "⭐",
      "Fan Art": "🎨",
      "News": "📰",
      "Theory": "🔮",
      "Review": "📝",
    };
    return icons[name] || "📌";
  };

  const getCategoryColor = (name: string) => {
    const colors: Record<string, string> = {
      "General": "#00ffff",
      "Anime Discussion": "#ff00ff",
      "Manga": "#8a2be2",
      "Recommendations": "#ffd700",
      "Fan Art": "#00ff7f",
      "News": "#ff3366",
      "Theory": "#ffa500",
    };
    return colors[name] || "#888";
  };

  return (
    <div className="space-y-5">
      {/* Online Status */}
      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-[#00ff7f]" style={{ boxShadow: "0 0 10px #00ff7f" }} />
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-[#00ff7f] animate-ping" />
            </div>
            <span className="text-xs font-semibold text-[#00ff7f]" style={{ textShadow: "0 0 10px rgba(0,255,127,0.5)" }}>{onlineUsers ?? "—"} Online</span>
          </div>
          <p className="text-[11px] text-gray-500">Join the conversation now!</p>
        </div>
      </div>

      {/* Categories */}
      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-5 relative">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#ff00ff] mb-4 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(255,0,255,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/forum/category/${cat.slug}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition-all"
              >
                <span className="text-base">{getCategoryIcon(cat.name)}</span>
                <span className="flex-1 truncate transition-colors" style={{ color: "#888" }} onMouseEnter={(e) => { e.currentTarget.style.color = getCategoryColor(cat.name); }} onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}>
                  {cat.name}
                </span>
                <span 
                  className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-full transition-all"
                  style={{ color: "#666" }}
                >
                  {cat.threadCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Threads */}
      {recentThreads.length > 0 && (
        <div className="neon-premium rounded-xl">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content p-5 relative">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#ff00ff] mb-4 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(255,0,255,0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Trending Now
            </h3>
            <div className="space-y-2">
              {recentThreads.slice(0, 5).map((t: any, i: number) => (
                <Link key={t.id} href={`/forum/thread/${t.id}`}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-all"
                >
                  <span 
                    className="shrink-0 h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{
                      background: i === 0 ? "rgba(255,215,0,0.15)" : i === 1 ? "rgba(192,192,192,0.15)" : i === 2 ? "rgba(205,127,50,0.15)" : "rgba(255,255,255,0.05)",
                      color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#666",
                      border: `1px solid ${i === 0 ? "rgba(255,215,0,0.3)" : i === 1 ? "rgba(192,192,192,0.3)" : i === 2 ? "rgba(205,127,50,0.3)" : "rgba(255,255,255,0.1)"}`,
                      boxShadow: i < 3 ? `0 0 8px ${i === 0 ? "rgba(255,215,0,0.3)" : i === 1 ? "rgba(192,192,192,0.3)" : "rgba(205,127,50,0.3)"}` : "none"
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 group-hover:text-white transition-colors truncate text-[13px] leading-tight">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                      <span>{t._count?.posts || t.postCount} replies</span>
                      <span className="text-gray-700">•</span>
                      <span>{t.viewCount} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-5 relative">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00ffff] mb-4" style={{ textShadow: "0 0 10px rgba(0,255,255,0.3)" }}>Quick Links</h3>
          <div className="space-y-2">
            {[
              { href: "/forum/create", label: "New Discussion", icon: "M12 5v14M5 12h14", color: "#ff00ff" },
              { href: "/community", label: "Community", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", color: "#00ffff" },
              { href: "/challenges", label: "Challenges", icon: "M12 15l-2 5 2-1 2 1-2-5zM6 3v18M18 3v18M6 9h12M6 15h12", color: "#ff3366" },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 transition-all"
              >
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#666" }}>
                    <path d={link.icon} />
                  </svg>
                </div>
                <span className="transition-colors" style={{ color: "#888" }} onMouseEnter={(e) => { e.currentTarget.style.color = link.color; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; }}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Forum Rules */}
      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-5 relative">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#ffd700] mb-3 flex items-center gap-2" style={{ textShadow: "0 0 10px rgba(255,215,0,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Forum Guidelines
          </h3>
          <ul className="space-y-2 text-[11px] text-gray-500">
            <li className="flex items-start gap-2">
              <span style={{ color: "#00ff7f" }} className="mt-0.5">✓</span>
              <span>Be respectful to all members</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#00ff7f" }} className="mt-0.5">✓</span>
              <span>No spoilers without warnings</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#00ff7f" }} className="mt-0.5">✓</span>
              <span>Use appropriate categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#ff3366" }} className="mt-0.5">✕</span>
              <span>No spam or self-promotion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
