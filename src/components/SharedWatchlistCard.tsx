"use client";

import Link from "next/link";
import Image from "next/image";

interface Member {
  user: { id: string; username: string; avatar: string | null };
  role: string;
}

interface WatchlistData {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  owner: { id: string; username: string; avatar: string | null };
  members: Member[];
  _count: { items: number };
}

export default function SharedWatchlistCard({ watchlist, index = 0 }: { watchlist: WatchlistData; index?: number }) {
  const stackMembers = watchlist.members.slice(0, 4);
  const extraCount = watchlist.members.length - stackMembers.length;

  return (
    <Link
      href={`/shared-watchlists/${watchlist.id}`}
      className="neon-premium group block overflow-hidden rounded-[24px] hover:-translate-y-1 transition-transform duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-bold leading-snug truncate">{watchlist.title}</h3>
            {watchlist.description && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)] line-clamp-2">{watchlist.description}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-cyan)]">
            {watchlist._count.items} items
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)]/60 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {stackMembers.map((m) => (
                <div key={m.user.id} className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-[var(--color-panel)]">
                  {m.user.avatar ? (
                    <Image src={m.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-[8px] font-bold text-black">
                      {m.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {extraCount > 0 && (
              <span className="text-[10px] text-[var(--color-mute)]">+{extraCount}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-mute)]">
            <div className="relative h-4 w-4 overflow-hidden rounded-full">
              {watchlist.owner.avatar ? (
                <Image src={watchlist.owner.avatar} alt="" fill className="object-cover" sizes="16px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-[8px] font-bold text-black">
                  {watchlist.owner.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="truncate max-w-[80px]">{watchlist.owner.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
