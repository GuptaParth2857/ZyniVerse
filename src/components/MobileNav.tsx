"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWatchlist } from "./WatchlistProvider";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "♡" },
  { href: "/search", label: "Explore", icon: "◎" },
  { href: "/seasonal", label: "Seasonal", icon: "✦" },
  { href: "/reels", label: "Reels", icon: "🎬" },
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
            className="absolute left-0 right-0 bg-[var(--color-panel)] border-t border-[var(--color-line)] rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
            style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              @keyframes mnNeonBorder {
                0%   { border-color: #ff00ff; box-shadow: 0 0 6px #ff00ff33; }
                20%  { border-color: #00ffff; box-shadow: 0 0 6px #00ffff33; }
                40%  { border-color: #ff3366; box-shadow: 0 0 6px #ff336633; }
                60%  { border-color: #ffff00; box-shadow: 0 0 6px #ffff0033; }
                80%  { border-color: #ff0066; box-shadow: 0 0 6px #ff006633; }
                100% { border-color: #ff00ff; box-shadow: 0 0 6px #ff00ff33; }
              }
              @keyframes mnNeonBorderHover {
                0%   { border-color: #ff00ff; box-shadow: 0 0 12px #ff00ffaa; }
                20%  { border-color: #00ffff; box-shadow: 0 0 12px #00ffffaa; }
                40%  { border-color: #ff3366; box-shadow: 0 0 12px #ff3366aa; }
                60%  { border-color: #ffff00; box-shadow: 0 0 12px #ffff00aa; }
                80%  { border-color: #ff0066; box-shadow: 0 0 12px #ff0066aa; }
                100% { border-color: #ff00ff; box-shadow: 0 0 12px #ff00ffaa; }
              }
              .mn-neon-item {
                border-width: 1px;
                border-style: solid;
                animation: mnNeonBorder 5s linear infinite;
                animation-delay: calc(var(--mi, 0) * -0.4s);
                transition: transform 0.2s, box-shadow 0.2s;
              }
              .mn-neon-item:hover {
                animation: mnNeonBorderHover 1.5s linear infinite !important;
                transform: translateY(-1px);
              }
            `}</style>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-line)]">
              <span className="text-sm font-bold text-[var(--color-ink)]">More</span>
              <button onClick={() => setShowMore(false)} className="text-[var(--color-mute)] hover:text-[var(--color-cyan)] text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {MORE_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className={`mn-neon-item px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    pathname === item.href
                      ? "text-[var(--color-cyan)]"
                      : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                  }`}
                  style={{ ["--mi" as string]: i }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-line)] bg-[var(--color-void)]/95 backdrop-blur-xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-2.5 text-[10px] font-semibold transition-colors min-h-[44px] whitespace-nowrap ${
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
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2.5 text-[10px] font-semibold transition-colors min-h-[44px] whitespace-nowrap ${
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
