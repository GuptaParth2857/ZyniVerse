"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ClubCardProps {
  club: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    coverImage?: string | null;
    category: string;
    memberCount: number;
    isPrivate: boolean;
    owner: { id: string; username: string; avatar?: string | null };
    _count?: { members: number; posts: number };
  };
  index?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  fan_club: "Fan Club",
  discussion: "Discussion",
  watching: "Watching",
  reading: "Reading",
  region: "Region",
  language: "Language",
  other: "Other",
};

export default function ClubCard({ club, index = 0 }: ClubCardProps) {
  const memberCount = club.memberCount ?? club._count?.members ?? 0;
  const postCount = club._count?.posts ?? 0;

  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <Link
        href={`/clubs/${club.slug}`}
        className="neon-rgb-border flex h-full flex-col overflow-hidden rounded-2xl bg-[var(--color-panel)] no-underline"
      >
        {club.coverImage ? (
          <div className="relative h-28 w-full overflow-hidden">
            <div
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
              style={{ background: `url(${club.coverImage}) center/cover` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-br from-[var(--color-violet)]/25 via-transparent to-[var(--color-magenta)]/15" />
        )}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start gap-3">
            {club.icon && club.icon.startsWith("http") ? (
              <div
                className="h-11 w-11 shrink-0 rounded-xl overflow-hidden ring-1 ring-[var(--color-cyan)]/30"
                style={{ background: `url(${club.icon}) center/cover` }}
              />
            ) : club.icon ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-lg ring-1 ring-white/10">
                {club.icon}
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-lg font-bold text-black ring-1 ring-white/10">
                {club.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate font-display text-sm font-bold transition-colors group-hover:text-[var(--color-cyan)]">
                {club.name}
              </h3>
              <p className="mt-0.5 truncate text-[10px] text-[var(--color-mute)]">
                by {club.owner.username}
              </p>
            </div>
          </div>
          {club.description && (
            <p className="mt-3 text-xs text-[var(--color-mute)] line-clamp-2">{club.description}</p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
            <span className="rounded-full bg-[var(--color-cyan)]/15 px-2.5 py-0.5 text-[9px] font-medium text-[var(--color-cyan)] ring-1 ring-[var(--color-cyan)]/20">
              {CATEGORY_LABELS[club.category] || club.category}
            </span>
            {club.isPrivate && (
              <span className="rounded-full bg-[var(--color-magenta)]/15 px-2.5 py-0.5 text-[9px] font-medium text-[var(--color-magenta)] ring-1 ring-[var(--color-magenta)]/20">
                Private
              </span>
            )}
            <span className="ml-auto flex items-center gap-2 text-[10px] text-[var(--color-mute)]">
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                {memberCount}
              </span>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 5h16v14H4z" /><path d="M4 9h16" />
                </svg>
                {postCount}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
