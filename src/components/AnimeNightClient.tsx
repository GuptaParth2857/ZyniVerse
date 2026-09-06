"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FriendInput { name: string; tastes: string }
interface AnimePick { title: string; reason: string; mpv_episode?: string; id?: number; image?: string | null; year?: number | null }
interface NightPlan { theme: string; lineup: AnimePick[]; order_note: string; snacks: string[]; quiz: { question: string; answer: string }[]; why: string }

const MOODS = ["Chill", "Hype", "Cozy", "Sad & Deep", "Comedy", "Action Rush", "Nostalgia"];
const DURATIONS = ["1-2 hours", "3-4 hours", "5-6 hours", "Marathon"];

export default function AnimeNightClient() {
  const [friends, setFriends] = useState<FriendInput[]>([{ name: "", tastes: "" }, { name: "", tastes: "" }]);
  const [mood, setMood] = useState("Chill");
  const [duration, setDuration] = useState("3-4 hours");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<NightPlan | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [creatingParty, setCreatingParty] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);

  function updateFriend(i: number, key: keyof FriendInput, value: string) {
    setFriends((fs) => fs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));
  }

  function addFriend() {
    if (friends.length >= 8) return;
    setFriends((fs) => [...fs, { name: "", tastes: "" }]);
  }

  function removeFriend(i: number) {
    setFriends((fs) => fs.filter((_, idx) => idx !== i));
  }

  async function generate() {
    const valid = friends.filter((f) => f.name.trim() || f.tastes.trim());
    if (valid.length === 0) { setError("Add at least one friend and their taste."); return; }
    setLoading(true); setError(""); setPlan(null); setPartyId(null);
    try {
      const res = await fetch("/api/ai/night-gen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friends: valid, mood, duration }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't plan the night."); setLoading(false); return; }
      setPlan(data.plan);
    } catch { setError("Network error. Try again."); setLoading(false); return; }
    setLoading(false);
  }

  async function createPartyNow() {
    if (!plan?.lineup?.[0]?.id || creatingParty) return;
    setCreatingParty(true); setError("");
    try {
      const res = await fetch("/api/ai/night-gen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friends: friends.filter((f) => f.name.trim() || f.tastes.trim()), mood, duration, createParty: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't create party."); setCreatingParty(false); return; }
      if (data.party?.id) { setPartyId(data.party.id); return; }
      setCreatingParty(false);
    } catch { setError("Couldn't create party."); setCreatingParty(false); }
    setCreatingParty(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(0,255,224,0.55)]" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ AI Anime Night</span>
      </div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Anime Night Generator 🌙</h1>
      <p className="mt-2 max-w-2xl text-[var(--color-mute)]">
        Apne group ke tastes daalo — Zyni AI sabki blend karke poori night plan karegi: lineup, episode order, snacks aur quiz tak.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">1 · Add your crew</h2>
            <button onClick={addFriend} disabled={friends.length >= 8}
              className="rounded-full border border-[var(--color-cyan)]/40 px-3 py-1 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 disabled:opacity-50 transition-colors">+ Add friend</button>
          </div>

          <div className="mt-4 space-y-3">
            {friends.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={f.name} onChange={(e) => updateFriend(i, "name", e.target.value)}
                  placeholder={`Friend ${i + 1} name`} maxLength={20}
                  className="w-28 shrink-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-xs outline-none focus:border-[var(--color-cyan)]" />
                <input
                  value={f.tastes} onChange={(e) => updateFriend(i, "tastes", e.target.value)}
                  placeholder="e.g. action, Jujutsu Kaisen, 12 eps" maxLength={80}
                  className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-xs outline-none focus:border-[var(--color-cyan)]" />
                {friends.length > 1 && (
                  <button onClick={() => removeFriend(i)} className="text-[var(--color-mute)] hover:text-red-400 transition-colors">✕</button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold text-[var(--color-mute)]">2 · Night mood</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m} onClick={() => setMood(m)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${mood === m ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border border-[var(--color-cyan)]/40" : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-cyan)]"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold text-[var(--color-mute)]">3 · Duration</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${duration === d ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border border-[var(--color-cyan)]/40" : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-cyan)]"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => void generate()} disabled={loading}
            className="mt-5 w-full rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 py-3 text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 disabled:opacity-60 transition-colors">
            {loading ? "Planning…" : "✨ Generate Anime Night"}
          </motion.button>
        </motion.div>

        {/* Results */}
        <div>
          {!plan && !loading && (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] p-8 text-center">
              <p className="text-sm text-[var(--color-mute)]">Yahan tumhara AI-planned night dikhega. Left side se plan banaye.</p>
            </div>
          )}
          {loading && (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-line)] p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-cyan)] border-t-transparent" />
              <p className="text-sm text-[var(--color-mute)]">Sabki tastes mix kar rahe hain…</p>
            </div>
          )}

          <AnimatePresence>
            {plan && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-cyan)]">Tonight&apos;s theme</div>
                  <h3 className="mt-1 text-2xl font-bold">{plan.theme}</h3>
                  <p className="mt-1 text-sm text-[var(--color-mute)]">{plan.why}</p>
                </div>

                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                  <h4 className="mb-3 text-sm font-bold text-[var(--color-mute)]">Lineup</h4>
                  <div className="space-y-3">
                    {plan.lineup.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-cyan)]/15 text-[11px] font-bold text-[var(--color-cyan)]">{i + 1}</div>
                        {p.image ? (
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg">
                            <Image src={p.image} alt="" fill className="object-cover" sizes="36px" />
                          </div>
                        ) : <div className="h-12 w-9 shrink-0 rounded-lg bg-[var(--color-void)]" />}
                        <div className="min-w-0 flex-1">
                          {p.id ? (
                            <Link href={`/anime/${p.id}`} className="text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-cyan)]">{p.title}</Link>
                          ) : (
                            <p className="text-sm font-semibold">{p.title}</p>
                          )}
                          <p className="text-[11px] text-[var(--color-mute)]">
                            {p.mpv_episode ? <>Start: <span className="text-[var(--color-cyan)]">{p.mpv_episode}</span> · </> : null}
                            {p.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-xs text-[var(--color-mute)]">{plan.order_note}</p>
                </div>

                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                  <h4 className="mb-2 text-sm font-bold text-[var(--color-mute)]">🍿 Snack ideas</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.snacks.map((s, i) => (
                      <span key={i} className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-mute)]">{s}</span>
                    ))}
                  </div>
                  {plan.quiz.length > 0 && (
                    <>
                      <button onClick={() => setShowQuiz((v) => !v)} className="mt-3 text-xs font-bold text-[var(--color-cyan)] hover:underline">📝 {showQuiz ? "Hide" : "Show"} quiz questions</button>
                      {showQuiz && (
                        <div className="mt-3 space-y-2">
                          {plan.quiz.map((q, i) => (
                            <details key={i} className="rounded-lg border border-[var(--color-line)] bg-black/10 px-3 py-2">
                              <summary className="cursor-pointer text-xs font-semibold text-[var(--color-ink)]">{q.question}</summary>
                              <p className="mt-1 text-xs text-[var(--color-cyan)]">Answer: {q.answer}</p>
                            </details>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {partyId ? (
                  <Link href={`/watch-party/${partyId}`} className="block w-full rounded-xl border border-[var(--color-cyan)]/50 bg-[var(--color-cyan)]/15 py-3 text-center text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/25 transition-colors">
                    🎬 Party created! Open the room →
                  </Link>
                ) : (
                  <button onClick={() => void createPartyNow()} disabled={creatingParty || !plan.lineup?.[0]?.id}
                    className="w-full rounded-xl border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 py-3 text-sm font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/20 disabled:opacity-50 transition-colors">
                    {creatingParty ? "Creating…" : "🎬 Start this night as a Watch Party"}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}