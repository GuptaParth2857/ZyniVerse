"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWatchlist } from "./WatchlistProvider";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "♡" },
  { href: "/search", label: "Explore", icon: "◎" },
  { href: "/schedule", label: "Schedule", icon: "◈" },
  { href: "/seasonal", label: "Seasonal", icon: "✦" },
  { href: "/watchlist", label: "List", icon: "☰" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { items } = useWatchlist();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-line)] bg-[var(--color-void)]/95 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                active
                  ? "text-[var(--color-cyan)]"
                  : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === "/watchlist" && items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-[var(--color-magenta)] px-1 text-[8px] font-bold text-black">
                  {items.length > 99 ? "99+" : items.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
