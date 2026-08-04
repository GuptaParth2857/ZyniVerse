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

/**
 * Scales like the generated PNG (600x800 canvas):
 * quote 4cqw, character 2.5cqw, meta 1.667cqw, logo 6.667cqw, watermark 1.333cqw
 */
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
    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl select-none neon-rgb-border [container-type:inline-size]">
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
      <div className="absolute z-10" style={{ top: "3cqw", right: "3.667cqw" }}>
        <div className="flex items-center gap-[1.5cqw] rounded-full bg-black/40 backdrop-blur-sm px-[2cqw] py-[1cqw] border border-white/10">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-[6.667cqw] w-[6.667cqw] rounded-full object-contain" />
          <span className="font-bold tracking-wider text-white/80" style={{ fontSize: "1.667cqw" }}>ZV</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[8cqw] text-center">
        <p className="italic font-light leading-relaxed text-white/90 drop-shadow-lg" style={{ fontSize: "4cqw", lineHeight: "5.667cqw" }}>
          &ldquo;{quote}&rdquo;
        </p>
        <div className="bg-white/30" style={{ width: "10cqw", height: "1px", marginTop: "3.667cqw" }} />
        <p className="font-bold tracking-wide text-white/80" style={{ fontSize: "2.5cqw", marginTop: "4.667cqw" }}>
          &mdash; {character}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[2cqw] font-mono text-white/40" style={{ fontSize: "1.667cqw", marginTop: "5cqw" }}>
          {animeTitle && <span>{animeTitle}</span>}
          {episode && <><span className="opacity-30">|</span><span>Ep. {episode}</span></>}
          {timestamp && <><span className="opacity-30">|</span><span>{timestamp}</span></>}
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute left-0 right-0 z-10 text-center" style={{ bottom: "3cqw" }}>
        <span className="font-medium tracking-[0.2em] uppercase text-white/15" style={{ fontSize: "1.333cqw" }}>
          ZyniVerse &mdash; Anime for Everyone
        </span>
      </div>
    </div>
  );
}
