"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function SubmitContestPage() {
  const params = useSearchParams();
  const contestId = params.get("contestId") || "";

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function pick(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
    setBusy(false);
  }

  async function submit() {
    if (busy || !title.trim() || !imageUrl) { setError("Add a title and an image first."); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/contests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId, title: title.trim(), image: imageUrl, caption: caption.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't submit.");
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't submit."); }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-4 py-3">
          <span className="h-1.5 w-8 rounded-full bg-[var(--color-cyan)]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ Submit Entry</span>
        </div>

        <div className="px-4 py-6">
          {done ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-xl font-bold">Entry submitted!</h2>
              <p className="text-sm text-[var(--color-mute)] mt-2">Votes decide the winner. Share it to get more votes!</p>
              <Link href="/contests" className="inline-block rounded-full border border-[var(--color-line)] px-5 py-2 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors">← Back to Contests</Link>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-xs text-[var(--color-mute)] block">
                Your Name it
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. My Naruto meme"
                  className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]" />
              </label>

              <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-black/10 p-4 text-center">
                {imageUrl ? (
                  <div className="relative mx-auto aspect-[4/5] w-40 overflow-hidden rounded-xl">
                    <Image src={imageUrl} alt="preview" fill className="object-cover" sizes="160px" />
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-mute)]">Upload your image (max 5MB)</p>
                )}
                <label className="mt-2 inline-block cursor-pointer rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-1.5 text-xs font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors">
                  {imageUrl ? "Change image" : "Choose image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { void pick(e.target.files?.[0] ?? null); }} />
                </label>
              </div>


              <label className="text-xs text-[var(--color-mute)] block">
                Caption (optional)
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} rows={2}
                  placeholder="A short hook for voters…"
                  className="mt-1 w-full resize-none rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-cyan)]" />
              </label>

              {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => void submit()}
                disabled={busy}
                className="w-full rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 py-3 text-sm font-bold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 disabled:opacity-60 transition-colors"
              >{busy ? "Submitting…" : "🚀 Submit Entry"}</motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
