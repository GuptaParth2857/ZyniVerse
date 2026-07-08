"use client";

import Link from "next/link";
import Image from "next/image";

interface UserListCardData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isFeatured: boolean;
  likes: number;
  createdAt: string;
  itemCount: number;
  coverImages: string[];
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export default function UserListCard({ list }: { list: UserListCardData }) {
  const cols = Math.min(list.coverImages.length, 4);
  const gridCols = cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-2";

  return (
    <Link
      href={`/lists/${list.id}`}
      className="group block rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-cyan)] transition-all hover:-translate-y-0.5"
    >
      {list.coverImages.length > 0 ? (
        <div className={`grid ${gridCols} gap-0.5 aspect-[3/2] overflow-hidden`}>
          {list.coverImages.slice(0, 4).map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-[3/2] flex items-center justify-center bg-[var(--color-void)]">
          <span className="text-[var(--color-mute)] text-sm">No items yet</span>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{list.title}</h3>
          {list.isFeatured && (
            <span className="shrink-0 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
              Featured
            </span>
          )}
        </div>
        {list.description && (
          <p className="mt-0.5 text-xs text-[var(--color-mute)] line-clamp-2">{list.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-mute)]">
          <div className="flex items-center gap-1.5">
            {list.user.avatar ? (
              <div className="relative h-4 w-4 overflow-hidden rounded-full">
                <Image src={list.user.avatar} alt="" fill className="object-cover" sizes="16px" />
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full bg-[var(--color-line)]" />
            )}
            <span className="truncate max-w-[80px]">{list.user.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{list.itemCount} items</span>
            <span>♥ {list.likes}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
