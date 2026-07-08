"use client";

import Link from "next/link";
import Image from "next/image";

interface TierListCardData {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  itemCount: number;
  voteCount: number;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TierListCard({ tierList }: { tierList: TierListCardData }) {
  return (
    <Link
      href={`/tierlist/${tierList.id}`}
      className="block rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-cyan)] transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{tierList.title}</h3>
          {tierList.description && (
            <p className="mt-0.5 text-xs text-[var(--color-mute)] line-clamp-2">{tierList.description}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-mute)]">
        <div className="flex items-center gap-2">
          {tierList.user.avatar ? (
            <div className="relative h-5 w-5 overflow-hidden rounded-full">
              <Image src={tierList.user.avatar} alt="" fill className="object-cover" sizes="20px" />
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-[var(--color-line)]" />
          )}
          <span>{tierList.user.username}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{tierList.itemCount} items</span>
          <span>{tierList.voteCount} votes</span>
          <span>{formatDate(tierList.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
