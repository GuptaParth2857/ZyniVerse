"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ReportButton } from "@/components/ReportButton";
import { imgThumb } from "@/lib/img";

interface FanArtItem {
  id: string;
  title: string;
  description: string | null;
  animeTitle: string | null;
  character: string | null;
  imageUrl: string;
  artType: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const ART_TYPES: Record<string, { emoji: string; label: string; color: string }> = {
  digital: { emoji: "🎨", label: "Digital", color: "#8a5cff" },
  traditional: { emoji: "🖌️", label: "Traditional", color: "#29f2e0" },
  sketch: { emoji: "✏️", label: "Sketch", color: "#ffb020" },
  manga: { emoji: "📖", label: "Manga", color: "#ff2d78" },
  pixel: { emoji: "👾", label: "Pixel", color: "#3b82f6" },
};

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function formatLikes(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(dateStr: string) {
  const then = new Date(dateStr).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function FanArtCard({ item, index = 0, liked = false, onLike }: {
  item: FanArtItem;
  index?: number;
  liked?: boolean;
  onLike?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const [imgError, setImgError] = useState(false);

  const type = ART_TYPES[item.artType] || ART_TYPES.digital;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return;
    // The gallery owns the like state (it seeds it from /api/fanart/likes and
    // updates the count), so this only delegates back up.
    onLike?.(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.06, ease: CARD_EASE }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link href={`/fanart/${item.id}`} className="block h-full">
        <div
          className="card-glow relative h-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]"
          style={{ "--glow-color": type.color } as React.CSSProperties}
        >
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a14]">
            <Image
              src={imgThumb(item.imageUrl, 720)}
              alt={item.title}
              fill
              onError={() => setImgError(true)}
              className={`object-cover transition-transform duration-700 group-hover:scale-110 ${imgError ? "opacity-0" : ""}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
                <span className="text-5xl opacity-80">🎨</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Shine sweep */}
            <div className="award-sheen" />

            {/* Art Type Badge */}
            <span className="glass-badge absolute left-2.5 top-2.5 flex items-center gap-1" style={{ color: type.color, borderColor: `color-mix(in srgb, ${type.color} 40%, transparent)` }}>
              <span>{type.emoji}</span>
              {type.label}
            </span>

            {/* Like Button */}
            <button
              onClick={handleLike}
              aria-label={liked ? "Unlike this fan art" : "Like this fan art"}
              aria-pressed={liked}
              className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 ${
                liked
                  ? "bg-[var(--color-magenta)] text-white shadow-[0_0_16px_-2px_var(--color-magenta)]"
                  : "bg-black/40 text-white/80 hover:bg-[var(--color-magenta)]/25 hover:text-[var(--color-magenta)]"
              }`}
            >
              <motion.svg
                key={liked ? "yes" : "no"}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="h-4 w-4"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </motion.svg>
            </button>
          </div>

          {/* Info */}
          <div className="relative z-10 flex flex-col gap-2 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-display text-sm font-bold text-[var(--color-ink)] transition-colors group-hover:text-white">
                {item.title}
              </h3>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[var(--color-magenta)]">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {formatLikes(item.likes)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-mute)]">
              <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10M12 3v6m-4-2 4 2 4-2M5 21h14v-9a7 7 0 10-14 0v9z" />
              </svg>
              <span className="line-clamp-1">{item.animeTitle || "OC — Original Art"}</span>
            </div>

            {(item.character || item.tags) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {item.character && (
                  <span className="glass-tag !px-2 !py-0.5 !text-[10px]">
                    <span className="font-semibold" style={{ color: "var(--color-cyan)" }}>✦</span> {item.character}
                  </span>
                )}
                {item.tags &&
                  item.tags.split(",").slice(0, 2).filter(Boolean).map((t) => (
                    <span key={t} className="glass-tag !px-2 !py-0.5 !text-[10px]">#{t.trim()}</span>
                  ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)]">
                  {item.user.avatar ? (
                    <Image src={item.user.avatar} alt={item.user.username} fill className="object-cover" />
                  ) : (
                    <span className="text-[8px] font-bold text-black">{item.user.username[0]?.toUpperCase()}</span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-[var(--color-mute)]">{item.user.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--color-mute)]/70">{timeAgo(item.createdAt)}</span>
                <ReportButton
                  contentType="FANART"
                  contentId={item.id}
                  authorId={item.user.id}
                  label=""
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
