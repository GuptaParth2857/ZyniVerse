"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const LINKS = [
  { href: "/contests", label: "All battles", icon: "⚔️" },
  { href: "/contests/leaderboard", label: "Leaderboard", icon: "🥇" },
  { href: "/contests/hall-of-fame", label: "Hall of Fame", icon: "🏛️" },
  { href: "/contests/rules", label: "Rules", icon: "📜" },
];

/** Shared sub-navigation for every /contests/* page. */
export default function ContestSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/70 p-1.5 backdrop-blur-sm">
        {LINKS.map((link) => {
          const active = link.href === "/contests" ? pathname === "/contests" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-xl px-3.5 py-2 text-[11px] font-bold transition-colors ${
                active ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="contest-subnav"
                  className="absolute inset-0 -z-10 rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="mr-1.5" aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>
      <Link
        href="/contests/submit"
        className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition-all hover:shadow-[0_0_20px_rgba(0,255,224,0.3)]"
      >
        🚀 Submit entry
      </Link>
    </div>
  );
}
