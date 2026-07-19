"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface UsageData {
  key: string;
  tier: string;
  today: number;
  thisMonth: number;
  total: number;
  limit: number;
  remaining: number;
  resetAt: string;
}

interface KeyWithUsage {
  id: string;
  name: string;
  key: string;
  tier: string;
  requests: number;
  limit: number;
  lastUsed: string | null;
  active: boolean;
  createdAt: string;
  usage?: { today: number; thisMonth: number; total: number };
}

export default function UsageDashboard() {
  const [keys, setKeys] = useState<KeyWithUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const keysWithUsage = await Promise.all(
        data.keys.map(async (k: KeyWithUsage) => {
          try {
            const usageRes = await fetch("/api/v1/usage", {
              headers: { Authorization: `Bearer ${k.key}` },
            });
            if (usageRes.ok) {
              const usageData: UsageData = await usageRes.json();
              return { ...k, usage: { today: usageData.today, thisMonth: usageData.thisMonth, total: usageData.total } };
            }
          } catch {}
          return { ...k, usage: { today: 0, thisMonth: 0, total: k.requests } };
        })
      );
      setKeys(keysWithUsage);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchKeys();
  }, [fetchKeys]);

  function getRateLimitColor(today: number, limit: number): string {
    const pct = limit > 0 ? (today / limit) * 100 : 0;
    if (pct >= 90) return "bg-red-500";
    if (pct >= 60) return "bg-yellow-500";
    return "bg-green-500";
  }

  function getRateLimitText(today: number, limit: number): string {
    const pct = limit > 0 ? (today / limit) * 100 : 0;
    if (pct >= 90) return "Critical";
    if (pct >= 60) return "Warning";
    return "Active";
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
          Loading usage stats...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm">API Usage Dashboard</h3>
          <Link href="/premium" className="rounded-full bg-[var(--color-magenta)] px-4 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition">
            Upgrade Plan
          </Link>
        </div>

        {keys.length === 0 ? (
          <p className="text-sm text-[var(--color-mute)] text-center py-4">No API keys found.</p>
        ) : (
          <div className="space-y-4">
            {keys.map((k) => {
              const today = k.usage?.today || 0;
              const limit = k.limit;
              const pct = limit > 0 ? Math.min(100, (today / limit) * 100) : 0;
              return (
                <div key={k.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{k.name}</p>
                      <p className="text-[10px] font-mono text-[var(--color-mute)]">
                        {k.key.slice(0, 12)}... · {k.tier} tier
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${getRateLimitColor(today, limit)}`} />
                      <span className="text-[10px] font-medium">{getRateLimitText(today, limit)}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-[var(--color-mute)] mb-1">
                      <span>Daily Usage</span>
                      <span>{today.toLocaleString()} / {limit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${getRateLimitColor(today, limit)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold font-mono">{k.usage?.thisMonth || 0}</p>
                      <p className="text-[9px] text-[var(--color-mute)]">This Month</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-mono">{k.usage?.total || 0}</p>
                      <p className="text-[9px] text-[var(--color-mute)]">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-mono">{limit - today}</p>
                      <p className="text-[9px] text-[var(--color-mute)]">Remaining Today</p>
                    </div>
                  </div>

                  {pct >= 80 && (
                    <div className="mt-3 rounded-lg bg-[var(--color-magenta)]/10 border border-[var(--color-magenta)]/20 px-3 py-2 text-center">
                      <p className="text-[10px] text-[var(--color-magenta)] font-medium">
                        Approaching your daily limit.{' '}
                        <Link href="/premium" className="underline font-bold">Upgrade for higher limits →</Link>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
