"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORY_STYLES: Record<string, string> = {
  "Dub Release": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Announcement: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Schedule: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Industry: "bg-white/10 text-[var(--color-mute)] border-white/20",
};

interface NewsDeskCardProps {
  slug: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  index?: number;
}

export default function NewsDeskCard({ slug, title, category, summary, publishedAt, index = 0 }: NewsDeskCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.015)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min((index % 6) * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group h-full"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="relative h-full rounded-[24px]">
        <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
              animation: "spin 6s linear infinite",
              willChange: "transform",
            }}
          />
          <span className="absolute inset-[1.5px] rounded-[22.5px] neon-border-inner" />
        </div>
        <Link href={`/news/desk/${slug}`} className="relative z-10 group block h-full rounded-[24px] p-5">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[category] || CATEGORY_STYLES.Industry}`}>
              {category}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--color-mute)]">
              {new Date(publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <p className="mt-2.5 line-clamp-2 font-display text-sm font-bold leading-snug text-white group-hover:text-[var(--color-cyan)] transition-colors">
            {title}
          </p>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--color-mute)]">{summary}</p>
        </Link>
      </div>
    </motion.div>
  );
}