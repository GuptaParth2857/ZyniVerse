"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import type { CharacterBasic } from "@/lib/anilist";

export function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 60%, 50%)`;
}

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

export function CharCard({ c, rank, index = 0 }: { c: CharacterBasic; rank?: number; index?: number }) {
  const color = hashColor(c.name?.full);
  const anime = c.media?.edges?.[0];
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) scale(1.03)`;
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 12) * 0.05, ease: CARD_EASE }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[16px]"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.72)" }} />
      <Link href={`/character/${c.id}`} className="neon-premium-content group block">
        <div className="relative overflow-hidden rounded-[16px]">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a14]">
            <Image src={c.image?.large || c.image?.medium || ""} alt={c.name?.full || ""} fill className="object-cover transition-all duration-500 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 25vw" />
            {rank != null && (
              <div
                className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/75 backdrop-blur px-2 py-0.5 text-[9px] font-bold border"
                style={{ color, borderColor: color, boxShadow: `0 0 12px -2px ${color}88` }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span>{rank}</span>
              </div>
            )}
            {anime && (
              <div className="absolute top-2 right-2 z-10 rounded-full bg-black/75 backdrop-blur px-2 py-0.5">
                <span className="text-[8px] font-semibold uppercase tracking-wider text-white/70">{anime.characterRole}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[13px] font-bold text-white/90 truncate leading-tight group-hover:text-white transition-colors">{c.name?.full}</p>
          {anime && (
            <div className="flex items-center gap-1.5">
              <div className="relative h-4 w-3 rounded overflow-hidden shrink-0 ring-1 ring-white/10">
                <Image src={anime.node.coverImage?.medium || ""} alt="" fill className="object-cover" sizes="12px" />
              </div>
              <p className="text-[10px] text-white/40 truncate leading-tight">{bestTitle(anime.node.title)}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-white/30 pt-0.5">
            {c.favourites != null && (
              <span className="flex items-center gap-1" style={{ color }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                {c.favourites.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${color}22, transparent 60%)` }}
        />
      </Link>
    </motion.div>
  );
}
