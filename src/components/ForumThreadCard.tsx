"use client";

import Link from "next/link";
import Image from "next/image";

interface ThreadUser {
  id: string;
  username: string;
  avatar: string | null;
  level?: number;
}

interface ThreadCategory {
  id: string;
  name: string;
  slug: string;
}

interface ForumThreadCardProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    postCount: number;
    createdAt: string;
    user: ThreadUser;
    category?: ThreadCategory | null;
    _count?: { posts: number };
    lastActivity?: string;
  };
  index?: number;
}

export default function ForumThreadCard({ thread, index = 0 }: ForumThreadCardProps) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getCategoryStyle = (name: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
      "General": { bg: "rgba(0,255,255,0.1)", border: "#00ffff", text: "#00ffff", shadow: "rgba(0,255,255,0.5)" },
      "Anime Discussion": { bg: "rgba(255,0,255,0.1)", border: "#ff00ff", text: "#ff00ff", shadow: "rgba(255,0,255,0.5)" },
      "Manga": { bg: "rgba(138,43,226,0.1)", border: "#8a2be2", text: "#8a2be2", shadow: "rgba(138,43,226,0.5)" },
      "Recommendations": { bg: "rgba(255,215,0,0.1)", border: "#ffd700", text: "#ffd700", shadow: "rgba(255,215,0,0.5)" },
      "Fan Art": { bg: "rgba(0,255,127,0.1)", border: "#00ff7f", text: "#00ff7f", shadow: "rgba(0,255,127,0.5)" },
      "News": { bg: "rgba(255,51,102,0.1)", border: "#ff3366", text: "#ff3366", shadow: "rgba(255,51,102,0.5)" },
      "Theory": { bg: "rgba(255,165,0,0.1)", border: "#ffa500", text: "#ffa500", shadow: "rgba(255,165,0,0.5)" },
    };
    return styles[name] || { bg: "rgba(255,255,255,0.05)", border: "#666", text: "#888", shadow: "rgba(255,255,255,0.1)" };
  };

  const catStyle = thread.category ? getCategoryStyle(thread.category.name) : null;

  return (
    <Link href={`/forum/thread/${thread.id}`}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="neon-premium rounded-xl transition-all duration-300 hover:scale-[1.01]">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content p-5 relative">
          
          {/* Pinned Badge */}
          {thread.isPinned && (
            <div className="absolute top-0 right-4">
              <div className="bg-[#ff00ff] text-white text-[9px] font-bold px-3 py-1 rounded-b-lg shadow-[0_0_15px_rgba(255,0,255,0.5)]">
                ★ PINNED
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {/* User Avatar */}
            <div className="shrink-0">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[#1a1a2e] border border-[#2a2a3e] group-hover:border-[#ff00ff]/50 group-hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                {thread.user.avatar ? (
                  <Image src={thread.user.avatar} alt="" fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#ff00ff]/20 to-[#00ffff]/20">
                    <span className="text-lg font-bold text-[#ff00ff]" style={{ textShadow: "0 0 10px rgba(255,0,255,0.5)" }}>
                      {thread.user.username[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] text-white group-hover:text-[#ff00ff] transition-colors line-clamp-1" style={{ textShadow: "none" }}>
                    {thread.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    {thread.category && (
                      <span 
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border"
                        style={{ 
                          background: catStyle!.bg, 
                          borderColor: catStyle!.border,
                          color: catStyle!.text,
                          boxShadow: `0 0 10px ${catStyle!.shadow}`
                        }}
                      >
                        {thread.category.name}
                      </span>
                    )}
                    {thread.isLocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400 border border-red-500/30">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[#00ffff]">
                      {thread.user.username[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-300">{thread.user.username}</span>
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ff00ff]/50">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {timeAgo(thread.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-0.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] px-3 py-1.5 group-hover:border-[#ff00ff]/30 transition-all">
                  <span className="text-xs font-bold text-[#ff00ff]" style={{ textShadow: "0 0 5px rgba(255,0,255,0.3)" }}>{thread._count?.posts || thread.postCount}</span>
                  <span className="text-[9px] uppercase text-gray-500">replies</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] px-3 py-1.5 group-hover:border-[#00ffff]/30 transition-all">
                  <span className="text-xs font-bold text-[#00ffff]" style={{ textShadow: "0 0 5px rgba(0,255,255,0.3)" }}>{thread.viewCount}</span>
                  <span className="text-[9px] uppercase text-gray-500">views</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
