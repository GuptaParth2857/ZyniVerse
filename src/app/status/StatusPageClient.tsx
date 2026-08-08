"use client";

import { useCallback, useEffect, useState } from "react";

type ServiceStatus = "operational" | "degraded" | "down";

interface ServiceResult {
  name: string;
  status: ServiceStatus;
  description: string;
  latencyMs: number | null;
  detail: string;
}

interface StatusPayload {
  generatedAt: string;
  status: ServiceStatus;
  services: ServiceResult[];
  meta: {
    node: string;
    platform: string;
    region: string;
    uptimeMs: number;
    rssMB: number;
  };
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

const DOT_COLOR: Record<ServiceStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
};

const HEADER_COLOR: Record<ServiceStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
};

const HEADER_TEXT: Record<ServiceStatus, string> = {
  operational: "All Systems Operational",
  degraded: "Some Systems Degraded",
  down: "Systems Down",
};

export default function StatusPageClient() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Status endpoint returned HTTP ${res.status}`);
        return res.json();
      })
      .then((payload: StatusPayload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to fetch status");
      });
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.resolve(load()).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const header = data?.status ?? "operational";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className={`h-3 w-3 rounded-full ${HEADER_COLOR[header]} animate-pulse`}
          />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            System Status
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            {error ? "Status Unavailable" : HEADER_TEXT[header]}
          </div>
        </h1>
        <p className="mt-3 text-[var(--color-mute)]">
          Last checked:{" "}
          {data
            ? new Date(data.generatedAt).toLocaleTimeString()
            : error
              ? "—"
              : "Checking…"}
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--color-cyan)]/40 px-4 py-2 text-sm text-[var(--color-cyan)] transition hover:bg-[var(--color-cyan)]/10 disabled:opacity-50"
        >
          {refreshing ? "Checking…" : "Refresh now"}
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          Could not reach the status endpoint: {error}
        </div>
      )}

      <div className="space-y-3 mb-12">
        {(data?.services ?? []).map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4"
          >
            <div>
              <p className="font-display font-bold text-sm">{service.name}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">
                {service.description}
              </p>
              {service.detail && (
                <p className="text-[10px] font-mono text-[var(--color-mute)] mt-0.5 break-all">
                  {service.detail}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--color-mute)]">
                {service.latencyMs != null ? `${service.latencyMs}ms` : "—"}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-mute)] capitalize">
                {STATUS_LABEL[service.status]}
              </span>
              <div
                className={`h-2.5 w-2.5 rounded-full ${DOT_COLOR[service.status]}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">
            API Version
          </p>
          <p className="font-display text-lg font-bold">v1.0.0</p>
        </div>
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">
            Runtime
          </p>
          <p className="font-display text-lg font-bold break-all">
            {data ? `Node ${data.meta.node}` : "—"}
          </p>
          <p className="text-[10px] text-[var(--color-mute)] mt-1">
            {data ? `${data.meta.platform} · ${data.meta.region}` : ""}
          </p>
        </div>
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">
            Server Uptime
          </p>
          <p className="font-display text-lg font-bold">
            {data ? formatUptime(data.meta.uptimeMs) : "—"}
          </p>
        </div>
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">
            Memory (RSS)
          </p>
          <p className="font-display text-lg font-bold">
            {data ? `${data.meta.rssMB} MB` : "—"}
          </p>
        </div>
      </div>

      <div className="text-center">
        <a
          href="https://github.com/anomalyco/ZyniVerse/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--color-cyan)] hover:underline"
        >
          Report an issue on GitHub →
        </a>
      </div>
    </div>
  );
}
