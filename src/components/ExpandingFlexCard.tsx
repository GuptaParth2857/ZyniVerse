"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";

export default function ExpandingFlexCard({ items }: { items: Media[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex h-[400px] gap-2 w-full">
      {items.slice(0, 8).map((item) => {
        const isHovered = hovered === item.id;
        const flex = isHovered ? "flex-[3]" : "flex-1";

        return (
          <motion.div
            key={item.id}
            layout
            animate={{ flex: isHovered ? 3 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] cursor-pointer group"
            style={{ minWidth: 0 }}
          >
            <Link
              href={item.type === "MANGA" ? `/manga/${item.id}` : `/anime/${item.id}`}
              className="block h-full w-full"
            >
              {/* Background image */}
              <Image
                src={item.coverImage?.extraLarge || item.coverImage?.large || ""}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {!isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
              )}

              {/* Collapsed label (always visible) */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <motion.p
                  animate={{ opacity: isHovered ? 0 : 1 }}
                  className="font-display text-xs font-bold leading-tight [writing-mode:vertical-lr] rotate-180 truncate"
                >
                  {bestTitle(item.title)}
                </motion.p>
              </div>

              {/* Expanded content */}
              <motion.div
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 bottom-0 p-5"
              >
                <p className="font-display text-lg font-bold leading-tight drop-shadow-lg">
                  {bestTitle(item.title)}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-mute)]">
                  {item.averageScore ? (
                    <span className="text-[var(--color-cyan)]">★ {(item.averageScore / 10).toFixed(1)}</span>
                  ) : null}
                  {item.episodes ? <span>{item.episodes} ep</span> : null}
                  {item.format ? <span className="text-[10px] uppercase">{item.format}</span> : null}
                  {item.seasonYear ? <span>{item.seasonYear}</span> : null}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.genres?.slice(0, 3).map((g) => (
                    <span key={g}
                      className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] backdrop-blur"
                    >{g}</span>
                  ))}
                </div>

                {item.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--color-mute)] leading-relaxed">
                    {item.description.replace(/<[^>]*>/g, "").slice(0, 150)}
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

              {/* Number badge */}
              <div className="absolute left-3 top-3">
                <span className="font-mono text-[10px] font-bold text-white/40">
                  {(items.indexOf(item) + 1).toString().padStart(2, "0")}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
