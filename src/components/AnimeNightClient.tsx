"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FriendInput { name: string; tastes: string }
interface AnimePick { title: string; reason: string; mpv_episode?: string; id?: number; image?: string | null; year?: number | null }
interface NightPlan { theme: string; lineup: AnimePick[]; order_note: string; snacks: string[]; quiz: { question: string; answer: string }[]; why: string }

const MOODS: { label: string; emoji: string; color: string }[] = [
  { label: "Chill", emoji: "🌙", color: "#60a5fa" },
  { label: "Hype", emoji: "⚡", color: "#ffd700" },
  { label: "Cozy", emoji: "🛋️", color: "#fda4af" },
  { label: "Sad & Deep", emoji: "🌧️", color: "#818cf8" },
  { label: "Comedy", emoji: "😆", color: "#4ade80" },
  { label: "Action Rush", emoji: "🔥", color: "#fb7185" },
  { label: "Nostalgia", emoji: "📼", color: "#c084fc" },
];

const DURATIONS = ["1-2 hours", "3-4 hours", "5-6 hours", "Marathon"];
const SNACK_EMOJIS = ["🍿", "🍜", "🧋", "🍕", "🍡", "🍫"];

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function CoverImage({ src, size = "md" }: { src: string | null | undefined; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const dims = size === "lg" ? "h-28 w-20" : "h-14 w-10";
  return (
    <div className={`relative ${dims} shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-[#15121d]`}>
      {src && !failed ? (
        <>
          <div className="absolute inset-0 shimmer" />
          <Image
            src={src}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="64px"
            unoptimized
            onLoad={(e) => ((e.target as HTMLImageElement).style.opacity = "1")}
            onError={() => setFailed(true)}
            style={{ opacity: 0 }}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/60 to-[var(--color-magenta)]/40">
          <span className="text-sm opacity-80">🎬</span>
        </div>
      )}
    </div>
  );
}

export default function AnimeNightClient() {
  const [friends, setFriends] = useState<FriendInput[]>([{ name: "", tastes: "" }, { name: "", tastes: "" }]);
  const [mood, setMood] = useState("Chill");
  const [duration, setDuration] = useState("3-4 hours");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<NightPlan | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [creatingParty, setCreatingParty] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);

  function updateFriend(i: number, key: keyof FriendInput, value: string) {
    setFriends((fs) => fs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));
  }

  function addFriend() {
    if (friends.length >= 8) return;
    setFriends((fs) => [...fs, { name: "", tastes: "" }]);
  }

  function removeFriend(i: number) {
    setFriends((fs) => fs.filter((_, idx) => idx !== i));
  }

  function randomize() {
    const random = MOODS[Math.floor(Math.random() * MOODS.length)];
    setMood(random.label);
    setDuration(DURATIONS[Math.floor(Math.random() * DURATIONS.length)]);
    setFriends((fs) =>
      fs.map((f) => ({
        ...f,
        name: f.name || "",
        tastes: f.tastes || TASTE_TEMPLATES[Math.floor(Math.random() * TASTE_TEMPLATES.length)],
      }))
    );
  }

  async function generate() {
    const valid = friends.filter((f) => f.name.trim() || f.tastes.trim());
    if (valid.length === 0) { setError("Add at least one friend and their taste."); return; }
    setLoading(true); setError(""); setPlan(null);
    try {
      const res = await fetch("/api/ai/night-gen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friends: valid, mood, duration }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't plan the night."); setLoading(false); return; }
      setPlan(data.plan);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch { setError("Network error. Try again."); setLoading(false); return; }
    setLoading(false);
  }

  async function createPartyNow() {
    if (!plan?.lineup?.[0]?.id || creatingParty) return;
    setCreatingParty(true); setError("");
    try {
      const res = await fetch("/api/ai/night-gen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friends: friends.filter((f) => f.name.trim() || f.tastes.trim()), mood, duration, createParty: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't create party."); setCreatingParty(false); return; }
      if (data.party?.id) { setPartyId(data.party.id); return; }
      setCreatingParty(false);
    } catch { setError("Couldn't create party."); setCreatingParty(false); }
    setCreatingParty(false);
  }

  const moodObj = MOODS.find((m) => m.label === mood) ?? MOODS[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(45% 50% at 15% 10%, rgba(0,255,224,0.4), transparent 70%), radial-gradient(50% 50% at 85% 15%, rgba(192,132,252,0.4), transparent 70%), radial-gradient(40% 40% at 60% 90%, rgba(255,107,107,0.3), transparent 70%)",
        }}
      />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="console-label mb-3">✦ AI · Group Planner</p>
            <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">
              Anime Night Generator
            </h1>
            <p className="mt-3 text-sm text-[var(--color-mute)]">
              Sabki tastes daalo — Zyni AI blend karke poori night plan karegi: lineup, episode order, snacks aur quiz tak.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["🌙 Lineup", "🍿 Snacks", "📝 Trivia quiz", "🎬 Watch Party"].map((chip) => (
                <span key={chip} className="glass-badge !px-3 !py-1.5 !text-[11px]">{chip}</span>
              ))}
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hidden text-6xl drop-shadow-[0_0_30px_rgba(0,255,224,0.4)] sm:block"
          >
            🌙
          </motion.div>
        </div>
      </motion.section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2" ref={resultsRef}>
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, ...spring }}
          className="group meme-card-border relative self-start overflow-hidden rounded-3xl bg-[#15121d]/90 p-5 sm:p-6"
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
          <div className="relative mb-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0a0910] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)] text-[12px] font-black text-black shadow-[0_0_14px_rgba(0,255,224,0.3)]">1</span>
              <div>
                <p className="text-sm font-bold tracking-wide">Add your crew 👥</p>
                <p className="text-[11px] text-[var(--color-mute)]">Tastes daalo — AI sabko blend karega</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={addFriend}
              disabled={friends.length >= 8}
              className="rounded-full border border-[var(--color-cyan)]/40 px-3 py-1.5 text-xs font-bold text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/15 disabled:opacity-40"
            >
              + Add friend
            </motion.button>
          </div>
          {friends.length >= 8 && <p className="mt-1 text-[10px] text-[var(--color-mute)]">Max 8 friends allowed</p>}

          <div className="mt-4 space-y-2.5">
            <AnimatePresence initial={false}>
              {friends.map((f, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, height: 0, scale: 0.96 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.94 }}
                  transition={spring}
                  className="overflow-hidden"
                >
                  <div className="group/friend relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/[0.07] bg-black/20 p-2 transition-all duration-300 focus-within:neon-rgb-ring focus-within:shadow-[0_0_20px_rgba(255,0,255,0.25)]">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-black"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hashHue(f.name || "A")} 70% 55%), hsl(${(hashHue(f.name || "A") + 60) % 360} 70% 45%))`,
                        color: "black",
                      }}
                    >
                      {(f.name.trim() || `F${i + 1}`)[0].toUpperCase()}
                    </div>
                    <input
                      value={f.name}
                      onChange={(e) => updateFriend(i, "name", e.target.value)}
                      placeholder={`Friend ${i + 1} name`}
                      maxLength={20}
                      className="w-24 shrink-0 bg-transparent px-1 py-1.5 text-xs text-white outline-none focus-visible:outline-none placeholder:text-[var(--color-mute)]"
                    />
                    <input
                      value={f.tastes}
                      onChange={(e) => updateFriend(i, "tastes", e.target.value)}
                      placeholder="action, Jujutsu, 12 eps"
                      maxLength={80}
                      className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-xs text-white outline-none focus-visible:outline-none placeholder:text-[var(--color-mute)]"
                    />
                    {friends.length > 1 && (
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => removeFriend(i)}
                        className="shrink-0 rounded-md px-1 text-[var(--color-mute)] transition-colors hover:text-red-400"
                        aria-label="Remove friend"
                      >
                        ✕
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={randomize} className="mt-1 text-[11px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]">
              🎲 Surprise me — random tastes &amp; mood
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)] text-[11px] font-black text-black">2</span>
              <p className="text-sm font-bold tracking-wide">Night mood</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MOODS.map((m) => (
                <motion.button
                  key={m.label}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setMood(m.label)}
                  className={`relative overflow-hidden rounded-xl border p-2.5 text-left transition-all duration-300 ${
                    mood === m.label
                      ? "border-transparent"
                      : "border-white/[0.07] bg-black/20 hover:border-white/[0.15] hover:bg-black/35"
                  }`}
                  style={mood === m.label ? { boxShadow: `0 0 22px ${m.color}44` } : undefined}
                >
                  {mood === m.label && <motion.span layoutId="mood-glow" className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${m.color}33, ${m.color}11)` }} />}
                  <span className="absolute inset-x-0 top-0 z-10 h-px" style={{ background: mood === m.label ? m.color : undefined }} />
                  <span className="relative z-10 block text-xl">{m.emoji}</span>
                  <span className={`relative z-10 mt-0.5 block text-[11px] font-bold ${mood === m.label ? "" : "text-[var(--color-mute)]"}`} style={mood === m.label ? { color: m.color } : undefined}>
                    {m.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[var(--color-magenta)] to-[#ffd700] text-[11px] font-black text-black">3</span>
              <p className="text-sm font-bold tracking-wide">Duration</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DURATIONS.map((d) => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setDuration(d)}
                  className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-300 ${
                    duration === d
                      ? "border-transparent text-black"
                      : "border-white/[0.07] bg-black/20 text-[var(--color-mute)] hover:text-white hover:border-white/[0.15]"
                  }`}
                >
                  {duration === d && (
                    <motion.span
                      layoutId="duration-glow"
                      className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)]"
                      style={{ boxShadow: "0 0 20px rgba(0,255,224,0.35)" }}
                    />
                  )}
                  <span className="relative z-10">⏱ {d}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void generate()}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-violet)] to-[var(--color-magenta)] py-3.5 text-sm font-black uppercase tracking-widest text-black transition-all hover:shadow-[0_0_30px_rgba(0,255,224,0.35)] disabled:opacity-60"
          >
            {loading ? "🌌 Building your night…" : "✨ Generate Anime Night"}
          </motion.button>
        </motion.div>

        {/* Results */}
        <div ref={resultsRef} className="scroll-mt-24">
          {!plan && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, ...spring }}
              className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/30 p-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl drop-shadow-[0_0_25px_rgba(192,132,252,0.5)]"
              >
                📺
              </motion.div>
              <p className="max-w-xs text-sm text-[var(--color-mute)]">
                Yahan tumhara AI-planned night dikhega. Left side se apne group ki tastes add karo.
              </p>
            </motion.div>
          )}

          {loading && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/30 p-8 text-center">
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: i === 0 ? "#00ffdf" : i === 1 ? "#a78bfa" : "#ff7ad9" }}
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{moodObj.emoji} Mixing {friends.filter((f) => f.name || f.tastes).length} taste profile{friends.filter((f) => f.name || f.tastes).length !== 1 ? "s" : ""}…</p>
              <p className="text-xs text-[var(--color-mute)]">Zyni AI lineup, snacks aur quiz bana rahi hai</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {plan && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {/* Theme */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/85 p-6 backdrop-blur-sm"
                >
                  <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(120% 120% at 75% -10%, ${moodObj.color}1f, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${moodObj.color}0f, transparent 55%)`,
                    }}
                  />
                  <div className="award-sheen" />
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="h-1.5 w-8 rounded-full" style={{ background: moodObj.color, boxShadow: `0 0 10px ${moodObj.color}88` }} />
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-cyan)]">✦ Tonight&apos;s theme</span>
                  </div>
                  <h3 className="neon-text-gradient relative z-10 mt-2 font-display text-2xl font-black sm:text-3xl">
                    {moodObj.emoji} {plan.theme}
                  </h3>
                  <p className="relative z-10 mt-2 text-sm leading-relaxed text-[var(--color-mute)]">{plan.why}</p>
                </motion.div>

                {/* Lineup */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.08 }}
                  className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/85 p-5 backdrop-blur-sm"
                >
                  <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-lg">🎬</span>
                    <h4 className="text-sm font-bold tracking-wide">Tonight&apos;s lineup</h4>
                    <span className="ml-auto glass-badge !px-2.5 !py-1 !text-[10px]">{plan.lineup.length} picks</span>
                  </div>
                  <div className="space-y-3">
                    {plan.lineup.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.09, ...spring }}
                        className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/25 p-2.5 transition-all hover:border-white/[0.12] hover:bg-black/40"
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-black ${
                            i === 0
                              ? "bg-gradient-to-br from-[#ffd700] to-[var(--color-magenta)] shadow-[0_0_14px_rgba(255,215,0,0.4)]"
                              : i === 1
                                ? "bg-gradient-to-br from-[#e5e7eb] to-slate-400 shadow-[0_0_10px_rgba(229,231,235,0.3)]"
                                : i === 2
                                  ? "bg-gradient-to-br from-[#f59e0b] to-[#b45309] shadow-[0_0_10px_rgba(245,158,11,0.35)]"
                                  : "bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)]"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <CoverImage src={p.image} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {p.id ? (
                              <Link
                                href={`/anime/${p.id}`}
                                className="truncate text-sm font-semibold text-[var(--color-ink)] underline-offset-4 transition-colors hover:text-[var(--color-cyan)] hover:underline"
                              >
                                {p.title}
                              </Link>
                            ) : (
                              <p className="truncate text-sm font-semibold">{p.title}</p>
                            )}
                            {p.year != null && (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--color-mute)]">{p.year}</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-mute)]">
                            {p.mpv_episode ? (
                              <>
                                Start: <span className="font-semibold text-[var(--color-cyan)]">{p.mpv_episode}</span> ·
                              </>
                            ) : null}{" "}
                            {p.reason}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {plan.order_note && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-3 rounded-lg border border-dashed border-[var(--color-line)] bg-black/20 px-3 py-2 text-xs text-[var(--color-mute)]"
                    >
                      🧭 <span className="font-semibold text-[var(--color-ink)]">Order:</span> {plan.order_note}
                    </motion.p>
                  )}
                </motion.div>

                {/* Snacks + Quiz */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.16 }}
                  className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/85 p-5 backdrop-blur-sm"
                >
                  <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍿</span>
                    <h4 className="text-sm font-bold tracking-wide">Snack run</h4>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.snacks.map((s, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.07, ...spring }}
                        className="rounded-full border border-white/[0.08] bg-black/25 px-3 py-1.5 text-xs text-[var(--color-ink)]"
                      >
                        {SNACK_EMOJIS[i % SNACK_EMOJIS.length]} {s}
                      </motion.span>
                    ))}
                  </div>

                  {plan.quiz.length > 0 && (
                    <div className="mt-5 border-t border-white/[0.06] pt-4">
                      <button
                        onClick={() => setShowQuiz((v) => !v)}
                        className="flex w-full items-center justify-between text-xs font-bold text-[var(--color-cyan)] transition-colors hover:text-white"
                      >
                        <span>📝 Mid-night trivia quiz ({plan.quiz.length})</span>
                        <motion.span animate={{ rotate: showQuiz ? 180 : 0 }} transition={spring} className="inline-block">
                          ▾
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {showQuiz && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2">
                              {plan.quiz.map((q, i) => (
                                <motion.details
                                  key={i}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.05 + i * 0.05 }}
                                  className="group cursor-pointer rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 transition-colors hover:border-[var(--color-cyan)]/40"
                                >
                                  <summary className="select-none text-xs font-semibold text-[var(--color-ink)] marker:text-[var(--color-cyan)]">
                                    Q{i + 1}. {q.question}
                                  </summary>
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-1.5 border-t border-white/[0.06] pt-1.5 text-xs leading-relaxed text-[var(--color-cyan)]"
                                  >
                                    <span className="mr-1">💡</span>A. {q.answer}
                                  </motion.p>
                                </motion.details>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>

                {/* Party CTA */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.24 }}>
                  {partyId ? (
                    <motion.div
                      initial={{ scale: 0.92 }}
                      animate={{ scale: 1 }}
                      className="rounded-2xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 p-5 text-center"
                    >
                      <motion.span
                        animate={{ rotate: [0, 14, -14, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="inline-block text-3xl"
                      >
                        🎉
                      </motion.span>
                      <p className="mt-2 text-sm font-bold text-white">Party room created!</p>
                      <Link
                        href={`/watch-party/${partyId}`}
                        className="mt-3 inline-block rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-6 py-3 text-sm font-black text-black transition-transform hover:scale-[1.02]"
                      >
                        Open the room →
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void createPartyNow()}
                      disabled={creatingParty || !plan.lineup?.[0]?.id}
                      className="w-full rounded-xl border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--color-magenta)] transition-all hover:bg-[var(--color-magenta)]/20 hover:shadow-[0_0_25px_rgba(255,122,217,0.25)] disabled:opacity-50"
                    >
                      {creatingParty ? "🔨 Creating room…" : "🎬 Start this night as a Watch Party"}
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const TASTE_TEMPLATES = [
  "action, Attack on Titan, 25 eps",
  "romance, comedy, Your Name",
  "dark thriller, Death Note",
  "sports hype, Haikyuu",
  "slice of life, cozies, 12 eps",
  "mecha, sci-fi, epic scale",
  "isekai fantasy, adventures",
  "psychological, mind games",
];