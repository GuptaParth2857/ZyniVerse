"use client";

import { useState } from "react";
import Image from "next/image";

export interface MomentCardProps {
  quote: string;
  character: string;
  animeTitle: string;
  animeCover?: string | null;
  episode?: string | number | null;
  timestamp?: string | null;
  animeId?: number;
  style?: string;
}

const PROXY = "/api/proxy-image?url=";

export default function MomentCard({
  quote,
  character,
  animeTitle,
  animeCover,
  episode,
  timestamp,
  style = "classic",
}: MomentCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const hasCover = !!animeCover && !coverFailed;

  return (
    <div className="relative w-full max-w-[600px] aspect-[3/4] overflow-hidden rounded-2xl select-none neon-rgb-border">
      {hasCover ? (
        <>
          <Image
            src={`${PROXY}${encodeURIComponent(animeCover!)}`}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 600px) 100vw, 600px"
            onError={() => setCoverFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          style === "sakura" ? "from-pink-900/40 via-[#1a0a2e] to-black"
          : style === "neon" ? "from-[#0a0a2e] via-[#0a1a3e] to-[#0a0a2e]"
          : "from-[var(--color-void)] via-[#1a0a2e] to-[var(--color-void)]"
        }`} />
      )}

      {/* Logo */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-2 py-1 border border-white/10">
          <Image src="/logo.png" alt="" width={16} height={16} className="h-4 w-4 object-contain rounded-full" />
          <span className="text-[10px] font-bold tracking-wider text-white/80">ZV</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 sm:px-14 text-center">
        <p className="text-lg sm:text-2xl md:text-3xl leading-relaxed font-light italic text-white/90 drop-shadow-lg max-w-[90%]">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="mt-5 w-12 h-[1px] bg-white/30" />
        <p className="mt-4 text-sm sm:text-base font-bold text-white/80 tracking-wide">
          &mdash; {character}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-mono text-white/40 flex-wrap">
          {animeTitle && <span>{animeTitle}</span>}
          {episode && <><span className="opacity-30">|</span><span>Ep. {episode}</span></>}
          {timestamp && <><span className="opacity-30">|</span><span>{timestamp}</span></>}
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-3 left-0 right-0 z-10 text-center">
        <span className="text-[8px] font-medium tracking-[0.2em] uppercase text-white/15">
          ZyniVerse &mdash; Anime for Everyone
        </span>
      </div>
    </div>
  );
}
