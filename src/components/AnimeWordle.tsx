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

export default function AnimeWordle({ stats }: { stats?: WordleStats }) {
  const [dailyAnime, setDailyAnime] = useState<DailyAnime | null>(null);
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
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_ATTEMPTS = 6;

  const fetchDaily = useCallback(async () => {
    try {
      const res = await fetch("/api/wordle");
      if (res.ok) {
        const data = await res.json();
        setDailyAnime(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDaily();
  }, [fetchDaily]);

  useEffect(() => {
    if (input.length > 1 && dailyAnime) {
      const allTitles = [
        "Death Note", "Attack on Titan", "Sword Art Online", "Fullmetal Alchemist Brotherhood",
        "Steins;Gate", "One Punch Man", "Demon Slayer", "Naruto", "Naruto Shippuuden",
        "Hunter x Hunter", "Tokyo Ghoul", "My Hero Academia", "One Piece", "Re:Zero",
        "Gintama", "Cowboy Bebop", "Your Lie in April", "Neon Genesis Evangelion",
        "Spy x Family", "Kimi no Na wa.", "Clannad", "Trigun", "No Game No Life",
        "Kono Suba", "Frieren", "Jujutsu Kaisen", "Chainsaw Man", "Solo Leveling",
      ];
      const matches = allTitles.filter(
        (t) => t.toLowerCase().includes(input.toLowerCase()) && t.toLowerCase() !== input.toLowerCase()
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions(matches.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [input, dailyAnime]);

  const submitGuess = async () => {
    if (!input.trim() || submitting || gameOver) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/wordle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: input.trim() }),
      });

      if (res.ok) {
        const result: GuessResult = await res.json();
        const newGuesses = [...guesses, result];
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
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const shareResults = () => {
    const emojiGrid = guesses
      .map((g) => {
        if (g.correct) return "\u{1F7E2}";
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
    if (sim >= 80) return "text-green-400";
    if (sim >= 60) return "text-yellow-400";
    if (sim >= 40) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/3" />
          <div className="h-10 bg-white/5 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-bold">{"\u{1F3AE}"} Daily Anime Wordle</h2>
            <p className="text-xs text-[var(--color-mute)] mt-0.5">Guess the anime in {MAX_ATTEMPTS} tries</p>
          </div>
          <div className="flex items-center gap-2">
            {stats && (
              <div className="text-right mr-2">
                <div className="text-[10px] text-[var(--color-mute)]">Streak</div>
                <div className="text-sm font-mono font-bold text-[var(--color-cyan)]">{stats.currentStreak}</div>
              </div>
            )}
            <button
              onClick={() => setShowStats(!showStats)}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
            >
              Stats
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
            placeholder="Type an anime name..."
            disabled={gameOver || submitting}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)]/50 focus:outline-none focus:border-[var(--color-cyan)]/50 disabled:opacity-50"
          />
          {suggestions.length > 0 && !gameOver && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[var(--color-panel)] border border-white/10 shadow-xl z-10 overflow-hidden">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); setSuggestions([]); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-white/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={submitGuess}
          disabled={!input.trim() || submitting || gameOver}
          className="w-full rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-all disabled:opacity-50"
        >
          {submitting ? "Checking..." : gameOver ? "Game Over" : "Guess"}
        </button>
      </div>

      <AnimatePresence>
        {guesses.length > 0 && (
          <div className="space-y-2">
            {guesses.map((guess, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`neon-rgb-border rounded-xl p-4 ${guess.correct ? "border-green-500/50" : ""}`}
                style={{
                  backgroundColor: guess.correct ? "rgba(34,197,94,0.08)" : "rgba(var(--color-panel), 0.6)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-display font-bold">{guess.guess}</span>
                  <span className={`text-xs font-mono font-bold ${getSimilarityColor(guess.similarity)}`}>
                    {guess.similarity}% match
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {guess.hints.map((hint, j) => {
                    let chip = "bg-white/5 border border-white/10 text-[var(--color-mute)]";
                    if (hint.startsWith("Genre:")) {
                      const val = hint.slice(6);
                      chip = val.startsWith("No") ? "bg-[var(--color-magenta)]/10 border border-[var(--color-magenta)]/30 text-[var(--color-magenta)]" : "bg-green-500/10 border border-green-500/30 text-green-400";
                    } else if (hint.startsWith("Format:")) {
                      const val = hint.slice(7);
                      chip = val.startsWith("Not") ? "bg-[var(--color-magenta)]/10 border border-[var(--color-magenta)]/30 text-[var(--color-magenta)]" : "bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30 text-[var(--color-cyan)]";
                    } else if (hint.startsWith("Year:")) {
                      chip = "bg-amber-500/10 border border-amber-500/30 text-amber-400";
                    } else if (hint.startsWith("Studio:")) {
                      chip = "bg-[var(--color-violet)]/10 border border-[var(--color-violet)]/30 text-[var(--color-violet)]";
                    } else if (hint.startsWith("Episodes:")) {
                      chip = "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400";
                    } else if (hint === "Correct!") {
                      chip = "bg-green-500/15 border border-green-500/40 text-green-400 font-bold";
                    }
                    return (
                      <span key={j} className={`rounded-md px-2 py-1 text-[10px] ${chip}`}>
                        {hint}
                      </span>
                    );
                  })}
                </div>
                {guess.correct && (
                  <div className="mt-2 text-sm font-bold text-green-400">{"\u{2714}"} Correct!</div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-6 text-center"
        >
          {won ? (
            <div className="text-2xl font-display font-bold text-green-400 mb-2">{"\u{1F389}"} You got it!</div>
          ) : (
            <div>
              <div className="text-2xl font-display font-bold text-red-400 mb-2">{"\u{1F614}"} Better luck next time!</div>
              <div className="text-sm text-[var(--color-mute)]">The answer was: <span className="font-bold text-[var(--color-cyan)]">{answerTitle || "..."}</span></div>
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={shareResults}
              className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 transition-all"
            >
              {shareTooltip ? "\u{2714} Copied!" : "Share Results"}
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-5"
          >
            <h3 className="font-display text-sm font-bold mb-3">Statistics</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Played", value: stats.totalGames },
                { label: "Win %", value: stats.winPercentage },
                { label: "Streak", value: stats.currentStreak },
                { label: "Max", value: stats.maxStreak },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-mono font-bold text-[var(--color-cyan)]">{s.value}</div>
                  <div className="text-[9px] text-[var(--color-mute)] uppercase">{s.label}</div>
                </div>
              ))}
            </div>
            <h4 className="text-[10px] font-bold text-[var(--color-mute)] uppercase mb-2">Guess Distribution</h4>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5, 6].map((n) => {
                const count = stats.guessDistribution[n] || 0;
                const maxCount = Math.max(...Object.values(stats.guessDistribution), 1);
                return (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--color-mute)] w-3">{n}</span>
                    <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]"
                        style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? "20px" : "0" }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-mute)] w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
