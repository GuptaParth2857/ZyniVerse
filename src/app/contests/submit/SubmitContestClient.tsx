"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import ContestCountdown from "@/components/ContestCountdown";
import ContestConfetti from "@/components/ContestConfetti";
import { contestTypeMeta, type ContestDTO } from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } as const;

export default function SubmitContestClient({ initialContestId }: { initialContestId: string | null }) {
  const { status } = useSession();
  const [contests, setContests] = useState<ContestDTO[]>([]);
  const [contestId, setContestId] = useState<string>(initialContestId ?? "");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetch("/api/contests")
      .then((r) => r.json())
      .then((d) => {
        const list: ContestDTO[] = d.contests || [];
        setContests(list);
        setContestId((current) => current || (list[0]?.id ?? ""));
      })
      .catch(() => {});
  }, []);

  const contest = contests.find((c) => c.id === contestId) ?? null;
  const meta = contestTypeMeta(contest?.type);
  const alreadyEntered = Boolean(contest?.hasSubmitted);

  const pick = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
        setError("Only JPG, PNG, WEBP or GIF images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be under 5MB.");
        return;
      }
      setUploading(true);
      setError("");
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setImageUrl(data.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  // Paste an image straight from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        void pick(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pick]);

  const step = !contest ? 1 : !imageUrl ? 2 : title.trim() ? 3 : 2;

  async function submit() {
    if (busy || !contest) return;
    if (!title.trim()) {
      setError("Add a title first.");
      return;
    }
    if (!imageUrl) {
      setError("Upload an image first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestId, title: title.trim(), image: imageUrl, caption: caption.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't submit.");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="console-label mb-2">🚀 Join the battle</p>
        <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-4xl">
          Submit an Entry
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          One entry per battle. Wins land you a badge, {contest?.rewardXp ?? 100} XP, 50 coins and a Hall of Fame slot.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {[
          { n: 1, label: "Pick a battle" },
          { n: 2, label: "Add your image" },
          { n: 3, label: "Details & submit" },
        ].map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition-all ${
                step >= s.n
                  ? "border-[var(--color-cyan)] bg-[var(--color-cyan)] text-black shadow-[0_0_14px_rgba(0,255,224,0.5)]"
                  : "border-white/15 bg-black/40 text-[var(--color-mute)]"
              }`}
            >
              {step > s.n ? "✓" : s.n}
            </span>
            <span className={`hidden text-[11px] font-bold sm:block ${step >= s.n ? "text-white" : "text-[var(--color-mute)]"}`}>
              {s.label}
            </span>
            {i < 2 && <span className={`h-px flex-1 ${step > s.n ? "bg-[var(--color-cyan)]/60" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {status !== "authenticated" ? (
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-14 text-center">
          <p className="text-4xl">🔑</p>
          <p className="mt-3 font-display text-lg">Sign in to enter</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            Entries are tied to your account — that is how the badge and XP get to you.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-6 py-2.5 text-[11px] font-black uppercase tracking-wider text-black"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className="relative overflow-hidden rounded-3xl border border-[var(--color-cyan)]/40 bg-[var(--color-panel)]/70 px-6 py-12 text-center backdrop-blur-sm"
            >
              <ContestConfetti color={meta.color} />
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, delay: 0.1 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <h2 className="neon-text-gradient mt-4 font-display text-2xl font-black">Entry submitted!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-mute)]">
                Your entry is live in <span className="text-white">&ldquo;{contest?.title ?? "the battle"}&rdquo;</span>. Votes decide the
                winner — share the battle to pull in more votes.
              </p>

              <div className="mx-auto mt-6 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                {imageUrl && <Image src={imageUrl} alt={title} width={400} height={500} className="mx-auto aspect-[4/5] w-full object-cover" />}
                <div className="px-4 py-3 text-left">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  {caption && <p className="mt-1 text-[11px] text-[var(--color-mute)]">{caption}</p>}
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: meta.color }}>
                    {meta.icon} {meta.label} · submitted
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {contest && (
                  <Link
                    href={`/contests/${contest.id}`}
                    className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black"
                  >
                    👀 View the battle
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just entered a weekly ZyniVerse contest — vote for me! 🏆")}&url=${encodeURIComponent(contest ? `https://zyverse.in/contests/${contest.id}` : "https://zyverse.in/contests")}`, "_blank", "width=600,height=400")}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-bold text-white/80 hover:text-white"
                >
                  𝕏 Ask for votes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDone(false);
                    setTitle("");
                    setCaption("");
                    setImageUrl("");
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-bold text-white/80 hover:text-[var(--color-cyan)]"
                >
                  ↺ Enter another battle
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* 1. Contest picker */}
              <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-5 backdrop-blur-sm">
                <p className="console-label mb-3 text-[10px]">1 · Choose your battle</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {contests.map((c) => {
                    const m = contestTypeMeta(c.type);
                    const active = c.id === contestId;
                    const taken = Boolean(c.hasSubmitted);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setContestId(c.id)}
                        className={`relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all ${
                          active
                            ? "border-[var(--color-cyan)]/60 bg-[var(--color-cyan)]/[0.08] shadow-[0_0_18px_rgba(0,255,224,0.15)]"
                            : "border-white/[0.07] bg-black/25 hover:border-white/20"
                        }`}
                      >
                        {active && (
                          <motion.span layoutId="submit-battle" className="pointer-events-none absolute inset-0 -z-10 bg-[var(--color-cyan)]/10" transition={spring} />
                        )}
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg"
                            style={{ borderColor: `${m.color}44`, background: `${m.color}12` }}
                          >
                            {m.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-white">{c.title}</p>
                            <p className="mt-0.5 font-mono text-[10px]" style={{ color: m.color }}>
                              +{c.rewardXp} XP · 50 🪙 · {c.entries.length} entries
                            </p>
                          </div>
                          {taken && (
                            <span className="shrink-0 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white/60">
                              Entered ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!alreadyEntered && contest && (
                  <div className="mt-3">
                    <ContestCountdown target={contest.weekEnd} color={meta.color} compact />
                  </div>
                )}
              </section>

              {/* 2. Image upload */}
              <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-5 backdrop-blur-sm">
                <p className="console-label mb-3 text-[10px]">2 · Your image</p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    void pick(e.dataTransfer.files?.[0]);
                  }}
                  className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                    dragOver ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10" : "border-white/[0.12] bg-black/15"
                  }`}
                >
                  <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
                  {imageUrl ? (
                    <div className="mx-auto w-full max-w-xs">
                      <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10">
                        <div className="absolute inset-0 shimmer" />
                        <Image src={imageUrl} alt="Entry preview" fill className="object-cover" sizes="(max-width:768px) 80vw, 320px" />
                      </div>
                      <p className="mt-3 text-[11px] text-[var(--color-mute)]">
                        Looking good. <button type="button" onClick={() => fileInput.current?.click()} className="font-bold text-[var(--color-cyan)] hover:underline">Replace</button> or{" "}
                        <button type="button" onClick={() => setImageUrl("")} className="font-bold text-[var(--color-mute)] hover:underline">remove</button>.
                      </p>
                    </div>
                  ) : (
                    <>
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl"
                      >
                        {uploading ? "⏳" : "🖼️"}
                      </motion.div>
                      <p className="mt-3 text-sm text-white/85">
                        {uploading ? "Uploading…" : "Drop your image here"}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--color-mute)]">or click to browse · paste from clipboard · JPG/PNG/WEBP/GIF up to 5MB</p>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        disabled={uploading}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-[var(--color-cyan)] transition-colors hover:bg-[var(--color-cyan)]/20 disabled:opacity-60"
                      >
                        {uploading ? "Uploading…" : "Choose image"}
                      </button>
                    </>
                  )}
                </div>
              </section>

              {/* 3. Details */}
              <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-5 backdrop-blur-sm">
                <p className="console-label mb-3 text-[10px]">3 · Title & caption</p>
                <div className="space-y-4">
                  <label className="block text-xs text-[var(--color-mute)]">
                    Title
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={120}
                      placeholder="e.g. My Naruto meme"
                      className="mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                    />
                    <span className="mt-1 block text-right font-mono text-[10px] text-[var(--color-mute)]">{title.length}/120</span>
                  </label>

                  <label className="block text-xs text-[var(--color-mute)]">
                    Caption <span className="opacity-60">(optional)</span>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      maxLength={300}
                      rows={3}
                      placeholder="A short hook for voters…"
                      className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-void)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                    />
                    <span className="mt-1 block text-right font-mono text-[10px] text-[var(--color-mute)]">{caption.length}/300</span>
                  </label>
                </div>
              </section>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"
                >
                  {error}
                </motion.p>
              )}

              {alreadyEntered ? (
                <div className="rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 text-center text-[11px] text-[var(--color-mute)]">
                  ✅ You already entered <span className="font-bold text-white">&ldquo;{contest?.title}&rdquo;</span> this week — one entry per battle.{" "}
                  <Link href={contest ? `/contests/${contest.id}` : "/contests"} className="font-bold text-[var(--color-cyan)] hover:underline">
                    View the battle →
                  </Link>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => void submit()}
                  disabled={busy || uploading || !contest}
                  className="w-full rounded-2xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] py-3.5 text-sm font-black uppercase tracking-wider text-black transition-all hover:shadow-[0_0_26px_rgba(0,255,224,0.35)] disabled:opacity-50"
                >
                  {busy ? "Submitting…" : "🚀 Submit Entry"}
                </motion.button>
              )}

              <p className="text-center text-[10px] text-[var(--color-mute)]">
                Submissions close when the battle ends. Votes are final — you can&apos;t vote for your own entry.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
