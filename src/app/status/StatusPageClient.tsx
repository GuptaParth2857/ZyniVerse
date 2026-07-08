"use client";

import { useState, useEffect } from "react";

interface Service {
  name: string;
  status: "operational" | "degraded" | "down";
  description: string;
}

const SERVICES: Service[] = [
  { name: "API Server", status: "operational", description: "Handles all API requests" },
  { name: "AniList Upstream", status: "operational", description: "AniList GraphQL integration" },
  { name: "Database", status: "operational", description: "SQLite/Prisma data store" },
  { name: "GitHub Filler Data", status: "operational", description: "Crowdsourced filler guides" },
];

export default function StatusPageClient() {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastChecked(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-500";
      case "degraded": return "bg-yellow-500";
      case "down": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const allOperational = SERVICES.every((s) => s.status === "operational");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`h-3 w-3 rounded-full ${allOperational ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            System Status
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {allOperational ? "All Systems Operational" : "Some Systems Degraded"}
        </h1>
        <p className="mt-3 text-[var(--color-mute)]">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
      </div>

      {/* Services */}
      <div className="space-y-3 mb-12">
        {SERVICES.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4"
          >
            <div>
              <p className="font-display font-bold text-sm">{service.name}</p>
              <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{service.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--color-mute)] capitalize">{service.status}</span>
              <div className={`h-2.5 w-2.5 rounded-full ${statusColor(service.status)}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">API Version</p>
          <p className="font-display text-lg font-bold">v1.0.0</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <p className="text-[10px] font-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">Last Deploy</p>
          <p className="font-display text-lg font-bold">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      {/* Report link */}
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
