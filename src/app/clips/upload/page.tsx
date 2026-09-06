"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ClipUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaTitle, setMediaTitle] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="h-10 w-48 bg-[var(--color-panel)] rounded shimmer mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-[var(--color-panel)] shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-4">Login Required</h1>
        <p className="text-sm text-[var(--color-mute)] mb-6">You need to be logged in to upload clips.</p>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-6 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all">
          Login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !imageUrl.trim()) {
      setError("Title and Image URL are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          imageUrl: imageUrl.trim(),
          videoUrl: videoUrl.trim() || null,
          mediaTitle: mediaTitle.trim() || null,
          timestamp: timestamp.trim() || null,
          tags: tags.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload clip.");
        setSaving(false);
        return;
      }
      router.push("/clips");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <Link href="/clips" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Back to Clips
          </Link>
          <h1 className="font-display text-3xl font-bold text-[var(--color-ink)]">Upload Scene Clip</h1>
          <p className="text-sm text-[var(--color-mute)] mt-2">Share an amazing anime scene or moment.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div>
            <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Epic fight scene from JJK"
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Image URL *</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/screenshot.jpg"
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the scene..." rows={3}
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Video URL (optional)</label>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Anime Title</label>
              <input value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} placeholder="Jujutsu Kaisen"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Timestamp (MM:SS)</label>
              <input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="12:34"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Tags (comma-separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fight, epic, opening"
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--color-mute)]/50 outline-none focus:border-[var(--color-magenta)] transition-colors" />
          </div>

          {imageUrl && (
            <div>
              <label className="text-xs font-semibold text-[var(--color-ink)] mb-1.5 block">Preview</label>
              <div className="rounded-xl border border-[var(--color-line)] overflow-hidden aspect-video bg-[var(--color-void)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(255,45,120,0.3)] hover:shadow-[0_0_40px_rgba(255,45,120,0.5)] transition-all disabled:opacity-50">
            {saving ? "Uploading..." : "Upload Clip"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
