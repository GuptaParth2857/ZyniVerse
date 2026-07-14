"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import FeedbackForm from "./FeedbackForm";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const SOCIAL_LINKS = [
  { label: "YouTube", href: "https://www.youtube.com/@Itz_parth_2007", icon: "youtube" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61584572784224", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/gupta.parth1015/", icon: "instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/guptaparth2857/", icon: "linkedin" },
  { label: "Twitter", href: "https://x.com/GuptaParth2857", icon: "twitter" },
];

const SOCIAL_PATHS: Record<string, string> = {
  youtube: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27z",
  facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  instagram: "M17 2H7a5 5 0 00-5 5v10a5 5 0 005 5h10a5 5 0 005-5V7a5 5 0 00-5-5zm-5 14a5 5 0 110-10 5 5 0 010 10zm0-12a7 7 0 100 14 7 7 0 000-14zm6-2a1 1 0 110 2 1 1 0 010-2z",
  linkedin: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 110-4 2 2 0 010 4z",
  twitter: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
};

const LINK_COLUMNS = [
  {
    title: "Browse",
    links: [
      { href: "/search", label: "Explore Anime", icon: "search" },
      { href: "/manga", label: "Manga", icon: "book" },
      { href: "/seasonal", label: "Seasonal", icon: "calendar" },
      { href: "/schedule", label: "Schedule", icon: "clock" },
      { href: "/tv-schedule", label: "TV Channels", icon: "globe" },
      { href: "/live-action", label: "Live Action Anime", icon: "film" },
      { href: "/dubbed", label: "Regional Dubs", icon: "globe" },
      { href: "/indian-dubs", label: "Indian Dubs", icon: "globe" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/forum", label: "Forum", icon: "message-circle" },
      { href: "/community", label: "Discussions", icon: "message-circle" },
      { href: "/clubs", label: "Clubs", icon: "users" },
      { href: "/characters", label: "Characters", icon: "users" },
      { href: "/leaderboard", label: "Leaderboard", icon: "bar-chart" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/filler", label: "Filler Guides", icon: "edit" },
      { href: "/watch-order", label: "Watch Orders", icon: "list" },
      { href: "/wiki", label: "Wiki", icon: "book" },
      { href: "/blog", label: "Blog", icon: "edit" },
      { href: "/docs", label: "API Docs", icon: "code" },
      { href: "/status", label: "Status", icon: "bar-chart" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/watchlist", label: "My List", icon: "list" },
      { href: "/profile", label: "Profile", icon: "user" },
      { href: "/saved", label: "Saved Posts", icon: "bookmark" },
      { href: "/login", label: "Login", icon: "log-in" },
      { href: "/register", label: "Register", icon: "user-plus" },
      { href: "/premium", label: "Premium", icon: "award" },
    ],
  },
];

const ICON_PATHS: Record<string, string> = {
  "search": "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  "book": "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5z",
  "calendar": "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  "clock": "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  "bar-chart": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  "globe": "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "message-circle": "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  "edit": "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  "shuffle": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  "users": "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  "user-check": "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm8 2l2 2 4-4",
  "award": "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "list": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  "user": "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "bookmark": "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
  "log-in": "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1",
  "user-plus": "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm13 0v6m-3-3h6",
  "code": "M16 18l6-6-6-6M8 6l-6 6 6 6",
  "film": "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
};

export default function Footer() {
  const [year, setYear] = useState(2026);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-void)] relative z-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <motion.div {...FADE_UP} className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-3 group">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--color-magenta)]/30 shadow-[0_0_15px_rgba(255,0,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-shadow">
                <Image src="/logo.png" alt="ZyniVerse" width={40} height={40} className="object-cover" />
              </div>
              <span className="font-display text-xl font-bold logo-text">ZyniVerse</span>
            </Link>
            <p className="text-xs leading-relaxed text-[var(--color-mute)] mb-4 max-w-xs">
              Discover, track, and discuss anime & manga. Your ultimate anime companion.
            </p>
            <div className="space-y-1.5 mb-4">
              <a href="mailto:contact.zenvyx@gmail.com" className="flex items-center gap-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" /></svg>
                contact.zenvyx@gmail.com
              </a>
              <span className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Delhi, India
              </span>
            </div>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-[var(--color-panel)] flex items-center justify-center text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 border border-[var(--color-line)] hover:border-[var(--color-cyan)]/30 transition-all"
                  aria-label={s.label}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={SOCIAL_PATHS[s.icon]} />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {LINK_COLUMNS.map((col, i) => (
            <motion.div key={col.title} {...FADE_UP} transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
              className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/30 p-4 hover:bg-[var(--color-panel)]/50 transition-all duration-300"
            >
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--color-cyan)] mb-4 flex items-center gap-2 pb-2 border-b border-[var(--color-line)]/50">
                {col.title}
              </h4>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="flex items-center gap-2.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/5 hover:border-l-2 hover:border-[var(--color-cyan)] pl-2 -ml-2 rounded-r-md py-1.5 transition-all duration-200"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d={ICON_PATHS[link.icon]} />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Support / Donate */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 p-5 bg-gradient-to-r from-[var(--color-magenta)]/10 to-[var(--color-violet)]/10 rounded-2xl border border-[var(--color-line)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-magenta)]/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-magenta)" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-ink)]">Support ZyniVerse</p>
              <p className="text-xs text-[var(--color-mute)]">Help us keep running — no ads, just passion.</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="https://www.buymeacoffee.com/zyniverse" target="_blank" rel="noopener noreferrer"
              className="px-5 py-3 sm:py-2.5 bg-[var(--color-magenta)] text-black text-xs font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-[var(--color-magenta)]/30"
            >☕ Buy me a coffee</a>
            <Link href="/premium"
              className="px-5 py-3 sm:py-2.5 bg-[var(--color-cyan)] text-black text-xs font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-[var(--color-cyan)]/30"
            >Go Premium</Link>
          </div>
        </motion.div>

        {/* Community CTA */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 p-5 bg-gradient-to-r from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 rounded-2xl border border-[var(--color-line)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-cyan)]/20 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-ink)]">Join the Discussion</p>
              <p className="text-xs text-[var(--color-mute)]">Share reviews, critiques, and connect with anime fans.</p>
            </div>
          </div>
          <Link href="/community"
            className="px-5 py-3 sm:py-2.5 bg-[var(--color-cyan)] text-black text-xs font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-[var(--color-cyan)]/30 shrink-0"
          >Explore Community</Link>
        </motion.div>

        {/* Feedback Form */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-6"
        >
          <FeedbackForm />
        </motion.div>

        {/* Bottom links */}
        <motion.div {...FADE_UP} transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 pt-6 border-t border-[var(--color-line)] flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href="/search" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Browse Anime</Link>
            <Link href="/forum" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Forum</Link>
            <Link href="/filler" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Filler Guides</Link>
            <Link href="/watch-order" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Watch Orders</Link>
            <Link href="/docs" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">API Docs</Link>
            <Link href="/seasonal" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Seasonal</Link>
            <Link href="/leaderboard" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Leaderboard</Link>
            <Link href="/dubbed" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Regional Dubs</Link>
            <Link href="/manga/read/1" className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition">Read Manga</Link>
          </div>
          <div className="flex gap-3 text-xs text-[var(--color-mute)]">
            <Link href="/privacy" className="hover:text-[var(--color-cyan)] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-cyan)] transition">Terms</Link>
            <Link href="/community" className="hover:text-[var(--color-cyan)] transition">Contact</Link>
            <Link href="/developer" className="hover:text-[var(--color-cyan)] transition">Developer</Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-line)] bg-black/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-[var(--color-mute)]">
            &copy; {year} ZyniVerse. All rights reserved.
          </p>
          <p className="text-[10px] text-[var(--color-mute)]/50">
            Made with ❤️ for anime fans. No content is hosted here.
          </p>
        </div>
      </div>
    </footer>
  );
}
