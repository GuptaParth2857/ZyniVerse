"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { logError } from "@/lib/logger";

const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

interface WebhookDelivery {
  id: string;
  event: string;
  status: string;
  response: string | null;
  attempts: number;
  createdAt: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
  deliveries: WebhookDelivery[];
  _count: { deliveries: number };
}

const EVENT_TYPES = [
  { value: "anime.completed", label: "Anime Completed", hint: "🔚" },
  { value: "anime.started", label: "Anime Started", hint: "▶️" },
  { value: "episode.watched", label: "Episode Watched", hint: "📺" },
  { value: "review.created", label: "Review Created", hint: "✍️" },
  { value: "list.updated", label: "List Updated", hint: "📚" },
];

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (target <= 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Stat({ value, label, accent = "text-white" }: { value: number; label: string; accent?: string }) {
  const v = useCountUp(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`font-display text-2xl font-bold tabular-nums ${accent}`}>{v.toLocaleString("en-IN")}</span>
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-500/10 text-green-400 border-green-500/30",
    failed: "bg-red-500/10 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

export default function WebhookManager() {
  const { status: sessionStatus } = useSession();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "failed"; text: string } | null>(null);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (e) {
      logError(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchWebhooks();
  }, [sessionStatus, fetchWebhooks]);

  function notify(type: "success" | "failed", text: string) {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3500);
  }

  function openCreate() {
    setEditId(null);
    setFormUrl("");
    setFormEvents([]);
    setShowForm(true);
  }

  function openEdit(wh: Webhook) {
    setEditId(wh.id);
    setFormUrl(wh.url);
    setFormEvents(JSON.parse(wh.events));
    setShowForm(true);
  }

  function toggleEvent(value: string) {
    setFormEvents((prev) => {
      if (value === "*") return prev.includes("*") ? [] : ["*"];
      if (prev.includes("*")) return [value];
      return prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value];
    });
  }

  async function handleSave() {
    if (!formUrl.trim() || formEvents.length === 0 || saving) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/webhooks/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formUrl, events: formEvents }),
        });
        if (!res.ok) throw new Error(`update failed (${res.status})`);
        const data = await res.json();
        setWebhooks((prev) => prev.map((w) => (w.id === editId ? { ...w, ...data.webhook } : w)));
        notify("success", "Webhook updated.");
      } else {
        const res = await fetch("/api/webhooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formUrl, events: formEvents }),
        });
        if (!res.ok) throw new Error(`create failed (${res.status})`);
        const data = await res.json();
        if (data.webhook) {
          setWebhooks((prev) => [{ ...data.webhook, deliveries: [], _count: { deliveries: 0 } }, ...prev]);
          notify("success", "Webhook created!");
        }
      }
      setShowForm(false);
    } catch (e) {
      notify("failed", e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  }

  async function handleTest(id: string) {
    setTesting(id);
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      const data = await res.json();
      if (data.delivery) {
        notify(data.delivery.status === "success" ? "success" : "failed", data.delivery.status === "success" ? "Test ping delivered OK." : `Delivery failed: ${data.delivery.response || "no response"}`);
      }
      await fetchWebhooks();
    } catch {
      notify("failed", "Test failed to dispatch.");
    }
    setTesting(null);
  }

  async function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      window.setTimeout(() => setConfirmDelete((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      notify("success", "Webhook deleted.");
    } catch (_e) {
      notify("failed", "Could not delete webhook.");
    }
    setConfirmDelete(null);
  }

  async function toggleActive(id: string, isActive: boolean) {
    const target = !isActive;
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: target } : w)));
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: target }),
      });
      if (!res.ok) throw new Error("toggle failed");
      notify("success", target ? "Webhook enabled." : "Webhook paused.");
    } catch {
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: isActive } : w)));
      notify("failed", "Could not update webhook.");
    }
  }

  async function copySecret(id: string, secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(id);
      window.setTimeout(() => setCopied((cur) => (cur === id ? null : cur)), 2000);
    } catch {
      notify("failed", "Could not copy to clipboard.");
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 shimmer" />
        ))}
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="neon-rgb-ring animate-page-in relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
        <div className="relative z-10 px-8 py-14 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-magenta)]">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold">
            <span className="neon-text-gradient">Link your server to ZyniVerse</span>
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Sign in to create webhooks, watch live deliveries, and subscribe to real-time events.
          </p>
          <a
            href="/login"
            className="mt-8 inline-flex rounded-xl px-7 py-3 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110"
            style={{ background: "linear-gradient(90deg, #00ffe0, #ff7ad9)", boxShadow: "0 0 26px rgba(0,255,224,0.3)" }}
          >
            Sign In to Manage
          </a>
        </div>
      </div>
    );
  }

  const totalDeliveries = webhooks.reduce((a, w) => a + (w._count?.deliveries || 0), 0);
  const successful = webhooks.reduce(
    (a, w) => a + (w.deliveries[0]?.status === "success" ? 1 : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={SPRING}
            className={`fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur ${
              toast.type === "success"
                ? "border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]"
                : "border-red-500/40 bg-red-500/15 text-red-400"
            }`}
            onClick={() => setToast(null)}
          >
            {toast.type === "success" ? "✓" : "✕"} {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, ...SPRING }}
        className="neon-premium rounded-[24px]"
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="relative flex flex-wrap items-center gap-x-10 gap-y-4 px-8 py-5">
          <Stat value={webhooks.length} label="Webhooks" accent="text-[var(--color-cyan)]" />
          <div className="h-9 w-px bg-white/10" />
          <Stat value={totalDeliveries} label="Deliveries" />
          <div className="h-9 w-px bg-white/10" />
          <Stat
            value={webhooks.length ? Math.round((successful / webhooks.length) * 100) : 0}
            label="Last delivery success"
            accent="text-[var(--color-magenta)]"
          />
          <div className="ml-auto flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] bg-[length:200%_100%] transition-[background-position] duration-500 group-hover:bg-[position:100%_0]" />
              <span className="relative z-10 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Webhook
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Create / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="neon-rgb-ring relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#120d1d] to-[#0a0812]" />
              <div className="relative z-10 p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">
                    <span className="neon-text-gradient">{editId ? "Edit Webhook" : "Create Webhook"}</span>
                  </h3>
                  <button onClick={() => setShowForm(false)} className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-all">
                    Cancel
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">Your server URL</label>
                    <input
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://your-server.com/hook (e.g. a bot you own)"
                      className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 font-mono text-sm text-[var(--color-ink)] placeholder:font-sans focus:border-[var(--color-cyan)] focus:shadow-[0_0_24px_rgba(0,255,224,0.12)] focus:outline-none"
                    />
                    {formUrl && !/^https?:\/\//.test(formUrl) && (
                      <p className="mt-1.5 text-[11px] text-red-400">URL must start with http:// or https://</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[var(--color-mute)]">What should we notify you about?</label>
                    <LayoutGroup>
                      <motion.div layout className="flex flex-wrap gap-2">
                        {EVENT_TYPES.map((evt) => {
                          const active = formEvents.includes(evt.value);
                          const allMode = formEvents.includes("*");
                          return (
                            <motion.button
                              layout
                              key={evt.value}
                              onClick={() => toggleEvent(evt.value)}
                              className={`relative overflow-hidden rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                                active && !allMode
                                  ? "border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]"
                                  : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/30 hover:text-[var(--color-ink)]"
                              }`}
                            >
                              <span className="relative z-10 flex items-center gap-1.5">
                                <span>{evt.hint}</span>
                                {evt.label}
                              </span>
                              {active && !allMode && (
                                <motion.span
                                  layoutId="evt-active"
                                  className="absolute inset-0 bg-[var(--color-cyan)]/5"
                                  transition={SPRING}
                                />
                              )}
                            </motion.button>
                          );
                        })}
                        <motion.button
                          layout
                          key="*"
                          onClick={() => toggleEvent("*")}
                          className={`rounded-xl border px-3.5 py-2 font-mono text-xs font-bold transition-colors ${
                            formEvents.includes("*")
                              ? "border-[var(--color-magenta)]/50 bg-[var(--color-magenta)]/15 text-[var(--color-magenta)]"
                              : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/30 hover:text-[var(--color-ink)]"
                          }`}
                        >
                          * (all)
                        </motion.button>
                      </motion.div>
                    </LayoutGroup>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={saving || !formUrl.trim() || formEvents.length === 0 || !/^https?:\/\//.test(formUrl.trim())}
                      className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-40"
                    >
                      {saving ? "Saving..." : editId ? "Save Changes" : "Create Webhook"}
                    </motion.button>
                    <p className="text-[11px] text-[var(--color-mute)]">
                      A secret is created automatically — you can reveal it after saving to verify messages on your end.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 shimmer" />
          ))}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`s${i}`} className="h-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/40 shimmer" />
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, ...SPRING }}
          className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/30 px-6 py-14 text-center"
        >
          <div className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-magenta)]/30 bg-gradient-to-br from-[var(--color-magenta)]/15 to-[var(--color-cyan)]/15">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-cyan)]">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <p className="font-display text-lg font-bold">No webhooks yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Wire up your first endpoint and start getting real-time ZyniVerse events.
          </p>
          <button
            onClick={openCreate}
            className="mt-6 inline-flex rounded-xl px-6 py-2.5 text-sm font-bold text-black transition-all hover:brightness-110"
            style={{ background: "linear-gradient(90deg, #00ffe0, #ff7ad9)", boxShadow: "0 0 26px rgba(0,255,224,0.3)" }}
          >
            Create Your First Webhook
          </button>
        </motion.div>
      ) : (
        <LayoutGroup>
          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout">
              {webhooks.map((wh, i) => {
                const events = JSON.parse(wh.events) as string[];
                const expanded = expandedId === wh.id;
                const last = wh.deliveries[0];
                return (
                  <motion.div
                    layout
                    key={wh.id}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: Math.min(i * 0.06, 0.4), ...SPRING }}
                    className={`overflow-hidden rounded-2xl border bg-[var(--color-panel)]/50 transition-colors ${
                      wh.isActive ? "border-[var(--color-line)]" : "border-[var(--color-line)]/60 opacity-70"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                      <button
                        onClick={() => toggleActive(wh.id, wh.isActive)}
                        aria-label={wh.isActive ? "Pause webhook" : "Enable webhook"}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
                          wh.isActive ? "bg-[var(--color-cyan)] shadow-[0_0_12px_rgba(0,255,224,0.4)]" : "bg-[var(--color-void)]"
                        }`}
                      >
                        <motion.span
                          layout
                          animate={{ x: wh.isActive ? 22 : 2 }}
                          transition={SPRING}
                          className="absolute top-1 h-4 w-4 rounded-full bg-white"
                        />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-mono text-sm font-semibold text-[var(--color-ink)]">{wh.url}</p>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <span className="text-[11px] text-[var(--color-mute)]">{wh._count.deliveries} deliveries</span>
                          {events.includes("*") ? (
                            <span className="rounded-full border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-magenta)]">* all events</span>
                          ) : (
                            <span className="flex flex-wrap items-center gap-1">
                              {events.slice(0, 3).map((evt) => (
                                <span key={evt} className="rounded-full border border-[var(--color-cyan)]/25 bg-[var(--color-cyan)]/5 px-2 py-0.5 font-mono text-[10px] text-[var(--color-cyan)]">
                                  {evt}
                                </span>
                              ))}
                              {events.length > 3 && (
                                <span className="text-[10px] text-[var(--color-mute)]">+{events.length - 3} more</span>
                              )}
                            </span>
                          )}
                          {last && (
                            <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-mute)]">
                              <span className={`h-1.5 w-1.5 rounded-full ${last.status === "success" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" : last.status === "failed" ? "bg-red-400" : "bg-yellow-400"}`} />
                              {last.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleTest(wh.id)}
                          disabled={testing === wh.id || !wh.isActive}
                          className="rounded-xl border border-[var(--color-line)] px-3.5 py-2 text-[11px] font-bold text-[var(--color-mute)] transition-all hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)] disabled:opacity-50"
                        >
                          {testing === wh.id ? (
                            <span className="flex items-center gap-1.5">
                              <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-[var(--color-cyan)] border-t-transparent" />
                              Sending
                            </span>
                          ) : (
                            "Test"
                          )}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => openEdit(wh)}
                          className="rounded-xl border border-[var(--color-line)] px-3.5 py-2 text-[11px] font-bold text-[var(--color-mute)] transition-all hover:border-[var(--color-magenta)]/40 hover:text-[var(--color-magenta)]"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleDelete(wh.id)}
                          className={`rounded-xl border px-3.5 py-2 text-[11px] font-bold transition-all ${
                            confirmDelete === wh.id
                              ? "border-red-500/50 bg-red-500/10 text-red-400"
                              : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-red-400/40 hover:text-red-400"
                          }`}
                        >
                          {confirmDelete === wh.id ? "Sure?" : "Delete"}
                        </motion.button>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(expanded ? null : wh.id)}
                      className="flex w-full items-center justify-between border-t border-[var(--color-line)]/60 px-5 py-2.5 text-[11px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
                    >
                      <span>{expanded ? "Hide recent deliveries & your secret" : "View recent deliveries & your secret"}</span>
                      <motion.svg
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={SPRING}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-5 border-t border-[var(--color-line)]/60 p-5">
                            {/* Secret */}
                            <div className="rounded-xl border border-[var(--color-line)]/60 bg-[var(--color-ink)]/3 p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">Your secret</p>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setRevealId(revealId === wh.id ? null : wh.id)}
                                    className="rounded-lg border border-[var(--color-line)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                                  >
                                    {revealId === wh.id ? "Hide" : "Reveal"}
                                  </button>
                                  <button
                                    onClick={() => copySecret(wh.id, wh.secret)}
                                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                                      copied === wh.id
                                        ? "border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                                        : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/30"
                                    }`}
                                  >
                                    {copied === wh.id ? "Copied!" : "Copy"}
                                  </button>
                                </div>
                              </div>
                              <code className="block break-all font-mono text-xs text-[var(--color-cyan)]">
                                {revealId === wh.id ? wh.secret : "••••••••••••••••••••••••••••••••••" + wh.secret.slice(-6)}
                              </code>
                            </div>

                            {/* Deliveries */}
                            <div>
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">Recent deliveries</p>
                              {wh.deliveries.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[var(--color-line)] px-4 py-6 text-center">
                                  <p className="text-xs text-[var(--color-mute)]">Nothing sent yet — press Test to fire a sample message and watch it land here.</p>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                  {wh.deliveries.slice(0, 20).map((d) => (
                                    <div key={d.id} className="rounded-xl border border-[var(--color-line)]/50 bg-[var(--color-ink)]/3 px-3.5 py-3">
                                      <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${d.status === "success" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" : d.status === "failed" ? "bg-red-400" : "bg-yellow-400"}`} />
                                        <span className="font-mono text-[11px] font-semibold text-[var(--color-cyan)]">{d.event}</span>
                                        {d.attempts > 1 && (
                                          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">{d.attempts} attempts</span>
                                        )}
                                        <span className="ml-auto flex items-center gap-2">
                                          <StatusBadge status={d.status} />
                                          <span className="text-[10px] text-[var(--color-mute)]">{new Date(d.createdAt).toLocaleString()}</span>
                                        </span>
                                      </div>
                                      {d.response && (
                                        <p className="mt-2 line-clamp-2 break-all font-mono text-[10px] leading-relaxed text-[var(--color-mute)]">{d.response}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}
    </div>
  );
}