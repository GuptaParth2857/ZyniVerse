"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

interface ActivityUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface Activity {
  id: string;
  userId: string;
  type: string;
  mediaId: number | null;
  mediaTitle: string | null;
  mediaImage: string | null;
  message: string | null;
  createdAt: string;
  user: ActivityUser;
}

const TYPE_COLORS: Record<string, string> = {
  COMPLETED: "#22c55e",
  WATCHING: "var(--color-cyan)",
  CURRENT: "var(--color-cyan)",
  PLANNING: "var(--color-violet)",
  DROPPED: "var(--color-magenta)",
  PAUSED: "#eab308",
  REWATCHING: "#06b6d4",
  REVIEWED: "var(--color-magenta)",
  RATED: "var(--color-cyan)",
  IMPORTED: "#8b5cf6",
};

function ActivitySkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="h-10 w-10 rounded-full bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-white/10" />
        <div className="h-2 w-2/3 rounded bg-white/5" />
      </div>
    </div>
  );
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ActivityFeed() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchActivities = useCallback(async (offset: number) => {
    const res = await fetch(`/api/activity?limit=${LIMIT}&offset=${offset}`);
    if (!res.ok) {
      console.error(`Activity feed request failed: ${res.status}`);
      return { activities: [], total: 0 };
    }
    const text = await res.text();
    if (!text) return { activities: [], total: 0 };
    return JSON.parse(text);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchActivities(0).then((data) => {
      setActivities(data.activities || []);
      setTotal(data.total || 0);
      setHasMore((data.activities?.length || 0) >= LIMIT);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchActivities]);

  const loadMore = async () => {
    setLoadingMore(true);
    const data = await fetchActivities(activities.length);
    if (data.activities?.length) {
      setActivities((prev) => [...prev, ...data.activities]);
      setHasMore(data.activities.length >= LIMIT);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      COMPLETED: "Completed",
      WATCHING: "Started watching",
      CURRENT: "Started watching",
      PLANNING: "Planning to watch",
      DROPPED: "Dropped",
      PAUSED: "Paused",
      REWATCHING: "Rewatching",
      REVIEWED: "Reviewed",
      RATED: "Rated",
      IMPORTED: "Imported",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <PageTransition>
        <EmptyState
          icon="chat"
          title={session ? "No activity yet." : "No recent activity."}
          description={session ? "Follow some users to see their activity!" : "Sign in to follow users and see their activity."}
          actionLabel={session ? "Explore Anime" : "Sign In"}
          actionHref={session ? "/search" : "/login"}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-3">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 transition-all hover:border-[var(--color-cyan)]/20"
          >
            <Link href={`/profile/${activity.user.id}`} className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-cyan)]/20 text-sm font-bold text-[var(--color-cyan)]">
                {activity.user.avatar ? (
                  <Image src={activity.user.avatar} alt="" width={40} height={40} className="rounded-full object-cover" />
                ) : (
                  activity.user.username.charAt(0).toUpperCase()
                )}
              </div>
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${activity.user.id}`} className="text-sm font-semibold hover:text-[var(--color-cyan)] transition-colors">
                  {activity.user.username}
                </Link>
                <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider`}
                  style={{
                    backgroundColor: `${TYPE_COLORS[activity.type] || "var(--color-mute)"}20`,
                    color: TYPE_COLORS[activity.type] || "var(--color-mute)",
                    border: `1px solid ${TYPE_COLORS[activity.type] || "var(--color-mute)"}40`,
                  }}
                >
                  {getTypeLabel(activity.type)}
                </span>
              </div>

              {activity.mediaTitle && (
                <div className="mt-2 flex items-center gap-3">
                  {activity.mediaImage && (
                    <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded border border-[var(--color-line)]">
                      <Image src={activity.mediaImage} alt="" fill className="object-cover" sizes="28px" />
                    </div>
                  )}
                  <Link
                    href={`/anime/${activity.mediaId}`}
                    className="text-sm font-medium text-[var(--color-cyan)] hover:underline"
                  >
                    {activity.mediaTitle}
                  </Link>
                </div>
              )}

              {activity.message && (
                <p className="mt-1 text-xs text-[var(--color-mute)] leading-relaxed">{activity.message}</p>
              )}

              <p className="mt-1.5 text-[10px] font-mono text-[var(--color-mute)]">{timeAgo(activity.createdAt)}</p>
            </div>
          </motion.div>
        ))}

        {hasMore && (
          <div className="pt-4 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2 text-sm font-medium text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)] transition-all disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : `Load more (${activities.length}/${total})`}
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
