"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { TIERS } from "@/lib/tierlist";

interface TierListItem {
  id: string;
  tier: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  order: number;
}

interface TierListUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface TierListData {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  userId: string;
  user: TierListUser;
  items: TierListItem[];
  voteCount: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TierListDisplay({ tierList: initial }: { tierList: TierListData }) {
  const { data: session } = useSession();
  const [tierList, setTierList] = useState(initial);
  const [voting, setVoting] = useState(false);

  function getTierItems(tier: string) {
    return tierList.items.filter((i) => i.tier === tier).sort((a, b) => a.order - b.order);
  }

  async function handleVote(vote: number) {
    if (!session?.user?.id || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/tierlist/${tierList.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      if (res.ok) {
        const data = await res.json();
        setTierList((prev) => ({ ...prev, voteCount: data.total }));
      }
    } catch (e) {
      console.error(e);
    }
    setVoting(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Header card */}
      <div className="neon-premium rounded-[20px] mb-4">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--color-cyan)]">
                  Anime Tier List
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{tierList.title}</h1>
              {tierList.description && (
                <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-mute)] max-w-2xl leading-relaxed line-clamp-2">
                  {tierList.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-mute)]">
                <Link
                  href={`/profile/${tierList.user.id}`}
                  className="flex items-center gap-2 hover:text-[var(--color-cyan)] transition-colors font-medium"
                >
                  {tierList.user.avatar ? (
                    <div className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-[rgba(10,10,15,0.8)]">
                      <Image src={tierList.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)]" />
                  )}
                  <span>{tierList.user.username}</span>
                </Link>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
                  {tierList.items.length} anime
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formatDate(tierList.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-stretch">
              {session?.user?.id === tierList.userId && (
                <Link
                  href={`/tierlist/${tierList.id}/edit`}
                  className="flex items-center justify-center gap-1.5 rounded-lg neon-rgb-border px-4 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-white/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </Link>
              )}
              <button
                onClick={() => handleVote(1)}
                disabled={voting}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /></svg>
                {tierList.voteCount}
              </button>
              <button
                onClick={() => handleVote(-1)}
                disabled={voting}
                className="rounded-lg neon-rgb-border px-3.5 py-2 text-xs hover:bg-white/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All tiers in one card */}
      <div className="neon-premium rounded-[20px]">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] overflow-hidden">
          {TIERS.map((tierData, idx) => {
            const tierItems = getTierItems(tierData.tier);
            return (
              <div
                key={tierData.tier}
                className={`flex flex-col sm:flex-row ${idx !== TIERS.length - 1 ? "border-b border-[var(--color-line)]" : ""}`}
              >
                <div
                  className="flex sm:w-20 shrink-0 items-center justify-center gap-2 sm:flex-col sm:gap-0.5 px-3 py-2 sm:py-3 sm:px-2 border-b sm:border-b-0 sm:border-r border-[var(--color-line)]"
                  style={{ background: tierData.color + "18" }}
                >
                  <span
                    className="text-2xl sm:text-3xl font-black leading-none"
                    style={{ color: tierData.color, textShadow: `0 0 14px ${tierData.color}66` }}
                  >
                    {tierData.label}
                  </span>
                  <span className="hidden sm:block text-[8px] uppercase tracking-wider text-[var(--color-mute)] text-center leading-tight px-1">
                    {tierData.description}
                  </span>
                </div>

                <div className="flex flex-1 flex-wrap items-start gap-2.5 p-3 sm:p-4 min-h-[92px]">
                  {tierItems.length === 0 ? (
                    <span className="text-[11px] text-[var(--color-mute)] py-2 px-1">No anime in this tier yet</span>
                  ) : (
                    tierItems.map((item) => (
                      <Link key={item.id} href={`/anime/${item.mediaId}`} className="group w-[68px] sm:w-[78px] no-underline">
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md neon-rgb-border bg-[var(--color-void)] transition-transform duration-300 group-hover:-translate-y-0.5">
                          {item.mediaImage ? (
                            <Image
                              src={item.mediaImage}
                              alt={item.mediaTitle}
                              fill
                              sizes="78px"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)]">
                              <span className="text-xs font-black" style={{ color: tierData.color }}>
                                {item.mediaTitle.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/70 to-transparent" />
                          <span
                            className="absolute top-0.5 left-0.5 rounded px-1 py-px text-[7px] font-black text-black shadow-md"
                            style={{ background: tierData.color }}
                          >
                            {tierData.label}
                          </span>
                        </div>
                        <p className="mt-1 text-[9px] font-medium text-[var(--color-mute)] group-hover:text-[var(--color-ink)] transition-colors line-clamp-1 text-center">
                          {item.mediaTitle}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
