"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import Loader from "@/components/Loader";

export default function PollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/polls/${id}`)
      .then((r) => r.json())
      .then((data) => setPoll(data.poll))
      .catch(() => setPoll(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVote(optionId: string) {
    if (poll?.userVote || !session) return;
    await fetch(`/api/polls/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    const data = await fetch(`/api/polls/${id}`).then((r) => r.json());
    setPoll(data.poll);
  }

  if (loading) return <Loader />;
  if (!poll) return (
    <PageTransition>
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-[var(--color-mute)]">Poll not found.</p>
        <Link href="/polls" className="text-[var(--color-cyan)] text-sm mt-2 inline-block hover:underline">Back to polls</Link>
      </div>
    </PageTransition>
  );

  const totalVotes = poll.options.reduce((s: number, o: any) => s + (o._count?.votes || 0), 0);
  const isOwner = session?.user?.id === poll.createdById;

  return (
    <PageTransition>
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Link href="/polls" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
          Back to Polls
        </Link>

        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="font-display text-2xl font-bold">{poll.title}</h1>
          {!poll.isActive && (
            <span className="shrink-0 rounded bg-red-500/10 px-3 py-1 text-xs font-mono text-red-400">Closed</span>
          )}
        </div>

        {poll.description && <p className="text-sm text-[var(--color-mute)] mb-6">{poll.description}</p>}

        <div className="space-y-2">
          {poll.options.map((opt: any) => {
            const count = opt._count?.votes || 0;
            const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isSelected = poll.userVote === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={!!poll.userVote || !session}
                className="relative w-full rounded-xl border border-[var(--color-line)] px-4 py-3 text-left transition-all disabled:cursor-default hover:border-[var(--color-cyan)]/30"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-xl"
                  style={{ background: isSelected ? "rgba(0,255,224,0.12)" : "rgba(255,255,255,0.03)" }}
                />
                <span className="relative z-10 flex items-center justify-between">
                  <span className={isSelected ? "text-[var(--color-cyan)] font-semibold" : "text-sm text-[var(--color-ink)]"}>
                    {opt.label}
                  </span>
                  <span className="font-mono text-xs text-[var(--color-mute)]">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-mute)]">
          <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-3">
            {poll.createdBy && <span>by {poll.createdBy.username}</span>}
            {isOwner && (
              <button onClick={async () => {
                await fetch(`/api/polls/${poll.id}`, { method: "DELETE" });
                router.push("/polls");
              }} className="text-red-400 hover:underline">Delete</button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
