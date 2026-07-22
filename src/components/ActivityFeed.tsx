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

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  COMPLETED: { label: "Completed", color: "#22c55e", icon: "✅" },
  WATCHING: { label: "Watching", color: "var(--color-cyan)", icon: "▶️" },
  CURRENT: { label: "Watching", color: "var(--color-cyan)", icon: "▶️" },
  PLANNING: { label: "Planning", color: "var(--color-violet)", icon: "📋" },
  DROPPED: { label: "Dropped", color: "var(--color-magenta)", icon: "❌" },
  PAUSED: { label: "Paused", color: "#eab308", icon: "⏸️" },
  REWATCHING: { label: "Rewatching", color: "#06b6d4", icon: "🔄" },
  REVIEWED: { label: "Reviewed", color: "var(--color-magenta)", icon: "✍️" },
  RATED: { label: "Rated", color: "var(--color-cyan)", icon: "⭐" },
  IMPORTED: { label: "Imported", color: "#8b5cf6", icon: "📥" },
};

const MAX_PER_USER = 2;

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

function getDateGroup(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This Week";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupByUser(activities: Activity[]): { user: ActivityUser; items: Activity[] }[] {
  const userMap = new Map<string, { user: ActivityUser; items: Activity[] }>();
  for (const a of activities) {
    const existing = userMap.get(a.userId);
    if (existing) {
      existing.items.push(a);
    } else {
      userMap.set(a.userId, { user: a.user, items: [a] });
    }
  }
  return Array.from(userMap.values());
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const config = TYPE_CONFIG[activity.type] || { label: activity.type, color: "var(--color-mute)", icon: "📌" };
  return (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.03, duration: 0.3 }}
      className="activity-neon-card group relative rounded-xl p-[1px]"
      style={{ ["--act-color" as string]: config.color }}
    >
      <div className="activity-neon-border absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="activity-neon-glow absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-400 blur-sm" />

      <div className="relative z-10 rounded-xl bg-[var(--color-panel)] p-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${config.color}15`,
              color: config.color,
              border: `1px solid ${config.color}30`,
            }}
          >
            {config.icon} {config.label}
          </span>
          <span className="text-[10px] font-mono text-[var(--color-mute)] ml-auto">
            {timeAgo(activity.createdAt)}
          </span>
        </div>

        {activity.mediaTitle && (
          <Link href={`/anime/${activity.mediaId}`} className="mt-2 flex items-center gap-2 group/media">
            {activity.mediaImage && (
              <div className="relative h-8 w-6 shrink-0 overflow-hidden rounded border border-[var(--color-line)]">
                <Image src={activity.mediaImage} alt="" fill className="object-cover" sizes="24px" />
              </div>
            )}
            <span className="text-sm font-medium text-[var(--color-cyan)] group-hover/media:underline">
              {activity.mediaTitle}
            </span>
          </Link>
        )}

        {activity.message && (
          <p className="mt-1.5 text-xs text-[var(--color-mute)] leading-relaxed line-clamp-2">
            &ldquo;{activity.message}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
}

function UserActivityGroup({ group, index }: { group: { user: ActivityUser; items: Activity[] }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const allItems = group.items;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.04, duration: 0.3 }}
      className="activity-user-card group relative rounded-2xl p-[1px]"
    >
      <div className="activity-user-border absolute inset-0 rounded-2xl" />
      <div className="activity-user-glow absolute -inset-1 rounded-2xl blur-md pointer-events-none" />

      <div className="relative z-10 rounded-2xl bg-[var(--color-panel)] p-4">
        {/* User header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-cyan)]/15 text-sm font-bold text-[var(--color-cyan)] ring-2 ring-[var(--color-line)] group-hover:ring-[var(--color-cyan)]/40 transition-all">
              {group.user.avatar ? (
                <Image src={group.user.avatar} alt="" width={40} height={40} className="rounded-full object-cover" />
              ) : (
                group.user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-panel)] bg-[#22c55e] flex items-center justify-center">
              <span className="text-[7px]">●</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              {group.user.username}
            </p>
            <p className="text-[10px] font-mono text-[var(--color-mute)]">
              {allItems.length} activities
            </p>
          </div>
        </div>

        {/* Activity cards */}
        <div className="space-y-2">
          {(expanded ? allItems : allItems.slice(0, MAX_PER_USER)).map((activity, i) => (
            <ActivityCard key={activity.id} activity={activity} index={index * 3 + i} />
          ))}
        </div>

        {/* Show more / less toggle */}
        {allItems.length > MAX_PER_USER && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2.5 w-full flex items-center justify-center gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)]/50 py-1.5 text-[11px] font-mono text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 transition-all"
          >
            {expanded ? (
              <>Show less</>
            ) : (
              <>+{allItems.length - MAX_PER_USER} more activities ↓</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function ActivityFeed() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const LIMIT = 40;

  const fetchActivities = useCallback(async (offset: number) => {
    const res = await fetch(`/api/activity?limit=${LIMIT}&offset=${offset}`);
    if (!res.ok) return { activities: [], total: 0 };
    const text = await res.text();
    if (!text) return { activities: [], total: 0 };
    return JSON.parse(text);
  }, []);

  useEffect(() => {
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

  const dateGroups = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    const key = getDateGroup(a.createdAt);
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/10" />
                <div className="h-2 w-16 rounded bg-white/5" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-12 rounded-lg bg-white/5" />
              <div className="h-12 rounded-lg bg-white/5" />
            </div>
          </div>
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

  let cardIndex = 0;

  return (
    <PageTransition>
      <div className="relative">
        {Object.entries(dateGroups).map(([dateLabel, dayActivities]) => {
          const userGroups = groupByUser(dayActivities);
          return (
            <div key={dateLabel} className="mb-8">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-cyan)] bg-[var(--color-void)]">
                  <span className="text-xs">{dateLabel === "Today" ? "📅" : dateLabel === "Yesterday" ? "📆" : "🗓️"}</span>
                </div>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-cyan)]">
                  {dateLabel}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-cyan)]/30 to-transparent" />
                <span className="text-[10px] font-mono text-[var(--color-mute)]">
                  {userGroups.length} user{userGroups.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* User cards grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {userGroups.map((group) => {
                  const idx = cardIndex++;
                  return <UserActivityGroup key={group.user.id} group={group} index={idx} />;
                })}
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2.5 text-sm font-medium text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)] transition-all disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : `Load more (${activities.length}/${total})`}
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
