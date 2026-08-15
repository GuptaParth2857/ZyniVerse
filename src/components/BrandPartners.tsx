"use client";

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

function PartnerTile({ p, index }: { p: Partner; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={p.href}
        title={p.desc}
        className="group relative flex aspect-square w-[112px] flex-col items-center justify-center gap-2 rounded-2xl neon-rgb-border bg-[var(--color-surface1)]/60 p-2.5 transition-all hover:bg-[var(--color-surface2)]/60 hover:-translate-y-0.5"
      >
        <span
          className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] text-xl"
          style={{ boxShadow: `0 0 12px ${p.color}22` }}
        >
          {p.logo ? (
            <Image src={p.logo} alt={`${p.name} logo`} fill sizes="44px" className="object-cover" />
          ) : (
            p.emoji
          )}
        </span>
        <p className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-[var(--color-ink)]">
          {p.name}
        </p>
        <span
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
          style={{ background: p.statusColor, boxShadow: `0 0 6px ${p.statusColor}` }}
        />
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
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
                Community Partners
                <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface1)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--color-mute)]">
                  {partners.length} partners
                </span>
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            {partners.map((p, i) => (
              <PartnerTile key={p.name} p={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
