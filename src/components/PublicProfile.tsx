"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import ChatButton from "@/components/ChatButton";
import AddFriendButton from "@/components/AddFriendButton";
import { logError } from "@/lib/logger";

interface PublicProfileProps {
  userId: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  signature: string | null;
  themeColor: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  level: number;
  points: number;
  stats: {
    total: number;
    completed: number;
    current: number;
    planning: number;
    episodesWatched: number;
    meanScore: number;
  };
  activities: {
    id: string;
    type: string;
    mediaId: number | null;
    mediaTitle: string | null;
    mediaImage: string | null;
    message: string | null;
    createdAt: string;
  }[];
}

const ACTIVITY_ICONS: Record<string, string> = {
  view_anime: "📺",
  search: "🔍",
  add_to_list: "➕",
  remove_from_list: "➖",
  view_filler: "⏭",
  view_watch_order: "📋",
  view_schedule: "📅",
  view_seasonal: "🌸",
  view_genre: "🎭",
  view_character: "👤",
  view_recommendations: "🎯",
  view_manga: "📖",
  view_cosplay: "📸",
  forum_post: "💬",
  comment: "💬",
  review: "⭐",
  moment: "✦",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function PublicProfile({
  userId,
  username,
  avatar,
  banner,
  bio,
  signature,
  createdAt,
  followersCount: initialFollowers,
  followingCount,
  friendsCount,
  level,
  points,
  stats,
  activities,
}: PublicProfileProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowers);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/follow")
      .then((r) => r.json())
      .then((data) => setFollowing(data.following?.includes(userId) || false))
      .catch(() => {});
  }, [userId, session]);

  const toggleFollow = useCallback(async () => {
    if (!session?.user?.id || followLoading) return;
    setFollowLoading(true);
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
    } catch (e) { logError(e); }
    setFollowLoading(false);
  }, [following, followLoading, session, userId]);

  const joined = new Date(createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden neon-rgb-border"
        >
          <div className="relative h-32 sm:h-40 bg-gradient-to-br from-[var(--color-violet)] via-[var(--color-magenta)] to-[var(--color-cyan)]">
            {banner && (
              <Image src={banner} alt="" fill className="object-cover" sizes="(max-width: 900px) 100vw, 900px" />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="px-5 pb-5 sm:px-7">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
              <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--color-panel)] bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-3xl font-bold text-black shrink-0">
                {avatar ? (
                  <Image src={avatar} alt={username} width={112} height={112} className="object-cover" />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{username}</h1>
                <p className="text-xs text-[var(--color-mute)] mt-0.5">Joined {joined} · Level {level} · {points} pts</p>
              </div>
              {session?.user?.id && (
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
                      following
                        ? "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-red-400 hover:text-red-400"
                        : "bg-[var(--color-cyan)] text-black hover:opacity-90"
                    }`}
                  >
                    {followLoading ? "..." : following ? "Following" : "Follow"}
                  </button>
                  <AddFriendButton userId={userId} username={username} />
                  <ChatButton userId={userId} username={username} />
                </div>
              )}
            </div>

            {bio && <p className="mt-4 text-sm text-[var(--color-ink)]">{bio}</p>}
            {signature && <p className="mt-2 text-xs italic text-[var(--color-mute)]">{signature}</p>}

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Anime List", value: stats.total },
                { label: "Completed", value: stats.completed },
                { label: "Episodes Watched", value: stats.episodesWatched },
                { label: "Mean Score", value: stats.meanScore || "—" },
                { label: "Followers", value: followerCount },
                { label: "Following", value: followingCount },
                { label: "Friends", value: friendsCount },
                { label: "Watching", value: stats.current },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-center">
                  <div className="text-lg font-bold text-[var(--color-cyan)]">{s.value}</div>
                  <div className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/u/${username}/watchlist`} className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors">
                Anime Watchlist →
              </Link>
              <Link href={`/u/${username}/manga`} className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--color-violet)] hover:border-[var(--color-violet)] transition-colors">
                Manga List →
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-6">
          <h2 className="text-sm font-mono text-[var(--color-mute)] uppercase tracking-wider mb-3">Recent Activity</h2>
          {activities.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center text-sm text-[var(--color-mute)]">
              No activity yet.
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3">
                  <span className="text-lg shrink-0">{ACTIVITY_ICONS[a.type] || "✦"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-ink)] truncate">
                      {a.message || a.type.replace(/_/g, " ")}
                      {a.mediaTitle && <span className="text-[var(--color-cyan)]"> · {a.mediaTitle}</span>}
                    </p>
                    <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
