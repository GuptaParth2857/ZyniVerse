"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

interface PollOption {
  id: string;
  text: string;
}

let optionIdCounter = 0;
function newOption(): PollOption {
  return { id: `opt-${++optionIdCounter}`, text: "" };
}

export default function CreatePollPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>(() => [newOption(), newOption()]);
  const [submitting, setSubmitting] = useState(false);

  function addOption() {
    if (options.length < 10) setOptions([...options, newOption()]);
  }

  function removeOption(id: string) {
    if (options.length > 2) setOptions(options.filter((opt) => opt.id !== id));
  }

  if (!session) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Create Poll</h1>
          <p className="text-[var(--color-mute)] mb-6">Sign in to create polls.</p>
          <Link href="/login" className="rounded-full bg-[var(--color-magenta)] px-6 py-2 text-sm font-semibold text-black">
            Sign In
          </Link>
        </div>
      </PageTransition>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || options.map((o) => o.text).filter(Boolean).length < 2) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          options: options.map((o) => o.text).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.poll) router.push(`/polls/${data.poll.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Link href="/polls" className="inline-flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
          Back to Polls
        </Link>

        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mb-6">
          <h1 className="font-display text-2xl font-bold">Create Poll</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-cyan)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-cyan)] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Options ({options.length}/10)</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={opt.id} className="flex gap-2">
                  <input value={opt.text} onChange={(e) => {
                    const next = [...options];
                    next[i] = { ...opt, text: e.target.value };
                    setOptions(next);
                  }} placeholder={`Option ${i + 1}`} required={i < 2}
                    className="flex-1 rounded-lg neon-rgb-border bg-[var(--color-void)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-cyan)] transition-colors"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(opt.id)}
                      className="rounded-lg neon-rgb-border px-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button type="button" onClick={addOption}
                className="mt-2 text-xs text-[var(--color-cyan)] hover:underline"
              >+ Add option</button>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] neon-rgb-border py-3 text-sm font-bold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
