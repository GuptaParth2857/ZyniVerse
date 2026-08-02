"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { logError } from "@/lib/logger";

interface ProfileMoment {
  id: string;
  quote: string;
  character: string;
  animeTitle: string;
  animeCover: string | null;
  episode: string | null;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
}

export default function ProfileMoments({ userId }: { userId: string }) {
  const [moments, setMoments] = useState<ProfileMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/moments?userId=${userId}&limit=50`)
      .then((r) => r.json())
      .then((d) => { setMoments(d.moments || []); setLoading(false); })
      .catch((e) => { logError(e); setLoading(false); });
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-mute)] text-sm mb-3">No moments created yet.</p>
        <Link href="/moments/create" className="text-sm font-semibold hover:underline" style={{ color: "var(--color-cyan)" }}>
          Create your first moment →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {moments.map((m) => (
        <Link key={m.id} href={`/moments/${m.id}`} className="group">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-line)] hover:border-[var(--color-cyan)] transition-colors">
            {m.animeCover ? (
              <>
                <Image src={m.animeCover} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[#1a0a2e] to-[var(--color-void)]" />
            )}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-3 text-center">
              <p className="text-xs sm:text-sm leading-relaxed font-light italic text-white/90 line-clamp-3">
                &ldquo;{m.quote}&rdquo;
              </p>
              <p className="mt-2 text-[10px] sm:text-xs font-bold text-white/70">— {m.character}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-10 p-2 flex items-center justify-between">
              <span className="text-[9px] text-white/40 font-mono truncate max-w-[60%]">{m.animeTitle}</span>
              <span className="text-[9px] text-white/40">♥ {m.likesCount}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
