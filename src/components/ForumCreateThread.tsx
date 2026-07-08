"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ForumCreateThreadProps {
  initialAnimeId?: number;
  initialAnimeTitle?: string;
  initialAnimeImage?: string;
}

export default function ForumCreateThread({ initialAnimeId, initialAnimeTitle, initialAnimeImage }: ForumCreateThreadProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/forum/categories").then(r => r.json()).then(d => setCategories(d.categories)).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryId || undefined,
          animeId: initialAnimeId,
          animeTitle: initialAnimeTitle,
          animeImage: initialAnimeImage,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create thread");
      }

      const data = await res.json();
      router.push(`/forum/thread/${data.thread.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Category <span className="text-[var(--color-mute)]">(optional)</span></label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold">Content <span className="text-[var(--color-mute)]">(markdown)</span></label>
          <button type="button" onClick={() => setShowPreview((o) => !o)}
            className="text-[11px] text-[var(--color-cyan)] hover:underline"
          >{showPreview ? "Edit" : "Preview"}</button>
        </div>
        {showPreview ? (
          <div className="min-h-[200px] rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-ink)] whitespace-pre-wrap">
            {content || "Nothing to preview"}
          </div>
        ) : (
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post... (Markdown supported)"
            rows={8}
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)] resize-y"
            required
          />
        )}
      </div>

      {initialAnimeTitle && (
        <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm text-[var(--color-mute)]">
          Discussing: <span className="font-semibold text-[var(--color-ink)]">{initialAnimeTitle}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting || !title.trim() || !content.trim()}
          className="rounded-xl bg-[var(--color-magenta)] px-6 py-3 text-sm font-bold text-black disabled:opacity-50 hover:opacity-90 transition"
        >{submitting ? "Posting..." : "Create Thread"}</button>
        <button type="button" onClick={() => router.back()}
          className="rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-bold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
        >Cancel</button>
      </div>
    </form>
  );
}
