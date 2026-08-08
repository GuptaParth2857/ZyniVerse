"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

interface CommunityTag {
  id: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  score: number;
  myVote: number;
}

function TagPill({ tag, onVote, disabled }: { tag: CommunityTag; onVote: (vote: number) => void; disabled: boolean }) {
  const isUp = tag.myVote === 1;
  const isDown = tag.myVote === -1;
  const scoreColor = tag.score > 0 ? "var(--color-cyan)" : tag.score < 0 ? "var(--color-magenta)" : "var(--color-mute)";
  return (
    <div
      className={`flex items-center overflow-hidden rounded-full border transition-all ${
        isUp
          ? "border-[var(--color-cyan)]/60 bg-[var(--color-cyan)]/10 shadow-[0_0_16px_-6px_var(--color-cyan)]"
          : isDown
            ? "border-[var(--color-magenta)]/60 bg-[var(--color-magenta)]/10 shadow-[0_0_16px_-6px_var(--color-magenta)]"
            : "border-[var(--color-line)] bg-[var(--color-panel)] hover:border-[var(--color-cyan)]/40"
      }`}
    >
      <button
        onClick={() => onVote(isUp ? 0 : 1)}
        disabled={disabled}
        title="Upvote"
        className={`flex items-center gap-1 pl-3 pr-1.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isUp ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
        }`}
      >
        ▲ <span className="font-mono">{tag.upvotes}</span>
      </button>
      <span className="px-2 text-xs font-semibold text-[var(--color-ink)]">#{tag.tag}</span>
      <button
        onClick={() => onVote(isDown ? 0 : -1)}
        disabled={disabled}
        title="Downvote"
        className={`flex items-center gap-1 pr-3 pl-1.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isDown ? "text-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
        }`}
      >
        ▼ <span className="font-mono">{tag.downvotes}</span>
      </button>
      <span
        className="border-l border-[var(--color-line)] px-2.5 py-1.5 font-mono text-[10px] font-bold"
        style={{ color: scoreColor }}
      >
        {tag.score > 0 ? `+${tag.score}` : tag.score}
      </span>
    </div>
  );
}

export default function CommunityTagPanel({ mediaId }: { mediaId: number }) {
  const { data: session } = useSession();
  const [tags, setTags] = useState<CommunityTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch(`/api/community-tags/${mediaId}`);
      const data = await res.json();
      setTags(data.tags || []);
      setError(null);
    } catch (e) {
      logError(e);
      setError("Couldn't load tags. Try again.");
    } finally {
      setLoading(false);
    }
  }, [mediaId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/community-tags/${mediaId}`);
        const data = await res.json();
        if (cancelled) return;
        setTags(data.tags || []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        logError(e);
        setError("Couldn't load tags. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  const handleVote = async (communityTagId: string, vote: number) => {
    if (!session?.user?.id || submitting) return;
    try {
      const res = await fetch("/api/community-tags/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityTagId, vote }),
      });
      if (!res.ok) throw new Error("Vote failed");
      await fetchTags();
    } catch (e) {
      logError(e);
      setError("Couldn't register your vote. Try again.");
    }
  };

  const handleCreate = async () => {
    const tag = newTag.trim();
    if (!tag || submitting || !session?.user?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/community-tags/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, tag, vote: 1 }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Couldn't add tag");
      }
      setNewTag("");
      await fetchTags();
    } catch (e) {
      logError(e);
      setError("Couldn't add that tag. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-[var(--color-panel)]" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {!session?.user?.id ? (
        <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-xs text-[var(--color-mute)]">
          <span>Sign in to vote on tags and add your own →</span>
          <Link href="/login" className="font-semibold text-[var(--color-cyan)] hover:underline">Log in</Link>
          <span>/</span>
          <Link href="/register" className="font-semibold text-[var(--color-magenta)] hover:underline">Register</Link>
        </div>
      ) : null}

      {error && (
        <p className="mb-3 rounded-lg border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 px-3 py-2 text-xs text-[var(--color-magenta)]">
          {error}
        </p>
      )}

      {tags.length === 0 ? (
        <p className="mb-3 rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-xs text-[var(--color-mute)]">
          No community tags yet — be the first to add one!
        </p>
      ) : (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <TagPill key={t.id} tag={t} onVote={(vote) => handleVote(t.id, vote)} disabled={!session?.user?.id || submitting} />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Add a tag (e.g. masterpiece)…"
          disabled={!session?.user?.id}
          className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-xs text-white placeholder:text-[var(--color-mute)] transition-colors focus:border-[var(--color-cyan)]/60 focus:outline-none focus:shadow-[0_0_14px_rgba(41,242,224,0.12)] disabled:opacity-50"
        />
        <button
          onClick={handleCreate}
          disabled={!newTag.trim() || submitting || !session?.user?.id}
          className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[#29f2e0]/80 px-4 py-2 text-xs font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(41,242,224,0.35)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:shadow-none"
        >
          {submitting ? "…" : "+ Add"}
        </button>
      </div>
    </div>
  );
}
