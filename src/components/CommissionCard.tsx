"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface CommissionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  turnaround: string | null;
  portfolio: string;
  requestCount: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const CATEGORIES: Record<string, { label: string; color: string; icon: string }> = {
  fanart: { label: "Fan Art", color: "#8a5cff", icon: "🎨" },
  cosplay: { label: "Cosplay", color: "#ff2d78", icon: "📸" },
  music: { label: "Music", color: "#29f2e0", icon: "🎵" },
  editing: { label: "Editing", color: "#ffb020", icon: "✂️" },
  other: { label: "Other", color: "#3b82f6", icon: "✨" },
};

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CommissionCard({ item, index = 0 }: { item: CommissionItem; index?: number }) {
  const [imgError, setImgError] = useState(false);
  const cat = CATEGORIES[item.category] || CATEGORIES.other;

  let portfolioImages: string[] = [];
  try {
    portfolioImages = JSON.parse(item.portfolio || "[]");
  } catch {}

  const previewImages = portfolioImages.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.06, ease: CARD_EASE }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link href={`/commissions/${item.id}`} className="block h-full">
        <div
          className="card-glow relative h-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]"
          style={{ "--glow-color": cat.color } as React.CSSProperties}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0a0a14]">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                onError={() => setImgError(true)}
                className={`object-cover transition-transform duration-700 group-hover:scale-110 ${imgError ? "opacity-0" : ""}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/20 to-[var(--color-magenta)]/20">
                <span className="text-5xl opacity-60">{cat.icon}</span>
              </div>
            )}

            {imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
                <span className="text-5xl opacity-80">{cat.icon}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="award-sheen" />

            <span
              className="glass-badge absolute left-2.5 top-2.5 flex items-center gap-1"
              style={{ color: cat.color, borderColor: `color-mix(in srgb, ${cat.color} 40%, transparent)` }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </span>

            {item.requestCount > 0 && (
              <span className="absolute right-2.5 top-2.5 rounded-full bg-[var(--color-magenta)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--color-magenta)] backdrop-blur-md">
                {item.requestCount} request{item.requestCount !== 1 ? "s" : ""}
              </span>
            )}

            {previewImages.length > 0 && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                {previewImages.map((img, i) => (
                  <div key={i} className="h-8 w-8 overflow-hidden rounded-md border border-white/20">
                    <Image src={img} alt="Portfolio" width={32} height={32} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-col gap-2 p-3.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-display text-sm font-bold text-[var(--color-ink)] transition-colors group-hover:text-white">
                {item.title}
              </h3>
            </div>

            <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--color-mute)]">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {item.priceMin != null && item.priceMax != null && (
                <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  {formatPrice(item.priceMin)} - {formatPrice(item.priceMax)}
                </span>
              )}
              {item.priceMin != null && item.priceMax == null && (
                <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  From {formatPrice(item.priceMin)}
                </span>
              )}
              {item.turnaround && (
                <span className="rounded-md bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[10px] text-[var(--color-cyan)]">
                  {item.turnaround}
                </span>
              )}
            </div>

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
              <span className="text-[9px] text-[var(--color-mute)]/70">{timeAgo(item.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
