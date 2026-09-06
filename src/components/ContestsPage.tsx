"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface EntryUser { username: string; avatar: string | null }
interface Entry { id: string; title: string; image: string | null; caption: string | null; upvotes: number; user: EntryUser }
interface Contest {
  id: string; title: string; type: string; description: string | null;
  rewardXp: number; weekStart: string; weekEnd: string;
  hasVoted: boolean; votedEntryId: string | null; hasSubmitted: boolean;
  entries: Entry[];
}

const TYPE_ICON: Record<string, string> = { MEME: "😂", COSPLAY: "🎭", FANART: "🎨", MOMENT: "💬", BLOG: "📝" };

export default function ContestsPage() {
  const { status } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteBusy, setVoteBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/contests")
      .then((r) => r.json())
      .then((d) => setContests(d.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function vote(contestId: string, entryId: string) {
    if (voteBusy) return;
    setVoteBusy(entryId);
    try {
      const res = await fetch("/api/contests/vote", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't vote."); setVoteBusy(null); return; }
      setContests((cs) => cs.map((c) => c.id === contestId
        ? { ...c, hasVoted: true, votedEntryId: entryId, entries: c.entries.map((e) => e.id === entryId ? { ...e, upvotes: data.upvotes } : e) }
        : c));
      setError("");
    } catch { setError("Couldn't vote."); }
    setVoteBusy(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(0,255,224,0.55)]" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ Weekly Contests</span>
      </div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Community Contests 🏆</h1>
      <p className="mt-2 text-[var(--color-mute)]">
        Vote for the best meme, cosplay and fan art every week. Winners earn a <span className="text-[var(--color-cyan)]">badge + 100 XP</span>!
      </p>

      {loading ? <p className="py-10 text-center text-sm text-[var(--color-mute)]">Loading contests…</p> : null}
      {error && <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      <AnimatePresence>
        {contests.map((c) => (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
              <span className="text-2xl">{TYPE_ICON[c.type] || "🏆"}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold">{c.title}</h2>
                <p className="text-xs text-[var(--color-mute)]">{c.description}</p>
              </div>
              <span className="rounded-full border border-[var(--color-line)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">+{c.rewardXp} XP</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 px-4 pb-2">
              {c.entries.length === 0 && (
                <p className="py-8 text-center text-sm text-[var(--color-mute)]">No entries yet. Be the first!</p>
              )}
              {c.entries.map((e) => (
                <div key={e.id} className="relative group rounded-xl overflow-hidden border border-[var(--color-line)] bg-black/20">
                  {e.image ? <Image src={e.image} alt={e.title} fill className="object-cover aspect-[4/5] group-hover:scale-105 transition-transform" sizes="(max-width:768px) 50vw, 25vw" /> : <div className="aspect-[4/5] flex items-center justify-center text-xs text-[var(--color-mute)]">No image</div>}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-6">
                    <p className="text-xs font-semibold truncate text-white">{e.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-[8px] text-[var(--color-mute)]">
                        {e.user?.avatar ? <Image src={e.user.avatar} alt="" fill className="object-cover" sizes="20px" /> : (e.user?.username || "?")[0].toUpperCase()}
                      </span>
                      <span className="text-[9px] text-[var(--color-mute)]">@{e.user?.username || "anon"}</span>
                      <button
                        onClick={() => void vote(c.id, e.id)}
                        disabled={voteBusy !== null || c.hasVoted}
                        className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors disabled:opacity-60 ${
                          c.votedEntryId === e.id ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]" : "bg-[var(--color-panel)] text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                        }`}
                      >
                        {c.votedEntryId === e.id ? "✓ Voted" : "👍"}
                      </button>
                    </div>
                    <p className="text-[9px] font-mono text-[var(--color-mute)]">{e.upvotes} votes</p>
                  </div>
                </div>
              ))}
            </div>

            {c.hasSubmitted ? (
              <p className="px-4 pt-1 text-center text-[10px] text-[var(--color-mute)]">You already entered this contest.</p>
            ) : (
              <Link href={`/contests/submit?contestId=${c.id}`} className="mt-1 block w-full rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors">
                + Submit to this contest
              </Link>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {status !== "authenticated" && (
        <p className="mt-8 text-center text-sm text-[var(--color-mute)]">
          <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Sign in</Link> to vote and submit entries.
        </p>
      )}
    </div>
  );
}