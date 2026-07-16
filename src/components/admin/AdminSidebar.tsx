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
];

export default function AdminSidebar() {
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

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-56 border-r border-[var(--color-line)] bg-[var(--color-panel)] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--color-line)]">
          <span className="text-lg">⚡</span>
          <span className="font-display text-lg font-bold">Admin Panel</span>
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
