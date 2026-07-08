"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CosplayUpload() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    character: "",
    animeTitle: "",
    imageUrl: "",
    description: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.character.trim() || !form.animeTitle.trim() || !form.imageUrl.trim()) {
      setError("Title, Character, Anime Title, and Image URL are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cosplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");
      setSuccess(true);
      setTimeout(() => router.push(`/cosplay/${data.cosplay.id}`), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-center mb-2">Upload Cosplay</h1>
      <p className="text-center text-sm text-[var(--color-mute)] mb-8">Share your cosplay with the community</p>

      {success ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <p className="text-green-400 font-semibold">Cosplay uploaded successfully! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="My cosplay title"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Character Name *</label>
              <input
                name="character"
                value={form.character}
                onChange={handleChange}
                placeholder="e.g. Naruto Uzumaki"
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Anime Title *</label>
              <input
                name="animeTitle"
                value={form.animeTitle}
                onChange={handleChange}
                placeholder="e.g. Naruto"
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Image URL *</label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/my-cosplay.jpg"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
            {form.imageUrl && (
              <div className="mt-2 relative aspect-video max-h-48 overflow-hidden rounded-lg border border-[var(--color-line)]">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain bg-[var(--color-void)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell us about your cosplay..."
              rows={3}
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="handmade, convention, 2024"
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm outline-none focus:border-[var(--color-cyan)]"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-magenta)]/20 border border-[var(--color-magenta)]/30 py-3 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-colors disabled:opacity-50"
          >
            {submitting ? "Uploading..." : "Upload Cosplay"}
          </button>
        </form>
      )}
    </div>
  );
}
