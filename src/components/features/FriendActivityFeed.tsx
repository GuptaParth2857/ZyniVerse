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

const TYPE_COLORS: Record<string, string> = {
  COMPLETED: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
  WATCHING: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
  CURRENT: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
  PLANNING: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  DROPPED: "from-red-500/20 to-red-500/5 border-red-500/20",
  PAUSED: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  REWATCHING: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
  REVIEWED: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
  RATED: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
};

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
    if (existing) {
      existing.activities.push(a);
    } else {
      map.set(a.userId, {
        user: a.user,
        activities: [a],
        latestTime: a.createdAt,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime()
  );
}

function ActivityPill({ activity, compact = false }: { activity: Activity; compact?: boolean }) {
  const colorClass = TYPE_COLORS[activity.type] || "from-gray-500/20 to-gray-500/5 border-gray-500/20";
  const icon = TYPE_ICONS[activity.type] || "📌";
  const label = TYPE_LABELS[activity.type] || activity.type?.toLowerCase();

  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded-lg border bg-gradient-to-r px-2.5 py-1.5 ${colorClass} group/activity hover:scale-[1.02] transition-transform`}>
        <span className="text-xs">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] truncate">
            <span className="text-white/60">{label}</span>
            {activity.mediaTitle && (
              <>
                <span className="text-white/20 mx-0.5">•</span>
                <Link href={`/anime/${activity.mediaId}`} className="font-medium text-white/80 hover:text-[var(--color-cyan)] transition-colors">
                  {activity.mediaTitle}
                </Link>
              </>
            )}
          </p>
        </div>
        {activity.mediaImage && (
          <Link href={`/anime/${activity.mediaId}`} className="shrink-0">
            <div className="relative h-6 w-5 rounded overflow-hidden border border-white/10 group-hover/activity:border-white/20 transition-colors">
              <Image src={activity.mediaImage} alt="" fill className="object-cover" sizes="20px" />
            </div>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 rounded-xl border bg-gradient-to-r px-3 py-2 ${colorClass} group/activity hover:scale-[1.02] transition-transform`}>
      <span className="text-sm">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs truncate">
          <span className="text-white/70">{label}</span>
          {activity.mediaTitle && (
            <>
              <span className="text-white/30 mx-1">•</span>
              <Link href={`/anime/${activity.mediaId}`} className="font-medium text-white/90 hover:text-[var(--color-cyan)] transition-colors">
                {activity.mediaTitle}
              </Link>
            </>
          )}
        </p>
      </div>
      {activity.mediaImage && (
        <Link href={`/anime/${activity.mediaId}`} className="shrink-0">
          <div className="relative h-8 w-6 rounded-md overflow-hidden border border-white/10 group-hover/activity:border-white/20 transition-colors">
            <Image src={activity.mediaImage} alt="" fill className="object-cover" sizes="24px" />
          </div>
        </Link>
      )}
    </div>
  );
}

function UserTreeCard({ group, index }: { group: UserGroup; index: number }) {
  const maxShow = 3;
  const hasMore = group.activities.length > maxShow;
  const shownActivities = group.activities.slice(0, maxShow);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="relative rounded-2xl border border-[var(--color-line)] overflow-hidden bg-gradient-to-br from-[var(--color-panel)] to-[rgba(10,10,20,0.8)] hover:border-[var(--color-cyan)]/30 transition-all duration-300 hover:shadow-[0_0_40px_-15px_rgba(0,255,224,0.15)] h-full">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(300px circle at 50% 0%, rgba(0,255,224,0.03) 0%, transparent 100%)" }}
        />

        <div className="relative p-3 sm:p-4">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Link href={`/profile?user=${group.user.id}`} className="shrink-0">
              <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-[var(--color-line)] group-hover:border-[var(--color-cyan)]/40 transition-colors shadow-[0_0_15px_-3px_rgba(0,255,224,0.2)]">
                {group.user.avatar ? (
                  <Image src={group.user.avatar} alt="" fill className="object-cover" sizes="36px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-[var(--color-magenta)]/30 to-[var(--color-cyan)]/20 text-[var(--color-cyan)]">
                    {group.user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/profile?user=${group.user.id}`} className="font-display text-xs font-bold text-white hover:text-[var(--color-cyan)] transition-colors truncate block">
                {group.user.username}
              </Link>
              <p className="text-[9px] text-white/30">{timeAgo(group.latestTime)}</p>
            </div>
            {group.activities.length > 1 && (
              <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                {group.activities.length}x
              </span>
            )}
          </div>

          <div className="space-y-1">
            {shownActivities.map((a) => (
              <ActivityPill key={a.id} activity={a} compact />
            ))}
            {hasMore && (
              <div className="flex items-center justify-center py-0.5">
                <span className="text-[9px] text-white/20">+{group.activities.length - maxShow} more</span>
              </div>
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
    const url = session?.user?.id ? "/api/activity?type=following&limit=20" : "/api/activity?limit=20";
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setActivities(d.activities || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) return null;

  const groups = groupByUser(activities);

  return (
    <div className="relative rounded-2xl border border-[var(--color-line)] overflow-hidden bg-gradient-to-br from-[var(--color-panel)] via-[rgba(10,10,25,0.9)] to-[rgba(5,5,15,1)]">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.3)" }} />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyan)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-cyan)]" />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Live</p>
            </div>
            <h3 className="font-display text-xl font-bold">Friend Activity</h3>
          </div>
          <Link href="/activity" className="text-xs text-white/30 hover:text-[var(--color-cyan)] transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-min">
          {groups.map((group, i) => (
            <UserTreeCard key={group.user.id} group={group} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
