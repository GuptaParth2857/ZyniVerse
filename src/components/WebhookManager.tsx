"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

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
  { value: "anime.completed", label: "Anime Completed" },
  { value: "anime.started", label: "Anime Started" },
  { value: "episode.watched", label: "Episode Watched" },
  { value: "review.created", label: "Review Created" },
  { value: "list.updated", label: "List Updated" },
];

export default function WebhookManager() {
  const { data: session } = useSession();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!session?.user?.id) { setLoading(false); return; }
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch {}
    setLoading(false);
  }, [session]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

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

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/webhooks/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formUrl, events: formEvents }),
        });
        const data = await res.json();
        setWebhooks((prev) => prev.map((w) => (w.id === editId ? { ...w, ...data.webhook } : w)));
      } else {
        const res = await fetch("/api/webhooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formUrl, events: formEvents }),
        });
        const data = await res.json();
        if (data.webhook) {
          setWebhooks((prev) => [{ ...data.webhook, deliveries: [], _count: { deliveries: 0 } }, ...prev]);
        }
      }
      setShowForm(false);
    } catch {}
    setSaving(false);
  }

  async function handleTest(id: string) {
    setTesting(id);
    try {
      await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      await fetchWebhooks();
    } catch {}
    setTesting(null);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch {}
    setDeleting(null);
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await fetch(`/api/webhooks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w)));
    } catch {}
  }

  if (!session?.user?.id) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--color-mute)]">Login to manage webhooks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Your Webhooks</h2>
        <button onClick={openCreate}
          className="rounded-lg bg-gradient-to-r from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 border border-[var(--color-cyan)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:from-[var(--color-cyan)]/30 hover:to-[var(--color-magenta)]/30 transition-all">
          + New Webhook
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 overflow-hidden">
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-4">{editId ? "Edit Webhook" : "Create Webhook"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--color-mute)] mb-1 block">Endpoint URL</label>
                <input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://your-server.com/webhook"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-cyan)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-mute)] mb-2 block">Events</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((evt) => (
                    <button key={evt.value}
                      onClick={() => setFormEvents((prev) => prev.includes(evt.value) ? prev.filter((e) => e !== evt.value) : [...prev, evt.value])}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                        formEvents.includes(evt.value) ? "bg-[var(--color-cyan)]/20 border-[var(--color-cyan)]/40 text-[var(--color-cyan)]" : "text-[var(--color-mute)] border-[var(--color-line)] hover:text-[var(--color-ink)]"
                      }`}>
                      {evt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving || !formUrl || formEvents.length === 0}
                  className="rounded-lg bg-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/30 transition-all disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webhook list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shimmer" />
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-[var(--color-mute)]">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <p className="text-sm text-[var(--color-mute)]">No webhooks configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => toggleActive(wh.id, wh.isActive)}
                  className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${wh.isActive ? "bg-[var(--color-cyan)]" : "bg-[var(--color-void)]"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${wh.isActive ? "left-5" : "left-0.5"}`} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{wh.url}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-[var(--color-mute)]">{wh._count.deliveries} deliveries</span>
                    {wh.deliveries[0] && (
                      <span className="text-[10px] text-[var(--color-mute)]">
                        Last: {new Date(wh.deliveries[0].createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleTest(wh.id)} disabled={testing === wh.id}
                    className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/30 transition-all disabled:opacity-50">
                    {testing === wh.id ? "Sending..." : "Test"}
                  </button>
                  <button onClick={() => openEdit(wh)}
                    className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-mute)] hover:text-[var(--color-violet)] hover:border-[var(--color-violet)]/30 transition-all">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(wh.id)} disabled={deleting === wh.id}
                    className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-mute)] hover:text-red-400 hover:border-red-400/30 transition-all disabled:opacity-50">
                    {deleting === wh.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
              <button onClick={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
                className="w-full border-t border-[var(--color-line)] px-4 py-2 text-[11px] text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors text-left flex items-center justify-between">
                <span>Events: {(JSON.parse(wh.events) as string[]).join(", ")}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform ${expandedId === wh.id ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <AnimatePresence>
                {expandedId === wh.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-[var(--color-line)]">
                    <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                      <div className="mb-2">
                        <p className="text-[10px] text-[var(--color-mute)] mb-1">Secret</p>
                        <code className="text-[11px] text-[var(--color-cyan)] bg-[var(--color-void)] rounded px-2 py-1 break-all">{wh.secret}</code>
                      </div>
                      {wh.deliveries.length === 0 ? (
                        <p className="text-[11px] text-[var(--color-mute)]">No deliveries yet.</p>
                      ) : (
                        wh.deliveries.map((d) => (
                          <div key={d.id} className="flex items-center gap-2 text-[11px]">
                            <span className={`h-1.5 w-1.5 rounded-full ${d.status === "success" ? "bg-green-400" : d.status === "failed" ? "bg-red-400" : "bg-yellow-400"}`} />
                            <span className="text-[var(--color-mute)]">{d.event}</span>
                            <span className="text-[var(--color-mute)]">{d.attempts} attempts</span>
                            <span className="text-[var(--color-mute)] ml-auto">{new Date(d.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
