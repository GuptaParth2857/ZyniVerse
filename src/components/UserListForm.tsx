"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserListForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"anime" | "manga" | "mixed">("anime");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, type, isPublic }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create list");
      }
      const data = await res.json();
      router.push(`/lists/edit/${data.list.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Top 10 Isekai, Best Anime of 2024..."
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this list about?"
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">List Type</label>
          <div className="flex gap-2">
            {(["anime", "manga", "mixed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? "bg-[var(--color-cyan)] text-black"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-[var(--color-line)]"
          />
          Make this list public
        </label>
        {error && <p className="text-sm text-[var(--color-magenta)]">{error}</p>}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="rounded-lg bg-[var(--color-cyan)] px-6 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create List"}
        </button>
      </div>
    </form>
  );
}
