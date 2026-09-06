"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

type PrefKey =
  | "aiEnabled"
  | "followEnabled"
  | "commentEnabled"
  | "reviewEnabled"
  | "eventEnabled"
  | "systemEnabled"
  | "airingEnabled";

const FIELDS: { key: PrefKey; label: string; desc: string }[] = [
  { key: "followEnabled", label: "Follows", desc: "When someone follows you" },
  { key: "commentEnabled", label: "Comments", desc: "Replies & comments on your activity" },
  { key: "reviewEnabled", label: "Reviews", desc: "Reviews & long reviews" },
  { key: "eventEnabled", label: "Events", desc: "Conventions, events & club RSVPs" },
  { key: "airingEnabled", label: "Airing alerts", desc: "When tracked anime episodes air" },
  { key: "systemEnabled", label: "System", desc: "Account & platform updates" },
];

export default function NotificationPreferences() {
  const { status } = useSession();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/notifications/preferences");
        const json = await res.json();
        if (!cancelled && json.prefs) setPrefs(json.prefs);
      } catch {
        /* ignore */
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const toggle = useCallback(
    (key: PrefKey, value: boolean) => {
      setPrefs((prev) => (prev ? { ...prev, [key]: value } : prev));
      setSaving(true);
      fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      })
        .then(() => {})
        .catch(() => {})
        .finally(() => setSaving(false));
    },
    []
  );

  if (status === "loading" || !prefs) return null;

  return (
    <div className="mb-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-[var(--color-ink)]">
          Notification preferences
        </h2>
        {saving && (
          <span className="text-[11px] text-[var(--color-mute)]">Saving…</span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const on = !!prefs[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key, !on)}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/40 px-4 py-3 text-left transition-colors hover:border-[var(--color-cyan)]/40"
            >
              <span>
                <span className="block text-sm font-semibold text-[var(--color-ink)]">
                  {f.label}
                </span>
                <span className="block text-[11px] text-[var(--color-mute)]">{f.desc}</span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  on ? "bg-[var(--color-cyan)]" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    on ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}