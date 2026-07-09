"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PollCard from "@/components/PollCard";
import Loader from "@/components/Loader";

export default function PollsPage() {
  const { data: session } = useSession();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/polls?perPage=50")
      .then((r) => r.json())
      .then((data) => setPolls(data.polls || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(pollId: string, optionId: string) {
    await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
  }

  return (
    <PageTransition>
      <ErrorBoundary label="Polls">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Polls</h1>
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
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  onVote={(optionId) => handleVote(poll.id, optionId)}
                  userId={session?.user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
