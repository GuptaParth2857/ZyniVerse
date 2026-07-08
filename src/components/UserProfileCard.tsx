"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface UserProfileCardProps {
  userId: string;
  username: string;
  image?: string | null;
  bio?: string | null;
  isFollowing?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export default function UserProfileCard({
  userId,
  username,
  image,
  bio,
  isFollowing: initialFollowing = false,
  followerCount: initialFollowers = 0,
  followingCount: initialFollowingCount = 0,
}: UserProfileCardProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowers);

  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/follow")
      .then((r) => r.json())
      .then((data) => {
        setFollowing(data.following?.includes(userId) || false);
      })
      .catch(() => {});
  }, [userId, session]);

  const toggleFollow = async () => {
    if (!session?.user?.id || loading) return;
    setLoading(true);
    try {
      if (following) {
        const res = await fetch("/api/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: userId }),
        });
        const data = await res.json();
        if (data.following === false) {
          setFollowing(false);
          setFollowerCount((c) => Math.max(0, c - 1));
        }
      } else {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: userId }),
        });
        const data = await res.json();
        if (data.following === true) {
          setFollowing(true);
          setFollowerCount((c) => c + 1);
        }
      }
    } catch {}
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5"
    >
      <div className="flex items-center gap-4">
        <Link href={`/profile/${userId}`}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-xl font-bold text-black">
            {image ? (
              <Image src={image} alt="" width={64} height={64} className="rounded-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/profile/${userId}`} className="text-lg font-bold hover:text-[var(--color-cyan)] transition-colors">
            {username}
          </Link>
          {bio && <p className="mt-0.5 text-sm text-[var(--color-mute)] line-clamp-2">{bio}</p>}
          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-mute)]">
            <span><strong className="text-[var(--color-ink)]">{followerCount}</strong> followers</span>
            <span><strong className="text-[var(--color-ink)]">{initialFollowing}</strong> following</span>
          </div>
        </div>

        {!isOwnProfile && session?.user?.id && (
          <button
            onClick={toggleFollow}
            disabled={loading}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              following
                ? "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-red-400 hover:text-red-400"
                : "bg-[var(--color-cyan)] text-black hover:opacity-90"
            }`}
          >
            {loading ? "..." : following ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
