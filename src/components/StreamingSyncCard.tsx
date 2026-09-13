"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type SyncData = {
  connected: boolean;
  configured?: boolean;
  connectedAt?: string | null;
  lastSync?: string | null;
  lastSyncData?: { imported?: number; updated?: number; episodes?: number; skipped?: number; totalFetched?: number } | null;
};

export default function StreamingSyncCard({ themeColor = "var(--color-magenta)" }: { themeColor?: string }) {
  const searchParams = useSearchParams();
  const simklNotice = searchParams.get("simkl");

  const [data, setData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/simkl/sync");
      setData(await res.json());
    } catch {
      setData({ connected: false, configured: false });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/simkl/init");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start connection");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      setBusy(false);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/simkl/sync", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Sync failed");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/simkl/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setData({ connected: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setBusy(false);
    }
  };

  const s = data?.lastSyncData;
  const connected = data?.connected;
  const configured = data?.configured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold mb-1 flex items-center gap-2">
              <span className="h-1 w-4 rounded-full" style={{ background: themeColor }} />
              Streaming Sync
            </h3>
            <p className="text-xs text-[var(--color-mute)]">
              Connect your Simkl account to auto-import your watch history from streaming services (Crunchyroll, Netflix, JioHotstar & more).
            </p>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
              connected ? "text-green-400 bg-green-400/10" : "text-[var(--color-mute)] bg-[var(--color-line)]/30"
            }`}
          >
            {connected ? "● CONNECTED" : "○ DISCONNECTED"}
          </span>
        </div>

        {configured === false && !connected && (
          <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            Streaming sync is not live yet — admin needs to add the Simkl API keys. The button will appear once enabled.
          </p>
        )}

        {simklNotice === "connected" && (
          <p className="mt-3 text-sm text-green-400">Simkl connected. Run a sync to import your history.</p>
        )}
        {simklNotice === "error" && (
          <p className="mt-3 text-sm text-[var(--color-magenta)]">Simkl connection failed. Please try again.</p>
        )}
        {error && <p className="mt-3 text-sm text-[var(--color-magenta)]">{error}</p>}

        {connected ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-[var(--color-void)] px-4 py-3 text-xs text-[var(--color-mute)] font-mono leading-relaxed">
              {data?.lastSync ? (
                <>
                  Last sync: {new Date(data.lastSync).toLocaleString()}
                  {s && (
                    <span className="block mt-0.5 text-[var(--color-ink)]">
                      {s.imported ?? 0} imported · {s.updated ?? 0} updated · {s.episodes ?? 0} episodes · {s.skipped ?? 0} skipped
                    </span>
                  )}
                </>
              ) : (
                <>Not synced yet. Your list will populate on first sync.</>
              )}
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <button
                onClick={syncNow}
                disabled={syncing || busy}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: themeColor }}
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
              <button
                onClick={disconnect}
                disabled={busy}
                className="rounded-lg px-5 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50"
                style={{ color: "var(--color-magenta)", border: "1px solid var(--color-magenta)40", background: "var(--color-magenta)08" }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={busy}
            className="mt-4 rounded-lg px-5 py-2 text-sm font-semibold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: themeColor }}
          >
            {busy ? "Connecting..." : "Connect Simkl"}
          </button>
        )}
      </div>
    </motion.div>
  );
}