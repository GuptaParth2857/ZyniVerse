"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import type { UserStats } from "@/lib/stats";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

export default function WrappedPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Not logged in");
        return r.json();
      })
      .then((d) => {
        setStats(d);
        setLoading(false);
        setTimeout(() => setShowCard(true), 300);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="h-8 w-64 mx-auto rounded bg-white/5 animate-pulse" />
          <div className="mt-8 h-96 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </PageTransition>
    );
  }

  if (error || !stats) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-[var(--color-mute)]">{error || "No stats available"}</p>
          <Link href="/stats" className="mt-4 inline-block text-sm text-[var(--color-cyan)] hover:underline">
            Back to Stats
          </Link>
        </div>
      </PageTransition>
    );
  }

  const topGenre = stats.genreBreakdown.length > 0
    ? [...stats.genreBreakdown].sort((a, b) => b.count - a.count)[0]
    : null;

  const topFormat = stats.formatBreakdown.length > 0
    ? [...stats.formatBreakdown].sort((a, b) => b.count - a.count)[0]
    : null;

  const meanScore = stats.meanScore || 0;

  const shareText = `🎌 My ZyniVerse Wrapped 2026\n\n📺 ${stats.totalAnime} anime watched\n🎬 ${stats.totalEpisodes} episodes\n⏱️ ${stats.totalDaysWatched} days\n🔥 ${stats.currentStreak} day streak\n🏆 Mean Score: ${meanScore}/100\n🎯 Top Genre: ${topGenre?.genre || "N/A"}\n\n#ZyniVerse #AnimeWrapped`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    const text = encodeURIComponent(`🎌 My ZyniVerse Wrapped 2026\n\n📺 ${stats.totalAnime} anime | 🎬 ${stats.totalEpisodes} eps | ⏱️ ${stats.totalDaysWatched} days\n🔥 ${stats.currentStreak} day streak | 🏆 Score: ${meanScore}/100\n\n#ZyniVerse #AnimeWrapped`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=600,height=400");
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Your Year in Anime</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Wrapped {new Date().getFullYear()}</h1>
          </div>
        </div>

        {/* Main Wrapped Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={showCard ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: CARD_EASE }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a14] via-[#1a0a2e] to-[#0a1a2e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(192,38,255,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,255,224,0.1),transparent_50%)]" />

          <div className="relative z-10 p-6 sm:p-8">
            {/* User Info */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 backdrop-blur">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-sm font-bold text-black">
                  {session?.user?.name?.[0] || "U"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">{session?.user?.name || "Anime Fan"}</p>
                  <p className="text-[10px] text-[var(--color-mute)]">@{(session?.user as unknown as Record<string, string>)?.username || "user"}</p>
                </div>
              </div>
            </div>

            {/* Big Number */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={showCard ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <p className="text-6xl sm:text-8xl font-bold font-mono bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] bg-clip-text text-transparent">
                  {stats.totalAnime}
                </p>
                <p className="text-sm text-[var(--color-mute)] mt-2">Anime Watched</p>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Episodes", value: stats.totalEpisodes.toLocaleString(), icon: "🎬" },
                { label: "Days Watched", value: stats.totalDaysWatched.toLocaleString(), icon: "⏱️" },
                { label: "Day Streak", value: `${stats.currentStreak} 🔥`, icon: "" },
                { label: "Mean Score", value: `${meanScore}/100`, icon: "🏆" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={showCard ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="rounded-xl bg-white/5 p-4 text-center backdrop-blur"
                >
                  {stat.icon && <span className="text-lg">{stat.icon}</span>}
                  <p className="text-xl sm:text-2xl font-bold font-mono mt-1">{stat.value}</p>
                  <p className="text-[10px] text-[var(--color-mute)]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Top Genre */}
            {topGenre && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={showCard ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
                className="mb-6 text-center"
              >
                <p className="text-xs text-[var(--color-mute)] mb-2">Your Top Genre</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)]/20 px-4 py-2">
                  <span className="text-sm font-bold text-[var(--color-magenta)]">{topGenre.genre}</span>
                  <span className="text-xs text-[var(--color-mute)]">({topGenre.count} anime)</span>
                </div>
              </motion.div>
            )}

            {/* Top Format */}
            {topFormat && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={showCard ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                className="mb-6 text-center"
              >
                <p className="text-xs text-[var(--color-mute)] mb-2">Most Watched Format</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cyan)]/20 px-4 py-2">
                  <span className="text-sm font-bold text-[var(--color-cyan)]">{topFormat.format}</span>
                  <span className="text-xs text-[var(--color-mute)]">({topFormat.count} anime)</span>
                </div>
              </motion.div>
            )}

            {/* Genre Breakdown Mini */}
            {stats.genreBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={showCard ? { opacity: 1 } : {}}
                transition={{ delay: 0.9 }}
                className="mb-6"
              >
                <p className="text-xs text-[var(--color-mute)] mb-3 text-center">Genre Breakdown</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[...stats.genreBreakdown]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6)
                    .map((g) => (
                      <span
                        key={g.genre}
                        className="rounded-full bg-white/5 px-3 py-1 text-[10px] text-white/70"
                      >
                        {g.genre} ({g.count})
                      </span>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ZyniVerse Branding */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-[10px] text-[var(--color-mute)]">
                Powered by <span className="text-[var(--color-cyan)] font-bold">ZyniVerse</span> — Your Anime Universe
              </p>
            </div>
          </div>
        </motion.div>

        {/* Share Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showCard ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handleTweet}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2]/10 px-6 py-3 text-sm font-medium text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
          </button>
        </motion.div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/stats" className="text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
            ← Back to Stats
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
