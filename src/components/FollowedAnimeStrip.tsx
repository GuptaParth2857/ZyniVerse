"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function FollowedAnimeStrip() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<{ id: number; title: string; cover: string | null }[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/anime-follow");
        const { items } = await res.json();
        setItems((items || []).slice(0, 12));
      } catch { /* ignore */ }
    })();
  }, [status, session?.user?.id]);

  if (status !== "authenticated" || items.length === 0) return null;

  return (
    <div>
      <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
        <span className="h-1 w-4 rounded-full bg-[var(--color-cyan)]" />🔔 Following
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((m) => (
          <Link key={m.id} href={`/anime/${m.id}`} className="group shrink-0 w-24" title={m.title}>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
              {m.cover ? <Image src={m.cover} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" /> : <div className="h-full w-full bg-[var(--color-line)]" />}
            </div>
            <p className="mt-1.5 truncate text-[10px] text-[var(--color-mute)] group-hover:text-[var(--color-ink)] transition-colors">{m.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}