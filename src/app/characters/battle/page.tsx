"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface BattleData {
  id: string;
  charA: {
    id: number;
    name: string;
    image: string | null;
    votes: number;
    anime?: string | null;
    role?: string | null;
  };
  charB: {
    id: number;
    name: string;
    image: string | null;
    votes: number;
    anime?: string | null;
    role?: string | null;
  };
  totalVotes: number;
  date: string;
}

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

function useCountUp(target: number, duration = 900) {
  const value = useMotionValue(0);
  const displayed = useSpring(value, { stiffness: 90, damping: 24 });
  const [text, setText] = useState("0");

  useEffect(() => {
    value.set(0);
    const controls = { current: 0, start: 0, raf: 0 };
    const startT = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startT) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      value.set(Math.round(target * eased));
      if (p < 1) controls.raf = requestAnimationFrame(tick);
    };
    controls.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(controls.raf);
  }, [target, duration, value]);

  useEffect(() => {
    const unsub = displayed.on("change", (v) => setText(Math.round(v).toLocaleString()));
    return unsub;
  }, [displayed]);

  return text;
}

function Countdown() {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);
      setLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums text-[var(--color-magenta)]">{left}</span>
  );
}

export default function CharacterBattlePage() {
  const { data: session } = useSession();
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [offline, setOffline] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/characters/battle")
      .then((r) => r.json())
      .then((d) => {
        setBattle(d.battle ?? d);
        setOffline(!!d.offline);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load battle");
        setLoading(false);
      });
  };

  useEffect(load, []);

  const handleVote = async (choice: "A" | "B") => {
    if (!session?.user?.id || voted || voting || !battle) return;
    setVoting(true);
    try {
      const res = await fetch("/api/characters/battle/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battleId: battle.id, choice }),
      });
      const data = await res.json();
      if (data.success) {
        setVoted(choice);
        setJustVoted(choice);
        setBattle((prev) =>
          prev
            ? {
                ...prev,
                charA: { ...prev.charA, votes: data.votesA },
                charB: { ...prev.charB, votes: data.votesB },
                totalVotes: data.totalVotes,
              }
            : prev
        );
      }
    } catch {
      setError("Failed to vote");
    }
    setVoting(false);
  };

  const handleShare = async () => {
    if (!battle) return;
    const text = `⚔️ ${battle.charA.name} vs ${battle.charB.name} — ZyniVerse Daily Character Battle! Vote yours: ${battle.charA.votes} vs ${battle.charB.votes}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ZyniVerse Character Battle", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    } catch {
      /* cancelled */
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="mx-auto h-8 w-56 rounded bg-[var(--color-panel)] animate-pulse" />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <div className="h-[26rem] rounded-2xl bg-[var(--color-panel)] animate-pulse" />
            <div className="hidden sm:flex h-16 w-16 rounded-full bg-[var(--color-panel)] animate-pulse" />
            <div className="h-[26rem] rounded-2xl bg-[var(--color-panel)] animate-pulse" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !battle) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-[var(--color-mute)]">{error || "No battle available"}</p>
          <button
            onClick={load}
            className="mt-4 rounded-lg bg-[var(--color-magenta)]/20 px-4 py-2 text-sm font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black transition-colors"
          >
            Retry
          </button>
        </div>
      </PageTransition>
    );
  }

  const pctA = battle.totalVotes > 0 ? Math.round((battle.charA.votes / battle.totalVotes) * 100) : 50;
  const pctB = battle.totalVotes > 0 ? Math.round((battle.charB.votes / battle.totalVotes) * 100) : 50;
  const winnerA = battle.charA.votes > battle.charB.votes;
  const winnerB = battle.charB.votes > battle.charA.votes;
  const isDraw = battle.charA.votes === battle.charB.votes && battle.totalVotes > 0;

  return (
    <PageTransition>
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Ambient glow behind the arena */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-30 blur-[100px]"
          style={{
            background:
              "radial-gradient(60% 60% at 30% 40%, var(--color-magenta), transparent 70%), radial-gradient(60% 60% at 70% 40%, var(--color-cyan), transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="mb-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-magenta)]"
          >
            ⚔️ Daily Showdown
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: CARD_EASE }}
            className="neon-rgb-border mt-1 inline-block rounded-xl px-4 py-2"
          >
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Character Battle</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-sm text-[var(--color-mute)]"
          >
            Who wins today? Next pairing in <Countdown />
          </motion.p>
        </div>

        {/* Arena */}
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
          <CharacterCard
            character={battle.charA}
            percentage={pctA}
            isWinner={winnerA}
            isLoser={winnerB}
            isDraw={isDraw}
            voted={voted === "A"}
            justVoted={justVoted === "A"}
            disabled={!!voted || voting || offline}
            side="A"
            onVote={() => handleVote("A")}
          />

          {/* VS Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 14 }}
            className="relative flex justify-center"
          >
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-[var(--color-magenta)] blur-xl"
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-magenta)]/50 bg-[var(--color-void)] shadow-[0_0_25px_-5px_var(--color-magenta)]">
              <span className="font-display text-xl font-bold text-[var(--color-magenta)]">VS</span>
            </div>
          </motion.div>

          <CharacterCard
            character={battle.charB}
            percentage={pctB}
            isWinner={winnerB}
            isLoser={winnerA}
            isDraw={isDraw}
            voted={voted === "B"}
            justVoted={justVoted === "B"}
            disabled={!!voted || voting || offline}
            side="B"
            onVote={() => handleVote("B")}
          />
        </div>

        {/* Result duel bar */}
        {battle.totalVotes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto mt-8 flex max-w-2xl items-center gap-1"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2.5 rounded-l-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] shadow-[0_0_12px_-2px_var(--color-magenta)]"
            />
            <div className="h-2.5 w-1 rounded-full bg-white/10" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2.5 rounded-r-full bg-gradient-to-r from-[var(--color-cyan)] to-[#38bdf8] shadow-[0_0_12px_-2px_var(--color-cyan)]"
            />
          </motion.div>
        )}

        {/* Vote stats / footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-4 text-center"
        >
          <p className="text-xs text-[var(--color-mute)]">
            {battle.totalVotes.toLocaleString()} vote{battle.totalVotes !== 1 ? "s" : ""} today
          </p>

          {voted && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-1.5 text-sm text-[var(--color-cyan)]"
            >
              <span>✓</span> Thanks for voting! Results are live — come back tomorrow for a new battle.
            </motion.div>
          )}

          {!session?.user?.id && (
            <p className="mt-2 text-xs text-[var(--color-mute)]">
              <Link href="/login" className="font-semibold text-[var(--color-cyan)] hover:underline">
                Log in
              </Link>{" "}
              to cast your vote
            </p>
          )}

          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleShare}
              className="group rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-xs font-bold text-[var(--color-ink)] transition-all hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
            >
              {shared ? "✓ Copied!" : "🔗 Share Challenge"}
            </button>
            <Link
              href="/characters"
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
            >
              All Characters
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

function CharacterCard({
  character,
  percentage,
  isWinner,
  isLoser,
  isDraw,
  voted,
  justVoted,
  disabled,
  side,
  onVote,
}: {
  character: { id: number; name: string; image: string | null; votes: number; anime?: string | null; role?: string | null };
  percentage: number;
  isWinner: boolean;
  isLoser: boolean;
  isDraw: boolean;
  voted: boolean;
  justVoted: boolean;
  disabled: boolean;
  side: "A" | "B";
  onVote: () => void;
}) {
  const votesText = useCountUp(character.votes);
  const [imgError, setImgError] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // 3D tilt that follows the cursor
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 12);
    rx.set((0.5 - py) * 12);
    glowX.set(px * 100);
    glowY.set(py * 100);
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((ri) => ri.id !== id)), 700);
  };

  const accent = side === "A" ? "var(--color-magenta)" : "var(--color-cyan)";
  const isHighlight = voted || isWinner;

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "A" ? -40 : 40, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: CARD_EASE, delay: side === "A" ? 0 : 0.1 }}
      className="group relative"
      style={{ perspective: 1000 }}
    >
      {/* Hover glow halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: `radial-gradient(60% 60% at var(--gx,50%) var(--gy,50%), ${accent}66, transparent 70%)` }}
      />

      <motion.div
        onMouseMove={onMove}
        onMouseLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", "--gx": glowX, "--gy": glowY, "--accent": accent } as React.CSSProperties}
        className="relative will-change-transform"
      >
        {/* Animated gradient border ring */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
            isHighlight ? "opacity-100" : ""
          }`}
          style={{
            background: `linear-gradient(115deg, transparent 30%, ${accent}aa 50%, transparent 70%)`,
            backgroundSize: "300% 300%",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1.5px",
            animation: "shimmerBorder 2.5s linear infinite",
          }}
        />

        <motion.div
          animate={
            justVoted
              ? { scale: [1, 1.04, 1.01, 1], rotate: [0, -1.5, 1.5, 0], boxShadow: [`0 0 0px ${accent}`, `0 0 55px -6px ${accent}`, `0 0 0px ${accent}`] }
              : isWinner
              ? { boxShadow: ["0 0 20px -10px rgba(34,197,94,0.35)", "0 0 36px -8px rgba(34,197,94,0.55)", "0 0 20px -10px rgba(34,197,94,0.35)"] }
              : {}
          }
          transition={
            justVoted
              ? { duration: 0.9, ease: "easeOut" }
              : isWinner
              ? { duration: 2.2, repeat: Infinity }
              : {}
          }
          style={{ transformStyle: "preserve-3d" }}
          className={`relative overflow-hidden rounded-2xl border transition-colors duration-500 ${
            voted && !isWinner
              ? "border-[var(--color-cyan)]"
              : isWinner
              ? "border-emerald-500/60"
              : isLoser
              ? "border-white/[0.06] opacity-80"
              : "border-white/[0.08] group-hover:border-white/[0.18]"
          }`}
        >
          {/* Character Image (elevated for 3D parallax) */}
          <div
            className="relative aspect-[3/4] overflow-hidden bg-[var(--color-void)]"
            style={{ transform: "translateZ(20px)" }}
          >
            {character.image && !imgError ? (
              <Image
                src={character.image}
                alt={character.name}
                fill
                priority
                unoptimized={character.image.includes("anilist.co")}
                onError={() => setImgError(true)}
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, 45vw"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] text-5xl">
                <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>🌀</motion.span>
                <span className="text-xs font-mono text-[var(--color-mute)]">{character.name}</span>
              </div>
            )}

            {/* Scrollable spotlight that follows cursor */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `radial-gradient(200px circle at var(--gx,50%) var(--gy,50%), #fff 0%, transparent 65%)` }}
            />

            {/* Gradient + subtle colour wash in accent */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div
              aria-hidden
              className={`absolute inset-0 transition-opacity duration-700 ${isWinner ? "opacity-30" : "opacity-0 group-hover:opacity-20"}`}
              style={{ background: `linear-gradient(to top, ${accent}55, transparent 60%)` }}
            />

            {/* Shine sweep on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/10 blur-sm transition-transform duration-1000 ease-out group-hover:translate-x-[300%]"
            />

            <AnimatePresence>
              {justVoted && (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
                >
                  {["💥", "⭐", "✨"].map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, y: 0, opacity: 0 }}
                      animate={{ scale: 1, y: i === 0 ? 0 : (i === 1 ? -70 : 70), opacity: [0, 1, 0] }}
                      transition={{ duration: 0.9, delay: i * 0.08 }}
                      className={`absolute ${i === 0 ? "text-7xl" : "text-3xl"}`}
                      style={{ filter: `drop-shadow(0 0 12px ${accent})` }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vote percentage */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1.5 bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className={`h-full ${
                    isWinner
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : isDraw
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : "bg-gradient-to-r from-white/30 to-white/60"
                  }`}
                />
              </div>
            </div>

            {/* Winner / loser badge */}
            {isWinner && (
              <motion.div
                initial={{ scale: 0, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.5 }}
                className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-bold text-emerald-950 shadow-lg"
              >
                👑 Winner
              </motion.div>
            )}
            {isLoser && !isDraw && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur"
              >
                Defeated
              </motion.div>
            )}

            {/* Live percentage pill */}
            <div
              className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 font-semibold text-white/90 backdrop-blur"
              style={{ transform: "translateZ(30px)" }}
            >
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className={`h-1.5 w-1.5 rounded-full`}
                style={{ background: accent }}
              />
              <motion.span
                key={percentage}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[11px] tabular-nums"
              >
                {percentage}%
              </motion.span>
            </div>
          </div>

          {/* Info + Vote (elevated) */}
          <div className="p-4" style={{ transform: "translateZ(26px)" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/character/${character.id}`}
                  className="group/name line-clamp-1 inline-flex items-center gap-1.5 font-display text-lg font-bold text-white/95 transition-colors hover:text-[var(--color-cyan)]"
                >
                  <span
                    className="bg-[length:0%_2px] bg-bottom bg-no-repeat transition-[background-size] duration-500 group-hover/name:bg-[length:100%_2px]"
                    style={{ backgroundImage: `linear-gradient(${accent}, ${accent})` }}
                  >
                    {character.name}
                  </span>
                </Link>
                {(character.anime || character.role) && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-0.5 line-clamp-1 text-xs text-[var(--color-mute)]"
                  >
                    <span style={{ color: accent }} className="font-semibold">
                      {character.role ? character.role : "From"}
                    </span>{" "}
                    <span className="italic">{character.anime || "popular anime"}</span>
                  </motion.p>
                )}
              </div>
              <motion.span
                key={votesText}
                initial={{ scale: 1.3, color: accent }}
                animate={{ scale: 1 }}
                className="shrink-0 text-sm font-mono font-bold"
                style={{ color: accent }}
              >
                {votesText}
              </motion.span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--color-mute)]">
                {character.votes.toLocaleString()} votes · {percentage}%
              </span>
              <VoteButton
                voted={voted}
                disabled={disabled}
                accent={accent}
                label={voted ? "✓ Voted" : side === "A" ? "Vote A" : "Vote B"}
                onClick={(e) => {
                  handleRipple(e);
                  onVote();
                }}
                ripples={ripples}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function VoteButton({
  voted,
  disabled,
  accent,
  label,
  onClick,
  ripples,
}: {
  voted: boolean;
  disabled: boolean;
  accent: string;
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ripples: { id: number; x: number; y: number }[];
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled && !voted ? { scale: 0.88 } : {}}
      className={`group relative overflow-hidden rounded-lg px-5 py-2 text-xs font-bold transition-all duration-300 ${
        voted
          ? "cursor-default border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]"
          : disabled
          ? "cursor-not-allowed bg-white/5 text-white/30"
          : "text-white"
      }`}
      style={
        !voted && !disabled
          ? {
              background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 35%, transparent), color-mix(in srgb, ${accent} 15%, transparent))`,
              border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)`,
              boxShadow: `0 0 18px -6px ${accent}`,
            }
          : {}
      }
    >
      {/* Shine sweep on hover */}
      {!voted && !disabled && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
      {/* Ripple burst */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute h-10 w-10 rounded-full"
          style={{ left: r.x - 20, top: r.y - 20, background: `${accent}` }}
        />
      ))}
      {voted && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="absolute inset-0 animate-pulse rounded-lg ring-1 ring-inset ring-[var(--color-cyan)]/40"
        />
      )}
      <span className="relative z-10">{label}</span>
      {!voted && !disabled && <span className="sr-only">select</span>}
    </motion.button>
  );
}
