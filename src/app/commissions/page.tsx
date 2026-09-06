"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CommissionGrid from "@/components/CommissionGrid";

export default function CommissionsPage() {
  const { status } = useSession();
  const [stats, setStats] = useState({ total: 0, creators: 0 });

  useEffect(() => {
    fetch("/api/commissions?perPage=1")
      .then((r) => r.json())
      .then((data) => setStats({ total: data.total, creators: data.creators }))
      .catch(() => {});
  }, []);

  return (
    <PageTransition>
      <ErrorBoundary label="Commissions">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="relative mb-10 overflow-hidden rounded-3xl neon-rgb-border">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
            <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />
            <div className="relative z-10 px-8 py-12 sm:px-12">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)] mb-2">
                Marketplace
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
                Commission Marketplace
              </h1>
              <p className="mt-3 max-w-xl text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Find incredible anime artists and creators. Commission custom fan art, cosplay, music, editing, and more from the community.
              </p>

              {status === "authenticated" && (
                <Link
                  href="/commissions/create"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-all hover:opacity-90"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Listing
                  </span>
                </Link>
              )}
            </div>

            <div className="relative z-10 flex items-center gap-6 border-t border-white/10 bg-black/20 px-8 py-4 sm:px-12">
              <div>
                <p className="font-display text-2xl font-bold">{stats.total}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Commission Listings</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="font-display text-2xl font-bold">{stats.creators}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Active Creators</p>
              </div>
            </div>
          </div>

          <CommissionGrid />
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
