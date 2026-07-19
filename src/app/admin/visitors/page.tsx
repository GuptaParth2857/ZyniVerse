"use client";

import { useEffect, useState, useCallback } from "react";

interface ActiveSession {
  id: string;
  userId: string | null;
  username: string;
  avatar: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  pagesViewed: number;
  lastActiveAt: string;
  startedAt: string;
}

interface VisitorsData {
  liveCount: number;
  activeSessions: ActiveSession[];
  todayVisitors: number;
  anonymousVisitors: number;
  topPages: Array<{ path: string; count: number }>;
}

export default function AdminVisitorsPage() {
  const [data, setData] = useState<VisitorsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/visitors/active");
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--color-mute)] text-sm">Loading visitors...</div>
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

  return (
    <div className="max-w-6xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin</p>
      <h1 className="font-display text-3xl font-bold mt-1">Live Visitors</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">Real-time visitor tracking. Auto-refreshes every 15s.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <div className="font-mono text-xs text-[var(--color-mute)] uppercase tracking-wider">Live Now</div>
          <div className="text-4xl font-bold text-green-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {data.liveCount}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <div className="font-mono text-xs text-[var(--color-mute)] uppercase tracking-wider">Today&apos;s Visitors</div>
          <div className="text-4xl font-bold text-[var(--color-cyan)] mt-2">{data.todayVisitors}</div>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <div className="font-mono text-xs text-[var(--color-mute)] uppercase tracking-wider">Anonymous Today</div>
          <div className="text-4xl font-bold text-[var(--color-violet)] mt-2">{data.anonymousVisitors}</div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Active Sessions ({data.activeSessions.length})</h2>
        {data.activeSessions.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center text-[var(--color-mute)] text-sm">
            No active sessions right now.
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)]">
                    <th className="text-left py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Device</th>
                    <th className="text-left py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Browser</th>
                    <th className="text-left py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">OS</th>
                    <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Pages</th>
                    <th className="text-right py-3 px-4 text-[var(--color-mute)] font-medium text-xs uppercase tracking-wider">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activeSessions.map((s) => (
                    <tr key={s.id} className="border-b border-[var(--color-line)] hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--color-line)] flex items-center justify-center text-[9px]">
                              {s.username[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs">{s.username}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--color-mute)]">{s.device || "—"}</td>
                      <td className="py-3 px-4 text-xs text-[var(--color-mute)]">{s.browser || "—"}</td>
                      <td className="py-3 px-4 text-xs text-[var(--color-mute)]">{s.os || "—"}</td>
                      <td className="py-3 px-4 text-xs text-right text-[var(--color-cyan)]">{s.pagesViewed}</td>
                      <td className="py-3 px-4 text-xs text-right text-[var(--color-mute)]">
                        {new Date(s.lastActiveAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {data.topPages.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Most Visited Pages Today</h2>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
            <div className="space-y-2">
              {data.topPages.map((p) => (
                <div key={p.path} className="flex items-center justify-between py-1 border-b border-[var(--color-line)] last:border-0">
                  <span className="font-mono text-xs">{p.path}</span>
                  <span className="text-[var(--color-cyan)] text-sm font-medium">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
