"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";

interface ReferralStats {
  code: string;
  count: number;
  xpEarned: number;
  level: number;
}

const REWARDS = [
  { invites: 1, reward: "100 XP + 'Recruiter' Badge", icon: "🥉" },
  { invites: 3, reward: "300 XP + Exclusive Profile Frame", icon: "🥈" },
  { invites: 5, reward: "500 XP + 'Community Champion' Badge", icon: "🥇" },
  { invites: 10, reward: "1000 XP + Custom User Flair", icon: "💎" },
  { invites: 25, reward: "2500 XP + Lifetime Premium Access", icon: "👑" },
];

const SHARE_TEXT = encodeURIComponent("Join ZyniVerse — India's #1 free anime platform! Filler guides, Hindi dubs, AI recommendations & more. 🎯🇮🇳");

export default function EarnPage() {
  const { status } = useSession();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/referral/stats")
        .then((r) => r.json())
        .then((d) => setStats(d))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [status]);

  const shareLink = stats ? `${window.location.origin}/register?ref=${stats.code}` : "";
  const nextMilestone = REWARDS.find((r) => (stats?.count ?? 0) < r.invites);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${SHARE_TEXT}%20${encodeURIComponent(shareLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${SHARE_TEXT}`,
      twitter: `https://twitter.com/intent/tweet?text=${SHARE_TEXT}&url=${encodeURIComponent(shareLink)}`,
      fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    };
    const url = urls[platform];
    if (url) window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  if (status === "loading" || loading) return <Loader label="Loading..." />;
  if (status === "unauthenticated") {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p className="font-display text-5xl mb-4">💰</p>
          <h1 className="font-display text-3xl font-bold mb-3">Earn Rewards by Sharing</h1>
          <p className="text-[var(--color-mute)] mb-6">Invite friends to ZyniVerse. Earn XP, badges & exclusive perks.</p>
          <Link href="/login" className="inline-flex rounded-full bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black hover:opacity-90">
            Sign In to Start
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Earn">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">{"// Earn"}</p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h1 className="font-display text-3xl font-black sm:text-4xl mt-1">Refer & Earn</h1>
            </div>
            <p className="mt-2 text-sm text-[var(--color-mute)]">Share your link. Friends join. You get XP.</p>
          </motion.div>

          {stats && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Referrals", value: stats.count, icon: "👥", color: "var(--color-cyan)" },
                  { label: "XP Earned", value: stats.xpEarned, icon: "⭐", color: "var(--color-amber)" },
                  { label: "Level", value: stats.level, icon: "🏆", color: "var(--color-magenta)" },
                ].map((s) => (
                  <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="neon-rgb-border rounded-xl text-center p-5 bg-[var(--color-panel)]"
                  >
                    <span className="text-2xl block mb-1">{s.icon}</span>
                    <p className="font-display text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-[var(--color-mute)] font-mono mt-0.5">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] p-6 mb-8"
              >
                <h2 className="font-display text-lg font-bold mb-3">Your Referral Link</h2>
                <div className="flex gap-2 mb-4">
                  <input readOnly value={shareLink} className="flex-1 rounded-xl bg-[var(--color-void)] px-4 py-3 text-xs font-mono text-[var(--color-ink)] outline-none border border-[var(--color-line)]" />
                  <button onClick={handleCopy} className="shrink-0 rounded-xl bg-[var(--color-cyan)] px-5 py-3 text-xs font-bold text-black hover:opacity-90 transition-opacity">
                    {copyMsg || "Copy"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleShare("whatsapp")} className="rounded-full bg-[#25D366]/20 px-4 py-2 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 transition-all">Share WhatsApp</button>
                  <button onClick={() => handleShare("telegram")} className="rounded-full bg-[#0088cc]/20 px-4 py-2 text-xs font-semibold text-[#0088cc] hover:bg-[#0088cc]/30 border border-[#0088cc]/30 transition-all">Share Telegram</button>
                  <button onClick={() => handleShare("twitter")} className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 border border-white/20 transition-all">Share X</button>
                  <button onClick={() => handleShare("fb")} className="rounded-full bg-[#1877F2]/20 px-4 py-2 text-xs font-semibold text-[#1877F2] hover:bg-[#1877F2]/30 border border-[#1877F2]/30 transition-all">Share Facebook</button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="font-display text-lg font-bold mb-4">Rewards Milestones</h2>
                <div className="space-y-3">
                  {REWARDS.map((r) => {
                    const unlocked = (stats?.count ?? 0) >= r.invites;
                    return (
                      <div key={r.invites} className={`neon-rgb-border rounded-xl bg-[var(--color-panel)] p-4 flex items-center gap-4 ${unlocked ? "opacity-100" : "opacity-50"}`}>
                        <span className="text-2xl">{unlocked ? r.icon : "🔒"}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{r.invites} {r.invites === 1 ? "Referral" : "Referrals"}</p>
                          <p className="text-xs text-[var(--color-mute)]">{r.reward}</p>
                        </div>
                        {unlocked && <span className="text-xs font-bold text-green-400">Unlocked ✓</span>}
                        {!unlocked && r === nextMilestone && (
                          <div className="h-1.5 w-24 rounded-full bg-[var(--color-line)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-cyan)]" style={{ width: `${((stats?.count ?? 0) / r.invites) * 100}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}

          {!stats && !loading && (
            <div className="py-16 text-center">
              <p className="text-[var(--color-mute)]">Could not load referral stats.</p>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
