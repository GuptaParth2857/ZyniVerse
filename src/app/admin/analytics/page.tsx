"use client";

import { useEffect, useState } from "react";

interface Metrics {
  dau: number;
  wau: number;
  mau: number;
  totalPageViews: number;
  topPages: Array<{ path: string; count: number }>;
  searchTrends: Array<{ query: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  retentionRate: number;
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => {
        setAccessDenied(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--color-mute)] text-sm">Loading analytics...</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--color-mute)] text-sm">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const kpis = [
    { label: "DAU", value: metrics.dau },
    { label: "WAU", value: metrics.wau },
    { label: "MAU", value: metrics.mau },
    { label: "Retention", value: `${(metrics.retentionRate * 100).toFixed(1)}%` },
    { label: "Total Page Views", value: metrics.totalPageViews.toLocaleString() },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin</p>
      <h1 className="font-display text-3xl font-bold mt-1">Analytics Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">Platform metrics and retention insights.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <div className="font-mono text-xs text-[var(--color-mute)] uppercase tracking-wider">{kpi.label}</div>
            <div className="text-2xl font-bold mt-2">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
          {metrics.topPages.length === 0 ? (
            <p className="text-[var(--color-mute)] text-sm">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)]">
                    <th className="text-left py-2 text-[var(--color-mute)] font-medium">Path</th>
                    <th className="text-right py-2 text-[var(--color-mute)] font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topPages.map((page) => (
                    <tr key={page.path} className="border-b border-[var(--color-line)]">
                      <td className="py-2 font-mono text-xs">{page.path}</td>
                      <td className="py-2 text-right text-[var(--color-cyan)]">{page.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
          <h2 className="text-lg font-semibold mb-4">Search Trends</h2>
          {metrics.searchTrends.length === 0 ? (
            <p className="text-[var(--color-mute)] text-sm">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)]">
                    <th className="text-left py-2 text-[var(--color-mute)] font-medium">Query</th>
                    <th className="text-right py-2 text-[var(--color-mute)] font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.searchTrends.map((s) => (
                    <tr key={s.query} className="border-b border-[var(--color-line)]">
                      <td className="py-2">{s.query}</td>
                      <td className="py-2 text-right text-[var(--color-cyan)]">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h2 className="text-lg font-semibold mb-4">User Growth</h2>
        {metrics.userGrowth.length === 0 ? (
          <p className="text-[var(--color-mute)] text-sm">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {metrics.userGrowth.map((g) => (
              <div key={g.date} className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
                <span className="text-sm font-mono">{g.date}</span>
                <span className="text-[var(--color-cyan)] text-sm font-medium">+{g.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
