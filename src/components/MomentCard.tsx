"use client";

import Image from "next/image";

export interface MomentCardProps {
  quote: string;
  character: string;
  animeTitle: string;
  animeCover?: string | null;
  episode?: string | number | null;
  timestamp?: string | null;
  animeId?: number;
}

export default function MomentCard({
  quote,
  character,
  animeTitle,
  animeCover,
  episode,
  timestamp,
}: MomentCardProps) {
  return (
    <div className="relative w-[600px] h-[800px] overflow-hidden rounded-2xl select-none">
      {/* Background */}
      {animeCover ? (
        <>
          <Image
            src={animeCover}
            alt=""
            fill
            className="object-cover"
            sizes="600px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[#1a0a2e] to-[var(--color-void)]" />
      )}

      {/* Top-right branding badge */}
      <div className="absolute top-5 right-5 z-10">
        <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 px-3 py-1.5">
          <div className="relative h-5 w-5">
            <Image src="/logo.png" alt="" width={20} height={20} className="object-contain" />
          </div>
          <span className="text-xs font-bold text-white/90 tracking-wider">ZyniVerse</span>
        </div>
      </div>

      {/* Quote content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-center">
        <div className="max-w-[480px]">
          <p className="text-2xl leading-relaxed font-light italic text-white/95 drop-shadow-lg before:content-['\201C'] before:text-4xl before:opacity-40 before:block before:-mb-2">
            {quote}
          </p>
          <div className="mt-6 space-y-1">
            <p className="text-base font-bold text-white/80 tracking-wide">
              — {character}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-white/50 font-mono">
              {animeTitle && <span>{animeTitle}</span>}
              {episode && <><span className="opacity-30">·</span><span>Ep. {episode}</span></>}
              {timestamp && <><span className="opacity-30">·</span><span>{timestamp}</span></>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer watermark */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="border-t border-white/10 mx-8" />
        <div className="flex items-center justify-center gap-2 px-8 py-4">
          <span className="text-[10px] font-medium text-white/30 tracking-[0.2em] uppercase">
            ✦ ZyniVerse — Anime for Everyone
          </span>
        </div>
      </div>
    </div>
  );
}
