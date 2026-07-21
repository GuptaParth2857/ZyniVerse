"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface Activity {
  id: string;
  userId: string;
  type: string;
  mediaId: number | null;
  mediaTitle: string | null;
  mediaImage: string | null;
  message: string | null;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

interface UserGroup {
  user: Activity["user"];
  activities: Activity[];
  latestTime: string;
}

const TYPE_ICONS: Record<string, string> = {
  COMPLETED: "✅", WATCHING: "▶️", CURRENT: "▶️", PLANNING: "📋",
  DROPPED: "⛔", PAUSED: "⏸️", REWATCHING: "🔄", REVIEWED: "⭐", RATED: "🎯", IMPORTED: "📥",
};

const TYPE_LABELS: Record<string, string> = {
  COMPLETED: "completed", WATCHING: "started watching", CURRENT: "is watching",
  PLANNING: "plans to watch", DROPPED: "dropped", PAUSED: "paused",
  REWATCHING: "rewatching", REVIEWED: "reviewed", RATED: "rated",
};

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  COMPLETED: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)", text: "#22c55e" },
  WATCHING: { bg: "rgba(41,242,224,0.12)", border: "rgba(41,242,224,0.25)", text: "#29f2e0" },
  CURRENT: { bg: "rgba(41,242,224,0.12)", border: "rgba(41,242,224,0.25)", text: "#29f2e0" },
  PLANNING: { bg: "rgba(138,92,255,0.12)", border: "rgba(138,92,255,0.25)", text: "#8a5cff" },
  DROPPED: { bg: "rgba(255,45,120,0.12)", border: "rgba(255,45,120,0.25)", text: "#ff2d78" },
  PAUSED: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.25)", text: "#eab308" },
  REWATCHING: { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)", text: "#06b6d4" },
  REVIEWED: { bg: "rgba(255,179,0,0.12)", border: "rgba(255,179,0,0.25)", text: "#f59e0b" },
  RATED: { bg: "rgba(41,242,224,0.12)", border: "rgba(41,242,224,0.25)", text: "#29f2e0" },
  IMPORTED: { bg: "rgba(138,92,255,0.12)", border: "rgba(138,92,255,0.25)", text: "#8a5cff" },
};

const CARD_COLORS = ["#29f2e0", "#ff2d78", "#8a5cff", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899", "#f97316"];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function groupByUser(activities: Activity[]): UserGroup[] {
  const map = new Map<string, UserGroup>();
  for (const a of activities) {
    const existing = map.get(a.userId);
    if (existing) existing.activities.push(a);
    else map.set(a.userId, { user: a.user, activities: [a], latestTime: a.createdAt });
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime());
}

function ActivityPill({ activity }: { activity: Activity }) {
  const c = TYPE_COLORS[activity.type] || { bg: "rgba(128,123,163,0.12)", border: "rgba(128,123,163,0.25)", text: "#807ba3" };
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 shrink-0"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="text-xs">{TYPE_ICONS[activity.type] || "📌"}</span>
      <span className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        <span style={{ color: c.text }}>{TYPE_LABELS[activity.type] || activity.type?.toLowerCase()}</span>
        {activity.mediaTitle && (
          <Link href={`/anime/${activity.mediaId}`} className="font-semibold text-white/90 hover:opacity-80 ml-1">{activity.mediaTitle}</Link>
        )}
      </span>
      {activity.mediaImage && (
        <Link href={`/anime/${activity.mediaId}`} className="shrink-0">
          <div className="relative h-6 w-5 rounded overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
            <Image src={activity.mediaImage} alt="" fill className="object-cover" sizes="20px" />
          </div>
        </Link>
      )}
    </div>
  );
}

function UserCard({ group, index }: { group: UserGroup; index: number }) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const shown = group.activities.slice(0, 3);
  const more = group.activities.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 24 }}
      className="flex-shrink-0 w-[calc(25%-9px)] min-w-[200px] max-w-[260px] overflow-hidden rounded-xl neon-feature-card"
    >
      <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }} />
      <div className="neon-glow rounded-xl" style={{ background: color }} />
      <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="h-[2px] w-full" style={{ background: color }} />
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${color}40` }}>
              {group.user.avatar ? (
                <Image src={group.user.avatar} alt="" width={36} height={36} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color, background: `${color}15` }}>
                  {group.user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/profile?user=${group.user.id}`} className="text-[12px] font-bold text-white truncate block hover:opacity-80">{group.user.username}</Link>
              <span className="text-[9px] text-white/25">{timeAgo(group.latestTime)}</span>
            </div>
            {group.activities.length > 1 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0" style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
                {group.activities.length}x
              </span>
            )}
          </div>
          <div className="space-y-1">
            {shown.map((a) => <ActivityPill key={a.id} activity={a} />)}
            {more > 0 && (
              <Link href="/activity" className="block text-center text-[9px] text-white/20 hover:text-white/40 py-0.5">+{more} more</Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FriendActivityFeed() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const url = session?.user?.id ? "/api/activity?type=following&limit=50" : "/api/activity?limit=50";
    fetch(url).then((r) => r.json()).then((d) => { setActivities(d.activities || []); setLoading(false); }).catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="flex gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="flex-shrink-0 w-[calc(25%-9px)] min-w-[200px] h-40 rounded-xl bg-white/5" />)}</div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) return null;

  const groups = groupByUser(activities);

  return (
    <div className="overflow-hidden rounded-2xl neon-feature-card">
      <div className="neon-border rounded-2xl" style={{ background: "conic-gradient(from var(--border-angle), #29f2e0, #ff2d78, #8a5cff, #22c55e, #f59e0b, #29f2e0)" }} />
      <div className="neon-glow rounded-2xl" style={{ background: "linear-gradient(90deg, #29f2e0, #ff2d78, #8a5cff)" }} />
      <div className="neon-inner rounded-2xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#29f2e0] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#29f2e0]" />
                </span>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#29f2e0]">Live</p>
              </div>
              <h3 className="font-display text-xl font-bold">Friend Activity</h3>
            </div>
            <Link href="/activity" className="text-xs text-white/30 hover:text-[#29f2e0] transition-colors">View all →</Link>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-r from-[var(--color-panel)] to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-l from-[var(--color-panel)] to-transparent" />
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {groups.map((group, i) => <UserCard key={group.user.id} group={group} index={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
