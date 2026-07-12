import type { Metadata } from "next";
import Link from "next/link";
import ForumHomeClient from "./ForumHomeClient";
import ForumStats from "@/components/ForumStats";

export const metadata: Metadata = {
  title: "Anime Forum — Discussions & Community | ZyniVerse",
  description: "Join the ZyniVerse community forum. Discuss anime, share recommendations, and connect with fellow fans.",
  robots: { index: true, follow: true },
};

export default function ForumPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        {/* Neon Background Effects */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#ff00ff]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#00ffff]/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ff3366]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-premium rounded-xl h-12 w-12">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff00ff" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff00ff]" style={{ textShadow: "0 0 10px rgba(255,0,255,0.5)" }}>Community Hub</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 0 30px rgba(255,0,255,0.3), 0 0 60px rgba(0,255,255,0.2)" }}>
                <span className="text-[#ff00ff]">Zyni</span><span className="text-[#00ffff]">Verse</span> Forum
              </h1>
              <p className="mt-3 text-base text-gray-400 max-w-lg">
                Dive into discussions about your favorite anime, share theories, get recommendations, and connect with fellow otaku.
              </p>
            </div>
            
            <Link href="/forum/create"
              className="group relative shrink-0"
            >
              <div className="neon-premium rounded-xl">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#ff00ff" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Start Discussion
                </div>
              </div>
            </Link>
          </div>

          <ForumStats />
        </div>

        {/* Bottom Neon Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ForumHomeClient />
      </div>
    </div>
  );
}
