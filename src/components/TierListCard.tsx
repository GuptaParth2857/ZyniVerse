"use client";

import Link from "next/link";
import Image from "next/image";
import TiltCard from "@/components/TiltCard";

interface TierListPreviewItem {
  tier: string;
  mediaTitle: string;
  mediaImage: string | null;
}

interface TierListCardData {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  itemCount: number;
  voteCount: number;
  previewItems: TierListPreviewItem[];
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

const GRADIENT_PAIRS = [
  ["from-cyan-500/25", "to-violet-500/25"],
  ["from-fuchsia-500/25", "to-cyan-500/25"],
  ["from-violet-500/25", "to-amber-500/25"],
  ["from-emerald-500/25", "to-cyan-500/25"],
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TierListCard({ tierList, index = 0 }: { tierList: TierListCardData; index?: number }) {
  const previews = tierList.previewItems || [];
  const tiles: (TierListPreviewItem | null)[] = [...previews.slice(0, 4)];
  while (tiles.length < 4) tiles.push(null);

  return (
    <TiltCard index={index} className="h-full">
      <Link
        href={`/tierlist/${tierList.id}`}
        className="group block h-full rounded-2xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden transition-transform duration-300 hover:-translate-y-1 no-underline"
      >
      {/* Poster strip */}
      <div className="grid grid-cols-4 gap-1 p-1">
        {tiles.map((p, i) =>
          p?.mediaImage ? (
            <div key={i} className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <Image
                src={p.mediaImage}
                alt={p.mediaTitle || tierList.title}
                fill
                sizes="100px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.5)] via-transparent to-transparent" />
            </div>
          ) : (
            <div
              key={i}
              className={`aspect-[2/3] rounded-lg bg-gradient-to-br ${GRADIENT_PAIRS[i % GRADIENT_PAIRS.length]} flex items-center justify-center`}
            >
              <span className="text-lg font-black text-white/40">{tierList.title.charAt(0).toUpperCase()}</span>
            </div>
          )
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="font-display text-sm font-bold leading-snug line-clamp-1 group-hover:text-[var(--color-cyan)] transition-colors">
          {tierList.title}
        </h3>
        {tierList.description && (
          <p className="mt-1 text-[11px] text-[var(--color-mute)] leading-relaxed line-clamp-2">{tierList.description}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {tierList.user.avatar ? (
            <div className="relative h-5 w-5 overflow-hidden rounded-full ring-2 ring-[rgba(10,10,15,0.8)]">
              <Image src={tierList.user.avatar} alt="" fill sizes="20px" className="object-cover" />
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)]" />
          )}
          <span className="text-xs font-medium text-[var(--color-ink)] truncate">{tierList.user.username}</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-[var(--color-mute)]/80">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /></svg>
            {tierList.itemCount} items
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            {tierList.voteCount}
          </span>
          <span>{formatDate(tierList.createdAt)}</span>
        </div>
      </div>
      </Link>
    </TiltCard>
  );
}
