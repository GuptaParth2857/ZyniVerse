"use client";

import Link from "next/link";
import Image from "next/image";

interface ThreadUser {
  id: string;
  username: string;
  avatar: string | null;
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
  };
}

export default function ForumThreadCard({ thread }: ForumThreadCardProps) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Link href={`/forum/thread/${thread.id}`}
      className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-cyan)]/40 transition-all group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          {thread.isPinned && (
            <span className="text-[10px] text-[var(--color-magenta)] font-bold">📌</span>
          )}
          {thread.isLocked && (
            <span className="text-[10px] text-[var(--color-mute)]">🔒</span>
          )}
          <h3 className="font-semibold text-sm truncate group-hover:text-[var(--color-cyan)] transition-colors">
            {thread.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-mute)]">
          {thread.category && (
            <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] text-[var(--color-cyan)] font-medium">
              {thread.category.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <div className="relative h-4 w-4 rounded-full overflow-hidden bg-[var(--color-line)]">
              {thread.user.avatar ? (
                <Image src={thread.user.avatar} alt="" fill className="object-cover" sizes="16px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[8px] font-bold text-[var(--color-mute)]">
                  {thread.user.username[0]?.toUpperCase()}
                </span>
              )}
            </div>
            {thread.user.username}
          </span>
          <span>{timeAgo(thread.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 text-[11px] text-[var(--color-mute)]">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          {thread._count?.posts || thread.postCount}
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {thread.viewCount}
        </span>
      </div>
    </Link>
  );
}
