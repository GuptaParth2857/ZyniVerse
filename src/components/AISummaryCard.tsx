"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AISummaryCard({ animeId, animeTitle }: { animeId: number; animeTitle: string }) {
  const { data: session } = useSession();
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [level, setLevel] = useState<"none" | "mild" | "full">("none");

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/summarize-filler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: animeId, spoilerLevel: level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate a summary.");
    } finally {
      setBusy(false);
    }
  }

  const LEVELS: { id: "none" | "mild" | "full"; label: string; desc: string; accent: string }[] = [
    { id: "none", label: "Safe", desc: "No spoilers", accent: "#00ff7f" },
    { id: "mild", label: "Mild", desc: "Some setup", accent: "#ffd700" },
    { id: "full", label: "Full", desc: "Everything", accent: "#ff6b6b" },
  ];

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-3">
        <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(0,255,224,0.55)]" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ AI Filler Brief</span>
        <span className="ml-auto rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-mute)]">{level === "none" ? "Spoiler-free" : level === "mild" ? "Mild spoilers" : "Full spoilers"}</span>
      </div>

      <div className="px-4 py-4">
        {summary ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</div>
              <button
                onClick={() => { setSummary(null); void generate(); }}
                className="mt-3 rounded-full border border-[var(--color-line)] px-3 py-1 text-[10px] font-mono uppercase text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
              >↻ Regenerate</button>
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            {!session?.user?.id ? (
              <p className="text-sm text-[var(--color-mute)]">
                Sign in to get a spoiler-free AI summary of <span className="font-semibold text-[var(--color-cyan)]">{animeTitle}</span> — skip filler, save hours.
              </p>
            ) : (
              <p className="text-sm text-[var(--color-mute)]">
                Get a quick, spoiler-free brief on <span className="font-semibold text-[var(--color-cyan)]">{animeTitle}</span> — what&apos;s canon, what filler adds, and what to skip.
              </p>
            )}
            {error && <p className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            {/* Spoiler tier selector */}
            <div className="mt-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)] mb-1.5">Spoiler Level</p>
              <div className="flex gap-1.5">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-left transition-all ${level === l.id ? "border-current" : "border-[var(--color-line)] hover:border-[var(--color-line)]/60"}`}
                    style={level === l.id ? { borderColor: l.accent, background: `color-mix(in srgb, ${l.accent} 12%, transparent)` } : undefined}
                  >
                    <span className="block text-xs font-bold" style={{ color: l.accent }}>{l.label}</span>
                    <span className="block text-[9px] text-[var(--color-mute)]">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {session?.user?.id ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={generate}
                  disabled={busy}
                  className="rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-2.5 text-sm font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20 disabled:opacity-50"
                >
                  {busy ? "Summarizing…" : "✨ Generate Summary"}
                </motion.button>
              ) : (
                <Link href="/login" className="inline-block rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-2.5 text-sm font-bold text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20">Sign In</Link>
              )}
              <span className="text-[10px] text-[var(--color-mute)]">1 free AI request</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}