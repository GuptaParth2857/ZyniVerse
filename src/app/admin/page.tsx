"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OverviewData {
  totalUsers: number;
  todayUsers: number;
  pendingFeedback: number;
  todayPageViews: number;
  liveVisitors: number;
  recentFeedback: Array<{
    id: string;
    type: string;
    message: string;
    status: string;
    isFeatured: boolean;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    username: string;
    avatar: string | null;
    createdAt: string;
  }>;
}

const typeColors: Record<string, string> = {
  bug: "bg-red-500/20 text-red-400",
  suggestion: "bg-blue-500/20 text-blue-400",
  feature: "bg-green-500/20 text-green-400",
  other: "bg-gray-500/20 text-gray-400",
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--color-mute)] text-sm">Loading overview...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--color-mute)] text-sm">Admin access required.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: data.totalUsers.toLocaleString(), icon: "👥", color: "text-[var(--color-cyan)]" },
    { label: "Live Visitors", value: data.liveVisitors.toLocaleString(), icon: "👁️", color: "text-green-400" },
    { label: "Pending Feedback", value: data.pendingFeedback.toLocaleString(), icon: "💬", color: "text-[var(--color-amber)]" },
    { label: "Today's Views", value: data.todayPageViews.toLocaleString(), icon: "📄", color: "text-[var(--color-violet)]" },
    { label: "New Users Today", value: data.todayUsers.toLocaleString(), icon: "🆕", color: "text-[var(--color-magenta)]" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin</p>
      <h1 className="font-display text-3xl font-bold mt-1">Overview</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">Quick snapshot of your platform.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--color-mute)] uppercase tracking-wider">{s.label}</span>
              <span className="text-lg">{s.icon}</span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Feedback</h2>
            <Link href="/admin/feedback" className="text-xs text-[var(--color-cyan)] hover:underline">View all</Link>
          </div>
          {data.recentFeedback.length === 0 ? (
            <p className="text-[var(--color-mute)] text-sm">No feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentFeedback.map((f) => (
                <div key={f.id} className="flex items-start gap-3 rounded-lg border border-[var(--color-line)] p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${typeColors[f.type] || typeColors.other}`}>
                    {f.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{f.message}</p>
                    <p className="text-[10px] text-[var(--color-mute)] mt-1">
                      {new Date(f.createdAt).toLocaleDateString()}
                      {f.isFeatured && <span className="ml-2 text-[var(--color-amber)]">★ Featured</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-[var(--color-cyan)] hover:underline">View all</Link>
          </div>
          {data.recentUsers.length === 0 ? (
            <p className="text-[var(--color-mute)] text-sm">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] p-3">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-line)] flex items-center justify-center text-xs">
                      {u.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.username}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
