"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AnimeFollowButton({ mediaId, animeTitle }: { mediaId: number; animeTitle: string }) {
  const { status } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/anime-follow")
      .then((r) => r.json())
      .then((d) => setFollowing((d.follows || []).includes(mediaId)))
      .catch(() => {});
  }, [mediaId, status]);

  async function toggle() {
    setLoading(true);
    try {
      if (following) {
        await fetch("/api/anime-follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId }),
        });
        setFollowing(false);
      } else {
        await fetch("/api/anime-follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId }),
        });
        setFollowing(true);
      }
    } catch { /* leave state */ }
    setLoading(false);
  }

  if (status !== "authenticated") {
    return (
      <Link
        href="/login"
        className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-xs font-bold text-[var(--color-mute)] transition-all hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
        title={`Sign in to follow ${animeTitle} for new episode alerts`}
      >
        🔔 Follow
      </Link>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-60 ${
        following
          ? "border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
          : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
      }`}
      title={following ? `Stop following ${animeTitle}` : `Follow ${animeTitle} to get new episode alerts`}
    >
      {following ? "✓ Following" : "🔔 Follow"}
    </motion.button>
  );
}