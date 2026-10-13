"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";
import { STATUS_LABELS, STATUS_COLORS, getMediaTypeLabel, getMediaTypeColor } from "@/lib/manga";

interface MangaEntryCard {
  id: string;
  mediaId: number;
  title: string;
  coverImage?: string | null;
  subType?: string;
  status: string;
  chapters: number;
  totalChapters?: number | null;
  score?: number | null;
}

interface Props {
  manga: Media | MangaEntryCard;
  entry?: MangaEntryCard;
  showProgress?: boolean;
  href?: string;
  index?: number;
}

function isEntry(manga: Media | MangaEntryCard): manga is MangaEntryCard {
  return "mediaId" in manga;
}

export default function MangaCard({ manga, entry, showProgress = true, href, index = 0 }: Props) {
  const title = isEntry(manga) ? manga.title : bestTitle(manga.title);
  const cover = isEntry(manga)
    ? (manga.coverImage || "")
    : (manga.coverImage?.large || manga.coverImage?.extraLarge || "");
  const status = entry?.status || "PLANNING";
  const chapters = entry?.chapters ?? 0;
  const total = entry?.totalChapters ?? (!isEntry(manga) ? manga.chapters : undefined);
  const score = entry?.score ?? (!isEntry(manga) ? manga.averageScore : undefined);
  const id = isEntry(manga) ? manga.mediaId : manga.id;
  const format = !isEntry(manga) ? manga.format : undefined;
  const subType = entry?.subType;

  const linkHref = href || (subType === "light_novel" ? `/light-novels/${id}` : `/manga/${id}`);

  const progress = total && total > 0 ? Math.min(100, Math.round((chapters / total) * 100)) : 0;

  const reduce = useReducedMotion() ?? false;

  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : Math.min(index, 12) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <Link
        href={linkHref}
        className="neon-rgb-border relative block h-full rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-8px_var(--color-violet)]"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] text-3xl opacity-50">
              📖
            </div>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          {score ? (
            <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono font-semibold text-white">
              ★ {(score / 10).toFixed(1)}
            </span>
          ) : null}
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: STATUS_COLORS[status] || "var(--color-mute)", color: "#000" }}
          >
            {STATUS_LABELS[status] || status}
          </span>
          {(subType && subType !== "manga") || format === "NOVEL" ? (
            <span
              className="absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: subType ? getMediaTypeColor(subType) : "var(--color-cyan)", color: "#000" }}
            >
              {subType === "light_novel" || format === "NOVEL" ? "LN" : subType ? getMediaTypeLabel(subType) : format}
            </span>
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">{title}</h3>
          {showProgress && total && total > 0 ? (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-[var(--color-mute)] mb-1">
                <span>{chapters} / {total} ch</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--color-line)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-violet)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : total ? (
            <p className="mt-1 text-[10px] text-[var(--color-mute)]">{chapters} / {total} chapters</p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
