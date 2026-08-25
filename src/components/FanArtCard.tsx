"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

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

const ART_TYPES = [
  { value: "", label: "All Types" },
  { value: "digital", label: "🎨 Digital" },
  { value: "traditional", label: "🖌️ Traditional" },
  { value: "sketch", label: "✏️ Sketch" },
  { value: "manga", label: "📖 Manga" },
  { value: "pixel", label: "👾 Pixel Art" },
];

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

export default function FanArtCard({ item, index = 0 }: { item: FanArtItem; index?: number }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/fanart/${item.id}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 12) * 0.05, ease: CARD_EASE }}
    >
      <Link href={`/fanart/${item.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--color-panel)] transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_0_20px_-8px_rgba(192,38,255,0.25)]">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#0a0a14]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Art Type Badge */}
            <div className="absolute top-2 left-2">
              <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-medium text-white/80 backdrop-blur">
                {ART_TYPES.find((t) => t.value === item.artType)?.label?.split(" ")[0] || "🎨"} {item.artType}
              </span>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                liked
                  ? "bg-[var(--color-magenta)] text-black"
                  : "bg-black/40 text-white/70 hover:bg-[var(--color-magenta)]/20 hover:text-[var(--color-magenta)]"
              } backdrop-blur`}
            >
              <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-sm font-semibold text-white/80 line-clamp-1 group-hover:text-white transition-colors">
              {item.title}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[10px] text-[var(--color-mute)]">
                {item.animeTitle || "Original"}
                {item.character && ` • ${item.character}`}
              </p>
              <span className="text-[10px] text-[var(--color-mute)]">♥ {likes}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-[7px] font-bold text-black">
                {item.user.username[0].toUpperCase()}
              </div>
              <span className="text-[9px] text-[var(--color-mute)]">{item.user.username}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
