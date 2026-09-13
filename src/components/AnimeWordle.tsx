"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyAnime {
  mediaId: number;
  genres: string[];
  format: string;
  year: number;
  season: string;
  episodeCount: number;
}

interface GuessResult {
  guess: string;
  correct: boolean;
  similarity: number;
  hints: string[];
  target?: { title: string };
}

interface WordleStats {
  totalGames: number;
  wins: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
}

interface SavedProgress {
  mediaId: number;
  guesses: GuessResult[];
  gameOver: boolean;
  won: boolean;
  answerTitle: string | null;
}

const STORAGE_KEY = "zyni-wordle-progress";

const A = "#00ff7c";
const GOLD = "#ffd700";
const VIOLET = "#8a2be2";
const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

const SUGGESTION_POOL = [
  "Death Note", "Attack on Titan", "Sword Art Online", "Fullmetal Alchemist Brotherhood",
  "Steins;Gate", "One Punch Man", "Demon Slayer", "Naruto", "Naruto Shippuuden",
  "Hunter x Hunter", "Tokyo Ghoul", "My Hero Academia", "One Piece", "Re:Zero",
  "Gintama", "Cowboy Bebop", "Your Lie in April", "Neon Genesis Evangelion",
  "Spy x Family", "Kimi no Na wa.", "Clannad", "Trigun", "No Game No Life",
  "Kono Suba", "Frieren", "Jujutsu Kaisen", "Chainsaw Man", "Solo Leveling",
];

export default function AnimeWordle({ stats }: { stats?: WordleStats }) {
  const [daily, setDaily] = useState<DailyAnime | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [answerTitle, setAnswerTitle] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_ATTEMPTS = 6;

  const fetchDaily = useCallback(async () => {
    try {
      const res = await fetch("/api/wordle");
      if (res.ok) {
        const data = await res.json();
        setDaily(data);
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const saved = JSON.parse(raw) as SavedProgress;
            if (saved.mediaId === data.mediaId && saved.guesses?.length) {
              setGuesses(saved.guesses);
              setGameOver(saved.gameOver);
              setWon(saved.won);
              setAnswerTitle(saved.answerTitle || null);
            }
          }
        } catch {
          // ignore corrupt saved state
        }
      }
    } catch {
      setError("Couldn't load today's puzzle");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDaily();
  }, [fetchDaily]);

  useEffect(() => {
    if (input.length > 1) {
      const matches = SUGGESTION_POOL.filter(
        (t) => t.toLowerCase().includes(input.toLowerCase()) && t.toLowerCase() !== input.toLowerCase()
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const submitGuess = async () => {
    if (!input.trim() || submitting || gameOver) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/wordle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: input.trim(), attempts: guesses.length }),
      });

      const data = await res.json();
      if (res.ok) {
        const result: GuessResult = data;
        const newGuesses = [...guesses, result];
        const isNowGameOver = result.correct || newGuesses.length >= MAX_ATTEMPTS;
        setGuesses(newGuesses);
        setInput("");
        setSuggestions([]);

        if (result.correct) {
          setWon(true);
          setGameOver(true);
          if (result.target?.title) setAnswerTitle(result.target.title);
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
          setGameOver(true);
          if (result.target?.title) setAnswerTitle(result.target.title);
        }

        if (daily) {
          try {
            const saved: SavedProgress = {
              mediaId: daily.mediaId,
              guesses: newGuesses,
              gameOver: isNowGameOver,
              won: result.correct,
              answerTitle: result.target?.title || null,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          } catch {
            // ignore
          }
        }
      } else {
        setError(data?.message === "Unauthorized" ? "Sign in to play the daily wordle" : data?.message || "Something went wrong");
      }
    } catch {
      setError("Couldn't submit your guess");
    } finally {
      setSubmitting(false);
    }
  };

  const shareResults = () => {
    const emojiGrid = guesses
      .map((g) => {
        if (g.correct) return "\u{1F7E9}";
        if (g.similarity >= 70) return "\u{1F7E1}";
        if (g.similarity >= 40) return "\u{1F7E0}";
        return "\u{2B1B}";
      })
      .join("");

    const text = `Anime Wordle ${guesses.length}/${MAX_ATTEMPTS}\n${emojiGrid}\nhttps://zyverse.in/wordle`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  const getSimilarityColor = (sim: number) => {
    if (sim >= 80) return "#00ff7c";
    if (sim >= 60) return "#ffd700";
    if (sim >= 40) return "#ff7ad9";
    return "#ff5050";
  };

  const getHintChip = (hint: string) => {
    if (hint.startsWith("Genre:")) {
      const val = hint.slice(6);
      return val.startsWith("No")
        ? { text: hint, color: "#ff7ad9", bg: "rgba(255,122,217,0.1)" }
        : { text: `Genre ✓ ${val}`, color: A, bg: "rgba(0,255,124,0.1)" };
    }
    if (hint.startsWith("Format:")) {
      const val = hint.slice(7);
      return { text: hint, color: val.startsWith("Not") ? "#ff7ad9" : "#00ffff", bg: val.startsWith("Not") ? "rgba(255,122,217,0.1)" : "rgba(0,255,255,0.1)" };
    }
    if (hint.startsWith("Year:")) return { text: hint, color: GOLD, bg: "rgba(255,215,0,0.1)" };
    if (hint.startsWith("Studio:")) return { text: hint, color: VIOLET, bg: "rgba(138,43,226,0.1)" };
    if (hint.startsWith("Episodes:")) return { text: hint, color: "#34d399", bg: "rgba(52,211,153,0.1)" };
    if (hint === "Correct!") return { text: "✓ Correct!", color: A, bg: "rgba(0,255,124,0.16)" };
    return { text: hint, color: "#c9b6ff", bg: "rgba(255,255,255,0.05)" };
  };

  if (loading) {
    return (
      <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-7 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
        <div className="space-y-4">
          <div className="shimmer h-4 w-40 rounded" />
          <div className="shimmer h-12 w-full rounded-2xl" />
          <div className="shimmer h-12 w-full rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-5 backdrop-blur-sm sm:p-7">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 75% -10%, rgba(0,255,124,0.1), transparent 55%), radial-gradient(120% 120% at 10% 110%, rgba(138,43,226,0.12), transparent 55%)" }} />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="console-label mb-2">🎮 Daily Anime Wordle</p>
              <p className="text-xs text-[var(--color-mute)]">Guess the anime in {MAX_ATTEMPTS} tries</p>
            </div>
            <div className="flex items-center gap-2">
              {stats && (
                <div className="mr-1 text-right">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--color-mute)]">Streak</div>
                  <motion.div key={stats.currentStreak} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring} className="font-mono text-lg font-black text-[#00ffff]" style={{ textShadow: "0 0 16px rgba(0,255,255,0.4)" }}>{stats.currentStreak}🔥</motion.div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStats(!showStats)}
                className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-xs font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
              >
                Stats
              </motion.button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
              const filled = i < guesses.length;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, ...spring }}
                  className="h-2.5 flex-1 rounded-full"
                  style={{
                    background: filled
                      ? (i === guesses.length - 1 && gameOver && won ? A : i === guesses.length - 1 && gameOver ? "#ff5050" : GOLD)
                      : "rgba(255,255,255,0.07)",
                    boxShadow: filled ? `0 0 12px ${i === guesses.length - 1 && gameOver ? (won ? A : "#ff5050") : GOLD}55` : "none",
                  }}
                />
              );
            })}
          </div>

          <div className="relative mt-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitGuess()}
              placeholder="Type an anime name..."
              disabled={gameOver || submitting}
              className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-[var(--color-mute)]/50 focus:border-[#00ff7c]/50 focus:bg-black/40 disabled:opacity-50"
              style={{ caretColor: A }}
            />
            <AnimatePresence>
              {suggestions.length > 0 && !gameOver && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#15121d]/95 shadow-2xl backdrop-blur-sm"
                >
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, ...spring }}
                      onClick={() => { setInput(s); setSuggestions([]); }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[var(--color-ink)] transition-colors hover:bg-[#00ff7c]/10"
                    >
                      <span className="font-medium">{s}</span>
                      <motion.span whileHover={{ x: 3 }} className="text-xs text-[#00ff7c]">↵</motion.span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-xs font-semibold text-[#ff5050]">
              ⚠ {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={submitGuess}
            disabled={!input.trim() || submitting || gameOver}
            className="mt-3 w-full rounded-xl px-6 py-3.5 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: submitting ? "#c9b6ff" : gameOver ? "rgba(255,255,255,0.25)" : "linear-gradient(90deg, #00ff7c, #00ffff)", boxShadow: submitting ? "none" : "0 0 26px rgba(0,255,124,0.35)" }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}>◐</motion.span>
                Checking...
              </span>
            ) : gameOver ? "Game Over" : "Guess →"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {guesses.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
            {guesses.map((guess, i) => {
              const simColor = getSimilarityColor(guess.similarity);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...spring }}
                  whileHover={{ y: -2 }}
                  className="group relative overflow-hidden rounded-2xl border bg-black/25 p-4 transition-all"
                  style={{
                    borderColor: guess.correct ? A : "rgba(255,255,255,0.07)",
                    boxShadow: guess.correct ? `0 0 24px ${A}22` : "none",
                  }}
                >
                  {guess.correct && <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 120% at 80% -20%, ${A}18, transparent 60%)` }} />}
                  <div className="relative flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] bg-[#15121d] font-mono text-[10px] font-bold text-[var(--color-mute)]">#{i + 1}</span>
                      <span className="font-display text-sm font-bold text-[var(--color-ink)]">{guess.guess}</span>
                      {guess.correct && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring} className="text-sm">🎉</motion.span>}
                    </div>
                    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, ...spring }} className="flex items-center gap-2 rounded-full border px-2.5 py-1" style={{ borderColor: `${simColor}40`, background: `${simColor}10` }}>
                      <span className="font-mono text-xs font-black tabular-nums" style={{ color: simColor }}>{guess.similarity}%</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </motion.div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${guess.similarity}%` }}
                      transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: simColor, boxShadow: `0 0 10px ${simColor}66` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {guess.hints.map((hint, j) => {
                        const chip = getHintChip(hint);
                        return (
                          <motion.span
                            key={j}
                            layout
                            initial={{ opacity: 0, scale: 0.8, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.25 + j * 0.07, ...spring }}
                            whileHover={{ scale: 1.05 }}
                            className="rounded-lg border px-2.5 py-1 text-[10px] font-bold"
                            style={{ borderColor: `${chip.color}33`, background: chip.bg, color: chip.color }}
                          >
                            {chip.text}
                          </motion.span>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={spring}
            className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 text-center backdrop-blur-sm"
          >
            <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: won ? `radial-gradient(120% 120% at 50% -20%, ${A}1a, transparent 60%)` : "radial-gradient(120% 120% at 50% -20%, rgba(255,80,80,0.12), transparent 60%)" }} />
            <div className="relative z-10">
              {won ? (
                <div>
                  <motion.span animate={{ rotate: [0, 14, -14, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} className="inline-block text-4xl">🎉</motion.span>
                  <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, ...spring }} className="mt-2 font-display text-2xl font-black text-[#00ff7c]" style={{ textShadow: "0 0 24px rgba(0,255,124,0.4)" }}>You got it!</motion.div>
                  <div className="mt-1 font-mono text-sm text-[var(--color-mute)]">Solved in <span className="font-black text-[#00ffff]">{guesses.length}</span> tries</div>
                </div>
              ) : (
                <div>
                  <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block text-4xl">😢</motion.span>
                  <div className="mt-2 font-display text-2xl font-black text-[#ff5050]">Better luck next time!</div>
                  <div className="mt-1 text-sm text-[var(--color-mute)]">
                    The answer was: <span className="font-black text-[#00ffff]">{answerTitle || "..."}</span>
                  </div>
                </div>
              )}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareResults}
                  className="rounded-xl bg-gradient-to-r from-[#00ff7c] to-[#00ffff] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:brightness-110"
                  style={{ boxShadow: "0 0 24px rgba(0,255,124,0.35)" }}
                >
                  {shareTooltip ? "✓ Copied!" : "Share Results"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowStats(true)}
                  className="rounded-xl border border-white/[0.08] bg-black/25 px-6 py-2.5 text-xs font-bold text-[var(--color-mute)] transition-colors hover:text-white"
                >
                  View Stats
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div initial={{ y: 10 }} animate={{ y: 0 }} className="group meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
              <div className="relative z-10">
                <p className="console-label mb-4">📊 Statistics</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Played", value: stats.totalGames, color: "#00ffff" },
                    { label: "Win %", value: stats.winPercentage, color: A },
                    { label: "Streak", value: stats.currentStreak, color: GOLD },
                    { label: "Max", value: stats.maxStreak, color: "#ff7ad9" },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ...spring }} className="text-center">
                      <motion.div key={s.value} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={spring} className="font-mono text-lg font-black" style={{ color: s.color }}>{s.value}</motion.div>
                      <div className="text-[9px] uppercase tracking-widest text-[var(--color-mute)]">{s.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Guess Distribution</p>
                  <div className="space-y-1.5">
                    {[1, 2, 3, 4, 5, 6].map((n, i) => {
                      const count = stats.guessDistribution[n] || 0;
                      const maxCount = Math.max(...Object.values(stats.guessDistribution), 1);
                      const pct = count > 0 ? Math.max(12, (count / maxCount) * 100) : 0;
                      return (
                        <div key={n} className="flex items-center gap-2">
                          <span className="w-3 text-[10px] font-mono text-[var(--color-mute)]">{n}</span>
                          <div className="h-4 flex-1 overflow-hidden rounded bg-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                              className="flex h-full items-center justify-end rounded bg-gradient-to-r from-[#8a2be2]/70 to-[#00ff7c] px-1.5"
                            >
                              {count > 0 && <span className="text-[9px] font-mono font-bold text-black">{count}</span>}
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}