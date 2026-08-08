"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Program = {
  name: string;
  desc: string;
  href: string;
  logo: string;
  badge: string;
  color: string;
};

const programs: Program[] = [
  {
    name: "Google Student Ambassador Program",
    desc: "Student Ambassador, India — sharing the power of Gemini with campuses.",
    href: "",
    logo: "/partners/gemini.png",
    badge: "Powered by Gemini",
    color: "#29f2e0",
  },
  {
    name: "GeeksforGeeks Campus Mantri Program",
    desc: "Campus Mantri (Ambassador) — official campus representative of GeeksforGeeks.",
    href: "",
    logo: "/partners/gfg.svg",
    badge: "Campus Mantri",
    color: "#22c55e",
  },
  {
    name: "Physics Wallah Channel Partner",
    desc: "Official PW Channel Partner — helping students learn, grow and score.",
    href: "",
    logo: "/partners/pw.webp",
    badge: "PW Channel Partner",
    color: "#8a5cff",
  },
];

function ProgramCard({ p, index }: { p: Program; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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
      <div
        ref={ref}
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
              style={{ color: p.color, borderColor: `${p.color}55`, background: `${p.color}11` }}
            >
              {p.badge}
            </span>
          </div>
          <span
            className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-2"
            style={{ boxShadow: `0 0 16px ${p.color}22` }}
          >
            <Image src={p.logo} alt={`${p.name} logo`} fill sizes="64px" className="object-contain" />
          </span>
          <p className="mt-3 font-display text-lg font-bold text-[var(--color-ink)]">{p.name}</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">{p.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PoweredBy() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="neon-premium rounded-[20px]">
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between">
            <div className="rounded-xl px-4 py-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Powered By</p>
              <h2 className="font-display text-2xl font-bold">Official Programs &amp; Affiliations</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p, i) => (
              <ProgramCard key={p.name} p={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
