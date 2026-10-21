"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PollCard from "@/components/PollCard";
import Loader from "@/components/Loader";
import { applyUserVotes, fetchViewerState } from "@/lib/client/viewer-state";
import type { PollData } from "@/lib/polls";

export default function PollsPage() {
  const { data: session, status } = useSession();
  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    fetch("/api/polls?perPage=50")
      .then((r) => r.json())
      .then(async (data) => {
        const list: PollData[] = data.polls || [];
        if (status === "authenticated") {
          // The visitor's own vote is fetched separately, so the poll list
          // itself stays identical for everyone and can come from the CDN.
          const states = await fetchViewerState("pollVotes", list.map((p) => p.id));
          applyUserVotes(list, states);
        }
        return list;
      })
      .then((list) => setPolls(list))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function handleVote(pollId: string, optionId: string) {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPolls((prev) => prev.map((p) => (p.id === pollId ? data.poll : p)));
    }
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Polls">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
                <h1 className="font-display text-3xl font-bold">Polls</h1>
              </div>
              <p className="text-sm text-[var(--color-mute)] mt-1">Vote on community polls</p>
            </div>
            {session && (
              <Link
                href="/polls/create"
                className="rounded-full bg-[var(--color-cyan)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
              >
                Create Poll
              </Link>
            )}
          </div>

          {loading ? (
            <Loader />
          ) : polls.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[var(--color-mute)] text-sm">No polls yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll, i) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVote={(optionId) => handleVote(poll.id, optionId)}
                  userId={session?.user?.id}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
