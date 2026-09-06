"use client";

import Link from "next/link";
import Image from "next/image";
import TipButton from "@/components/TipButton";

interface CreatorCardProps {
  creator: {
    id: string;
    displayName: string | null;
    bio: string | null;
    totalTips: number;
    kofiUrl: string | null;
    buymeacoffeeUrl: string | null;
    upiId: string | null;
    user: { id: string; username: string; avatar: string | null };
  };
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const name = creator.displayName || creator.user.username;

  return (
    <div className="neon-premium rounded-[24px] h-full">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="relative p-5">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/profile/${creator.user.id}`} className="shrink-0">
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-[var(--color-cyan)]/30">
              {creator.user.avatar ? (
                <Image src={creator.user.avatar} alt="" fill className="object-cover" sizes="56px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-lg font-bold text-black">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${creator.user.id}`} className="text-sm font-bold hover:text-[var(--color-cyan)] transition-colors line-clamp-1">
              {name}
            </Link>
            <p className="text-[10px] text-[var(--color-mute)]">@{creator.user.username}</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-[var(--color-cyan)]">₹{creator.totalTips.toLocaleString()}</span>
              <span className="text-[10px] text-[var(--color-mute)]">received</span>
            </div>
          </div>
        </div>

        {creator.bio && (
          <p className="mb-4 text-xs text-[var(--color-mute)] line-clamp-2">{creator.bio}</p>
        )}

        <div className="flex gap-2">
          <TipButton creator={creator} />
          <Link
            href={`/profile/${creator.user.id}`}
            className="rounded-full border border-[var(--color-line)] px-4 py-2.5 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
