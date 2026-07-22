"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWatchlist } from "./WatchlistProvider";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "♡" },
  { href: "/search", label: "Explore", icon: "◎" },
  { href: "/seasonal", label: "Seasonal", icon: "✦" },
  { href: "/activity", label: "Feed", icon: "⚡" },
  { href: "/watchlist", label: "List", icon: "☰" },
];

const MORE_ITEMS = [
  { href: "/guides", label: "Guides & Articles" },
  { href: "/theatrical-releases", label: "Theatrical Releases" },
  { href: "/toons", label: "Toons & Cartoons" },
  { href: "/podcast", label: "Podcast" },
  { href: "/merch", label: "Merch Store" },
  { href: "/indian-dubs", label: "Indian Dubs" },
  { href: "/tv-schedule", label: "TV Channels" },
  { href: "/conventions", label: "Conventions" },
  { href: "/filler", label: "Filler Guides" },
  { href: "/watch-order", label: "Watch Orders" },
  { href: "/voice-actors", label: "Voice Actors" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/premium", label: "Premium" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { items } = useWatchlist();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-16 left-0 right-0 bg-[var(--color-panel)] border-t border-[var(--color-line)] rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-line)]">
              <span className="text-sm font-bold text-[var(--color-ink)]">More</span>
              <button onClick={() => setShowMore(false)} className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {MORE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                      : "text-[var(--color-mute)] hover:bg-[var(--color-surface1)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-line)] bg-[var(--color-void)]/95 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-2.5 text-[10px] font-semibold transition-colors min-h-[44px] ${
                  active
                    ? "text-[var(--color-cyan)]"
                    : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
                {item.href === "/watchlist" && items.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[18px] items-center justify-center rounded-full bg-[var(--color-magenta)] px-1 text-[10px] font-bold text-black">
                    {items.length > 99 ? "99+" : items.length}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2.5 text-[10px] font-semibold transition-colors min-h-[44px] ${
              showMore
                ? "text-[var(--color-cyan)]"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >
            <span className="text-lg leading-none">⋯</span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
