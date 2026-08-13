"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Partner = {
  name: string;
  desc: string;
  href: string;
  emoji: string;
  color: string;
  status: string;
  statusColor: string;
  logo?: string;
};

const partners: Partner[] = [
  {
    name: "AnimeSoul Official",
    desc: "Dedicated anime community page — daily reels, edits, news and fan content from the anime world.",
    href: "https://www.instagram.com/theanimesoulofficial/",
    logo: "/partners/animesoulofficial.jpg",
    emoji: "🤝",
    color: "#29f2e0",
    status: "Community Partner",
    statusColor: "#22c55e",
  },
  {
    name: "Anime Vortex",
    desc: "Manga, anime and manhwa recommendations — daily recs and updates every week.",
    href: "https://www.instagram.com/vort.exme/",
    logo: "/partners/anime-vortex.jpg",
    emoji: "🌀",
    color: "#a855f7",
    status: "Community Partner",
    statusColor: "#22c55e",
  },
  {
    name: "Voice of Viishu",
    desc: "Anime in Hindi — dubbing clips, voice-over reels and dialogues brought to life in Hindi.",
    href: "https://www.instagram.com/voice_of_viishu/",
    logo: "/partners/voice-of-viishu.jpg",
    emoji: "🎙️",
    color: "#f472b6",
    status: "Community Partner",
    statusColor: "#22c55e",
  },
];

function PartnerCard({ p, index }: { p: Partner; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        ref={ref}
        href={p.href}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="neon-premium block rounded-[20px]"
        style={{ transition: "transform 0.2s ease-out" }}
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-8 rounded-full" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}88` }} />
            <span
              className="ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: p.statusColor, borderColor: `${p.statusColor}55`, background: `${p.statusColor}11` }}
            >
              {p.status}
            </span>
          </div>
          <span
            className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)] text-2xl"
            style={{ boxShadow: `0 0 16px ${p.color}22` }}
          >
            {p.logo ? (
              <Image src={p.logo} alt={`${p.name} logo`} fill sizes="56px" className="object-cover" />
            ) : (
              p.emoji
            )}
          </span>
          <p className="mt-3 font-display text-lg font-bold text-[var(--color-ink)]">{p.name}</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">{p.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BrandPartners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="neon-premium rounded-[20px]">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between">
            <div className="rounded-xl px-4 py-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Community</p>
              <h2 className="font-display text-2xl font-bold">Community Partners</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {partners.map((p, i) => (
              <PartnerCard key={p.name} p={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
