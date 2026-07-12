"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { TIERS, getTierColor } from "@/lib/tierlist";

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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{tierList.title}</h1>
            {tierList.description && (
              <p className="mt-1 text-sm text-[var(--color-mute)]">{tierList.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-mute)]">
              <Link href={`/profile/${tierList.user.id}`} className="flex items-center gap-1.5 hover:text-[var(--color-cyan)] transition-colors">
                {tierList.user.avatar && (
                  <div className="relative h-5 w-5 overflow-hidden rounded-full">
                    <Image src={tierList.user.avatar} alt="" fill className="object-cover" sizes="20px" />
                  </div>
                )}
                <span>{tierList.user.username}</span>
              </Link>
              <span>{formatDate(tierList.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              disabled={voting}
              className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
              </svg>
              <span className="font-semibold">{tierList.voteCount}</span>
            </button>
            <button
              onClick={() => handleVote(-1)}
              disabled={voting}
              className="rounded-lg border border-[var(--color-line)] px-4 py-2.5 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tier Rows */}
      <div className="space-y-2">
        {TIERS.map((tierData) => {
          const tierItems = getTierItems(tierData.tier);
          return (
            <div
              key={tierData.tier}
              className="flex rounded-xl border border-[var(--color-line)] overflow-hidden"
            >
              <div
                className="flex w-16 shrink-0 items-center justify-center"
                style={{ backgroundColor: tierData.color + "30" }}
              >
                <span className="text-xl font-black" style={{ color: tierData.color }}>
                  {tierData.label}
                </span>
              </div>
              <div className="flex flex-1 flex-wrap gap-2 p-2 min-h-[64px] bg-[var(--color-panel)]">
                {tierItems.length === 0 ? (
                  <span className="text-xs text-[var(--color-mute)] py-3 px-2">No items</span>
                ) : (
                  tierItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/anime/${item.mediaId}`}
                      className="group flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] p-1 pr-2 hover:border-[var(--color-cyan)] transition-colors"
                    >
                      {item.mediaImage && (
                        <div className="relative h-9 w-6 shrink-0 overflow-hidden rounded">
                          <Image src={item.mediaImage} alt="" fill className="object-cover" sizes="24px" />
                        </div>
                      )}
                      <span className="max-w-[120px] truncate text-xs font-medium">{item.mediaTitle}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
