"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface CosplayCardProps {
  cosplay: {
    id: string;
    title: string;
    character: string;
    animeTitle: string;
    imageUrl: string;
    likes: number;
    createdAt: string;
    tags?: string;
    user: { id: string; username: string; avatar: string | null };
  };
  onLike?: () => void;
  liked?: boolean;
  index?: number;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function CosplayCard({ cosplay, onLike, liked, index = 0 }: CosplayCardProps) {
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

  const tags = cosplay.tags
    ? cosplay.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="break-inside-avoid mb-4 group"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <Link href={`/cosplay/${cosplay.id}`} className="block neon-premium rounded-xl no-underline">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content">
          {/* Image Section */}
          <div className="relative overflow-hidden rounded-t-xl">
            {cosplay.imageUrl ? (
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={cosplay.imageUrl}
                  alt={cosplay.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
                  <span className="glass-badge text-[var(--color-cyan)]">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    COSPLAY
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike?.(); }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
                      liked
                        ? "bg-red-500/30 border border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)] scale-110"
                        : "bg-black/40 border border-white/10 text-white/70 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 space-y-1.5">
                  <h3 className="font-display text-sm font-bold leading-tight text-white drop-shadow-lg line-clamp-2">
                    {cosplay.character}
                  </h3>
                  <p className="text-[11px] text-white/60 truncate">{cosplay.animeTitle}</p>
                </div>

                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center bg-[var(--color-void)] text-sm text-[var(--color-mute)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-3 space-y-2">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--color-cyan)]/10 px-1.5 py-0.5 text-[8px] font-medium text-[var(--color-cyan)] ring-1 ring-[var(--color-cyan)]/15">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* User + Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-[var(--color-void)] ring-1 ring-white/10">
                  {cosplay.user.avatar ? (
                    <Image src={cosplay.user.avatar} alt="" fill className="object-cover" sizes="20px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[8px] font-bold text-[var(--color-cyan)]">
                      {cosplay.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[var(--color-mute)] truncate">{cosplay.user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-mute)]">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {timeAgo(cosplay.createdAt)}
                </span>
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${liked ? "text-red-400" : "text-[var(--color-mute)]"}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {cosplay.likes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
