"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UsageDashboard from "./UsageDashboard";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  tier: string;
  requests: number;
  limit: number;
  lastUsed: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUsage, setShowUsage] = useState(false);

  useEffect(() => { fetchKeys(); }, []);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Failed to fetch keys");
      const data = await res.json();
      setKeys(data.keys);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create key");
      }
      const data = await res.json();
      setShowKey(data.key.key);
      setNewName("");
      setShowCreate(false);
      await fetchKeys();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke key");
      await fetchKeys();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function copyToClipboard(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-magenta)] border-t-transparent" />
          Loading API keys...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UsageDashboard />

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
        <div className="border-b border-[var(--color-line)] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm">API Keys</h3>
            <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Use our public API with your personal key</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUsage((o) => !o)}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition"
            >Usage</button>
            <button onClick={() => setShowCreate(true)}
              className="rounded-full bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition"
            >+ New Key</button>
          </div>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-b border-[var(--color-line)] overflow-hidden"
            >
              <div className="px-5 py-4 space-y-3">
                <input
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Discord Bot"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]"
                  onKeyDown={(e) => e.key === "Enter" && createKey()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={createKey} disabled={creating || !newName.trim()}
                    className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-xs font-bold text-black disabled:opacity-50"
                  >{creating ? "Creating..." : "Create Key"}</button>
                  <button onClick={() => setShowCreate(false)}
                    className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                  >Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New key revealed */}
        <AnimatePresence>
          {showKey && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border-b border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 px-5 py-4"
            >
              <p className="text-xs font-bold text-[var(--color-cyan)] mb-1">Key Created — Copy it now. You won&apos;t see it again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-[var(--color-void)] px-3 py-2 text-xs font-mono text-[var(--color-cyan)] border border-[var(--color-cyan)]/20 truncate">{showKey}</code>
                <button onClick={() => copyToClipboard(showKey, "new")}
                  className="shrink-0 rounded-lg bg-[var(--color-cyan)] px-3 py-2 text-xs font-bold text-black"
                >{copiedId === "new" ? "Copied!" : "Copy"}</button>
                <button onClick={() => setShowKey(null)}
                  className="shrink-0 text-xs text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                >✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="px-5 py-2 text-xs text-red-400">{error}</p>}

        {/* Key list */}
        {keys.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-[var(--color-mute)]">No API keys yet. Create one to get started.</p>
            <p className="text-[10px] text-[var(--color-mute)] mt-1">Free tier: 100 requests/day</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-line)]/50">
            {keys.map((k) => (
              <div key={k.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full shrink-0 ${k.active ? "bg-green-500" : "bg-red-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{k.name}</p>
                  <p className="text-[10px] font-mono text-[var(--color-mute)] truncate">
                    {k.key.slice(0, 12)}...{k.key.slice(-4)}
                  </p>
                  <p className="text-[9px] text-[var(--color-mute)] mt-0.5">
                    {k.requests}/{k.limit} requests · {k.tier} tier{k.lastUsed ? ` · Last used ${new Date(k.lastUsed).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <button onClick={() => copyToClipboard(k.key, k.id)}
                  className="shrink-0 rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[10px] font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                >{copiedId === k.id ? "Copied" : "Copy"}</button>
                {k.active && (
                  <>
                    <Link href="/premium"
                      className="shrink-0 rounded-lg border border-[var(--color-magenta)]/30 px-3 py-1.5 text-[10px] font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/10 transition-colors"
                    >Upgrade</Link>
                    <button onClick={() => revokeKey(k.id)}
                      className="shrink-0 rounded-lg border border-red-500/30 px-3 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >Revoke</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* API docs link */}
        <div className="border-t border-[var(--color-line)] px-5 py-3 flex items-center justify-between">
          <a href="/api/v1/filler/20" target="_blank"
            className="text-[10px] text-[var(--color-mute)] hover:text-[var(--color-cyan)] underline"
          >View API Docs →</a>
          <Link href="/premium"
            className="text-[10px] text-[var(--color-magenta)] hover:underline font-semibold"
          >Need more? Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
