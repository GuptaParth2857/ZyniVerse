"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/feedback", label: "Feedback", icon: "💬" },
  { href: "/admin/visitors", label: "Visitors", icon: "👁️" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/ads", label: "Ads", icon: "📢" },
  { href: "/admin/affiliate", label: "Affiliate", icon: "🛒" },
  { href: "/admin/awards", label: "Awards", icon: "🏆" },
  { href: "/admin/reels", label: "Reels", icon: "🎬" },
];

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {collapsed && (
        <button
          onClick={onToggleCollapse}
          title="Show sidebar"
          className="fixed top-4 left-4 z-50 hidden lg:inline-flex rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-white/5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-56 border-r border-[var(--color-line)] bg-[var(--color-panel)] transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
      >
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--color-line)]">
          <span className="text-lg">⚡</span>
          <span className="font-display text-lg font-bold">Admin Panel</span>
          <button
            onClick={onToggleCollapse}
            title="Hide sidebar"
            className="ml-auto hidden lg:inline-flex rounded-md p-1.5 text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-white/5 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {links.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                    : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-ink)] transition-all"
          >
            <span className="text-base">🏠</span>
            Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
}
