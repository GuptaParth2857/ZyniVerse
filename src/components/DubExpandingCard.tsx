"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { DubAnime } from "@/app/dubbed/page";

interface Props {
  items: DubAnime[];
}

const LANG_COLORS: Record<string, { bg: string; text: string }> = {
  English: { bg: "#3b82f622", text: "#3b82f6" },
  Hindi: { bg: "#ff993322", text: "#ff9933" },
  Tamil: { bg: "#e84a5f22", text: "#e84a5f" },
  Telugu: { bg: "#6c63ff22", text: "#6c63ff" },
};

export default function DubExpandingCard({ items }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:hidden -mx-4 px-4">
        {items.map((item, idx) => (
          <Link
            key={`${item.mal_id}-${idx}`}
            href={`/search?q=${encodeURIComponent(item.displayTitle || item.title)}`}
            className="relative w-[140px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--color-line)] group"
          >
            <div className="relative h-[210px] w-full">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="140px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-display text-sm font-bold leading-tight drop-shadow-lg line-clamp-2">
                {item.displayTitle || item.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
                {item.score && item.score !== "No Ratings" ? (
                  <span className="text-[var(--color-cyan)]">★ {item.score}</span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: expanding flex card */}
      <div className="hidden md:flex h-[380px] gap-2 w-full">
        {items.map((item, idx) => {
          const isHovered = hovered === item.mal_id;

          const langs: string[] = [];
          if (item.hasEnglish) langs.push("English");
          if (item.hasHindi) langs.push("Hindi");
          if (item.hasTamil) langs.push("Tamil");
          if (item.hasTelugu) langs.push("Telugu");

          return (
            <motion.div
              key={item.mal_id}
              layout
              animate={{ flex: isHovered ? 3 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onMouseEnter={() => setHovered(item.mal_id)}
              onMouseLeave={() => setHovered(null)}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] cursor-pointer group"
              style={{ minWidth: 0 }}
            >
              <Link
                href={`/search?q=${encodeURIComponent(item.displayTitle || item.title)}`}
                className="block h-full w-full"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                {!isHovered && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <motion.p
                    animate={{ opacity: isHovered ? 0 : 1 }}
                    className="font-display text-xs font-bold leading-tight [writing-mode:vertical-lr] rotate-180 truncate"
                  >
                    {item.displayTitle || item.title}
                  </motion.p>
                </div>

                <motion.div
                  initial={false}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 bottom-0 p-5"
                >
                  <p className="font-display text-lg font-bold leading-tight drop-shadow-lg">
                    {item.displayTitle || item.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    {item.score && item.score !== "No Ratings" ? (
                      <span className="text-[var(--color-cyan)]">★ {item.score}</span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.genres?.slice(0, 3).map((g) => (
                      <span key={g}
                        className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] backdrop-blur"
                      >{g}</span>
                    ))}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {langs.map((l) => {
                      const c = LANG_COLORS[l];
                      return (
                        <span key={l}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.text}44` }}
                        >{l}</span>
                      );
                    })}
                  </div>

                  {item.synopsis && (
                    <p className="mt-2 line-clamp-2 text-xs text-[var(--color-mute)] leading-relaxed">
                      {item.synopsis.replace(/<[^>]*>/g, "").slice(0, 150)}
                    </p>
                  )}

                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-magenta)]"
                  >
                    View Details →
                  </motion.span>
                </motion.div>

                <div className="absolute left-3 top-3">
                  <span className="font-mono text-[10px] font-bold text-white/40">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
