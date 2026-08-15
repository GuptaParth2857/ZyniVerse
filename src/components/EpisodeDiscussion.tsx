"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

interface CommentUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface EpisodeComment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function EpisodeDiscussion({ mediaId }: { mediaId: number }) {
  const { data: session } = useSession();
  const [episode, setEpisode] = useState(1);
  const [comments, setComments] = useState<EpisodeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (ep: number) => {
    try {
      const res = await fetch(`/api/anime/${mediaId}/episode-discussions?episode=${ep}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setComments(data.comments || []);
      setError(null);
    } catch (e) {
      logError(e);
      setError("Could not load discussions.");
    }
  }, [mediaId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      await load(episode);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [episode, load]);

  async function submit() {
    if (!draft.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/anime/${mediaId}/episode-discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode, content: draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post");
      }
      setDraft("");
      load(episode);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to post";
      setError(msg);
      logError(e);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-display text-sm font-bold flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
          Episode Discussion
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEpisode((e) => Math.max(1, e - 1))}
            disabled={episode <= 1}
            className="rounded-lg border border-[var(--color-line)] px-2.5 py-1.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] disabled:opacity-40 transition-colors"
          >
            ←
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] px-2 py-1">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Ep</span>
            <input
              type="number"
              min={1}
              value={episode}
              onChange={(e) => setEpisode(Math.max(1, Number(e.target.value) || 1))}
              className="w-12 bg-transparent text-center font-mono text-sm font-bold text-white outline-none"
            />
          </div>
          <button
            onClick={() => setEpisode((e) => e + 1)}
            className="rounded-lg border border-[var(--color-line)] px-2.5 py-1.5 text-xs text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {session?.user ? (
        <div className="mb-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Share your thoughts on episode ${episode}...`}
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-magenta)]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[var(--color-mute)]">{draft.length}/2000</span>
            <button
              onClick={submit}
              disabled={posting || !draft.trim()}
              className="rounded-full bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-xs text-[var(--color-mute)]">
          <Link href="/login" className="text-[var(--color-magenta)] hover:underline">Sign in</Link> to join the
          discussion.
        </div>
      )}

      {error && <div className="mb-3 text-xs text-red-400">{error}</div>}

      {loading ? (
        <div className="py-6 text-center text-xs text-[var(--color-mute)]">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-xs text-[var(--color-mute)]">
          No one has discussed episode {episode} yet. Be the first!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-[var(--color-void)] p-3">
              <div className="flex items-center gap-2">
                {c.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.user.avatar} alt={c.user.username} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-magenta)] text-[10px] font-bold text-black">
                    {c.user.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <Link href={`/profile?u=${c.user.username}`} className="text-xs font-semibold text-white hover:text-[var(--color-magenta)] transition-colors">
                  {c.user.username}
                </Link>
                <span className="text-[10px] text-[var(--color-mute)]">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-[var(--color-mute)]">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
