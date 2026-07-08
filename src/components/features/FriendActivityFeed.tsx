"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

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

const TYPE_ICONS: Record<string, string> = {
  COMPLETED: "✅", WATCHING: "▶️", CURRENT: "▶️", PLANNING: "📋",
  DROPPED: "⛔", PAUSED: "⏸️", REWATCHING: "🔄", REVIEWED: "⭐", RATED: "🎯", IMPORTED: "📥",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function FriendActivityFeed() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const url = session?.user?.id ? "/api/activity?type=following&limit=10" : "/api/activity?limit=10";
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setActivities(d.activities || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="animate-pulse h-40 rounded-xl bg-[var(--color-panel)]" />;
  if (activities.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Live</p>
          <h3 className="font-display text-lg font-bold">Friend Activity</h3>
        </div>
        <Link href="/activity" className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)]">View all →</Link>
      </div>
      <div className="space-y-2">
        {activities.map((a) => (
          <div key={a.id} className="flex items-center gap-3 group">
            <Link href={`/profile?user=${a.userId}`} className="shrink-0">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[var(--color-line)]">
                {a.user.avatar
                  ? <Image src={a.user.avatar} alt="" fill className="object-cover" sizes="32px" />
                  : <div className="h-full w-full flex items-center justify-center text-[10px] font-bold bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]">{a.user.username[0]}</div>
                }
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-xs truncate">
                <Link href={`/profile?user=${a.userId}`} className="font-semibold hover:text-[var(--color-cyan)]">{a.user.username}</Link>
                {" "}
                {a.type === "COMPLETED" && <span className="text-[var(--color-mute)]">completed</span>}
                {a.type === "WATCHING" && <span className="text-[var(--color-mute)]">started watching</span>}
                {a.type === "PLANNING" && <span className="text-[var(--color-mute)]">plans to watch</span>}
                {a.type === "DROPPED" && <span className="text-[var(--color-mute)]">dropped</span>}
                {a.type === "PAUSED" && <span className="text-[var(--color-mute)]">paused</span>}
                {a.type === "REVIEWED" && <span className="text-[var(--color-mute)]">reviewed</span>}
                {a.type === "RATED" && <span className="text-[var(--color-mute)]">rated</span>}
                {!["COMPLETED", "WATCHING", "PLANNING", "DROPPED", "PAUSED", "REVIEWED", "RATED", "CURRENT", "REWATCHING"].includes(a.type) && (
                  <span className="text-[var(--color-mute)]">{a.type?.toLowerCase()}</span>
                )}
                {" "}
                {a.mediaTitle && (
                  <Link href={`/anime/${a.mediaId}`} className="hover:text-[var(--color-cyan)]">{a.mediaTitle}</Link>
                )}
              </p>
              <p className="text-[10px] text-[var(--color-mute)]">{timeAgo(a.createdAt)}</p>
            </div>
            {a.mediaImage && (
              <Link href={`/anime/${a.mediaId}`} className="shrink-0">
                <div className="relative h-10 w-7 rounded overflow-hidden border border-[var(--color-line)]">
                  <Image src={a.mediaImage} alt="" fill className="object-cover" sizes="28px" />
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
