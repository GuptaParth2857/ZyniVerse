"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

const POSTER_TYPES = [
  { value: "POST", label: "💬 Thread" },
  { value: "CRITIQUE", label: "📝 Critique (rating)" },
  { value: "POSTER", label: "🎬 Anime Poster" },
  { value: "POSTER_COLLAB", label: "🤝 Collab Poster" },
  { value: "POSTER_NEWS", label: "📰 News Poster" },
];

export default function NewPostComposer() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("POST");
  const [image, setImage] = useState("");
  const [rating, setRating] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isCritique = type === "CRITIQUE";

  const submit = async () => {
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          image: image.trim() || undefined,
          rating: isCritique && rating ? Number(rating) : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create post");
      setTitle("");
      setContent("");
      setImage("");
      setRating("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      logError(e);
      setError(e instanceof Error ? e.message : "Post nahi bana, dobara try karo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <p className="rounded-2xl neon-rgb-border bg-[var(--color-panel)]/40 py-8 text-center text-sm text-[var(--color-muted)]">
        Log in to post threads, critiques or posters.
      </p>
    );
  }

  return (
    <section className="rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 p-5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-3 text-left text-sm text-[var(--color-mute)] transition hover:text-white"
        >
          ✍️ Write a new post — thread, critique or poster…
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[var(--color-ink)]">New Post</h3>
            <button onClick={() => setOpen(false)} className="text-sm text-[var(--color-mute)] hover:text-white" aria-label="Close composer">
              ✕
            </button>
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-fg)]"
            aria-label="Post type"
          >
            {POSTER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (keep it descriptive for search engines)"
            maxLength={300}
            className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-2.5 text-sm placeholder:text-[var(--color-mute)]/50"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your post… (extra detail = better SEO)"
            rows={4}
            maxLength={20000}
            className="w-full resize-y rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-2.5 text-sm placeholder:text-[var(--color-mute)]/50"
          />

          {isCritique && (
            <input
              value={rating}
              onChange={(e) => setRating(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Rating out of 10 (0-10)"
              maxLength={2}
              className="w-40 rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-2.5 text-sm placeholder:text-[var(--color-mute)]/50"
            />
          )}

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Optional poster image URL (https://…)"
            className="w-full rounded-xl neon-rgb-border bg-[var(--color-void)] px-4 py-2.5 text-sm placeholder:text-[var(--color-mute)]/50"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-full neon-rgb-border px-4 py-2 text-sm text-[var(--color-mute)] transition hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || !title.trim() || !content.trim()}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Publish"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}