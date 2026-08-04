"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface PollOption {
  id: string;
  label: string;
  _count: { votes: number };
}

interface Poll {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  endsAt: string | null;
  createdAt: string;
  createdBy: { id: string; username: string; avatar?: string | null };
  options: PollOption[];
}

export default function ClubPolls({
  polls,
  isMember,
  onCreate,
  onVote,
}: {
  polls: Poll[];
  isMember: boolean;
  onCreate: (data: { title: string; description?: string; options: string[]; endsAt?: string }) => void;
  onVote: (pollId: string, optionId: string) => void;
}) {
  const { data: session } = useSession();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = options.filter((o) => o.trim());
    if (!title.trim() || clean.length < 2) return;
    onCreate({ title: title.trim(), description: description.trim() || undefined, options: clean });
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setShowCreate(false);
  };

  const handleVote = (pollId: string, optionId: string) => {
    onVote(pollId, optionId);
    setVoted((v) => ({ ...v, [pollId]: true }));
  };

  return (
    <div>
      {isMember && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="mb-6 w-full rounded-2xl border border-dashed border-[var(--color-line)] py-4 text-sm text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
        >
          + Create Poll
        </button>
      )}

      {showCreate && (
        <form onSubmit={submit} className="neon-rgb-border mb-6 space-y-3 rounded-2xl bg-[var(--color-panel)] p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Poll question..." className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)..." className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10" />
          <div className="space-y-2">
            {options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => setOptions((o) => o.map((v, j) => (j === i ? e.target.value : v)))}
                placeholder={`Option ${i + 1}`}
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none transition-colors focus:border-white/25 focus:ring-2 focus:ring-white/10"
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            {options.length < 6 && (
              <button type="button" onClick={() => setOptions((o) => [...o, ""])} className="rounded-xl border border-[var(--color-line)] px-4 py-1.5 text-xs text-[var(--color-mute)]">+ Add option</button>
            )}
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-[var(--color-line)] px-4 py-1.5 text-xs text-[var(--color-mute)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--color-magenta)] px-5 py-1.5 text-xs font-bold text-black">Create</button>
          </div>
        </form>
      )}

      {!isMember && (
        <p className="mb-6 rounded-xl border border-dashed border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-mute)]">
          Join the club to create and vote in polls.
        </p>
      )}

      {polls.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-mute)]">No polls yet.</p>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => {
            const total = poll.options.reduce((s, o) => s + o._count.votes, 0);
            const closed = !poll.isActive || (poll.endsAt && new Date(poll.endsAt) < new Date());
            const showResults = voted[poll.id] || closed;
            return (
              <div key={poll.id} className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">{poll.title}</h3>
                  {closed && <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--color-mute)]">Closed</span>}
                </div>
                {poll.description && <p className="mb-2 text-xs text-[var(--color-mute)]">{poll.description}</p>}
                {poll.endsAt && !closed && (
                  <p className="mb-3 text-[10px] text-[var(--color-mute)]">
                    Ends {new Date(poll.endsAt).toLocaleString()}
                  </p>
                )}
                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const pct = total > 0 ? Math.round((opt._count.votes / total) * 100) : 0;
                    return showResults || !isMember ? (
                      <div key={opt.id} className="relative overflow-hidden rounded-lg bg-white/[0.03] p-2">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-magenta)]/30 to-[var(--color-violet)]/30" style={{ width: `${pct}%` }} />
                        <div className="relative flex items-center justify-between text-xs">
                          <span className="text-[var(--color-ink)]">{opt.label}</span>
                          <span className="text-[var(--color-mute)]">{pct}% · {opt._count.votes}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(poll.id, opt.id)}
                        className="w-full rounded-lg border border-[var(--color-line)] p-2 text-left text-xs text-[var(--color-ink)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-[var(--color-mute)]">
                  {total} vote{total === 1 ? "" : "s"} · by {poll.createdBy.username}
                </p>
                {!session?.user && !closed && (
                  <p className="mt-2 text-[10px] text-[var(--color-mute)]">Login to vote.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
