"use client";

import Link from "next/link";
import Image from "next/image";
import TiltCard from "@/components/TiltCard";

interface UserListCardData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  isFeatured: boolean;
  likes: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  itemCount: number;
  coverImages: string[];
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

function CollageCell({ img, span }: { img: string; span?: string }) {
  return (
    <div className={`relative overflow-hidden ${span || ""}`}>
      <Image
        src={img}
        alt=""
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    </div>
  );
}

function Collage({ images, itemCount }: { images: string[]; itemCount: number }) {
  const imgs = images.slice(0, 4);
  const n = imgs.length;
  if (n === 0) return null;

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden">
      {n === 1 && (
        <CollageCell img={imgs[0]} span="absolute inset-0" />
      )}
      {n === 2 && (
        <div className="grid h-full w-full grid-cols-2 auto-rows-fr gap-0.5">
          {imgs.map((img, i) => (
            <CollageCell key={i} img={img} />
          ))}
        </div>
      )}
      {n === 3 && (
        <div className="grid h-full w-full grid-cols-2 auto-rows-fr gap-0.5">
          <CollageCell img={imgs[0]} span="row-span-2" />
          <CollageCell img={imgs[1]} />
          <CollageCell img={imgs[2]} />
        </div>
      )}
      {n >= 4 && (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
          {imgs.map((img, i) => (
            <CollageCell key={i} img={img} />
          ))}
        </div>
      )}
      {itemCount > imgs.length && (
        <div className="absolute bottom-1.5 right-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
          +{itemCount - imgs.length}
        </div>
      )}
    </div>
  );
}

export default function UserListCard({ list, index = 0 }: { list: UserListCardData; index?: number }) {
  const score = list.upvotes - list.downvotes;
  return (
    <TiltCard
      index={index}
      className="neon-premium rounded-[24px] h-full"
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <Link
        href={`/lists/${list.id}`}
        className="neon-premium-content group block overflow-hidden rounded-[24px] hover:-translate-y-1 transition-transform duration-300"
      >
        <Collage images={list.coverImages} itemCount={list.itemCount} />

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-sm font-bold leading-snug truncate">{list.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {list.category && (
                <span className="rounded-full bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-cyan)]">
                  {list.category}
                </span>
              )}
              {list.isFeatured && (
                <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                  ★ Featured
                </span>
              )}
            </div>
          </div>
          {list.description && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)] line-clamp-2">{list.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-[var(--color-line)]/60 pt-3 text-[11px] text-[var(--color-mute)]">
            <div className="flex items-center gap-1.5">
              {list.user.avatar ? (
                <div className="relative h-4 w-4 overflow-hidden rounded-full">
                  <Image src={list.user.avatar} alt="" fill className="object-cover" sizes="16px" />
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)]" />
              )}
              <span className="truncate max-w-[80px]">{list.user.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px]">{list.itemCount} items</span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={score > 0 ? "text-green-400" : ""}>
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span className={score > 0 ? "text-green-400" : score < 0 ? "text-red-400" : ""}>
                  {score > 0 ? `+${score}` : score}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
