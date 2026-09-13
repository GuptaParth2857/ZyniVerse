"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BingoCardComponent from "@/components/BingoCard";
import { generateSquares, seasonLabel, type BingoCard, type BingoSquare } from "@/lib/bingo";

const SEASONS = [
  { value: "WINTER", label: "Winter", icon: "❄️" },
  { value: "SPRING", label: "Spring", icon: "🌸" },
  { value: "SUMMER", label: "Summer", icon: "☀️" },
  { value: "FALL", label: "Fall", icon: "🍂" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

const LOCAL_KEY = "zyni-bingo-cards";
const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

type Mode = "server" | "local";

function loadLocalCards(): BingoCard[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export default function BingoPage() {
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [mode, setMode] = useState<Mode>("server");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("WINTER");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [showHowTo, setShowHowTo] = useState(false);
  const [error, setError] = useState("");

  const persistLocal = useCallback((next: BingoCard[]) => {
    setCards(next);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/bingo");
      if (res.ok) {
        setMode("server");
        const data = await res.json();
        setCards(data.cards || []);
        setError("");
      } else if (res.status === 401) {
        setMode("local");
        setCards(loadLocalCards());
      } else {
        setError("Couldn't load your cards");
      }
    } catch {
      setError("Couldn't load your cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCards();
  }, [fetchCards]);

  const generateCard = async () => {
    setGenerating(true);
    setError("");
    try {
      if (mode === "server") {
        const res = await fetch("/api/bingo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ season: selectedSeason, year: selectedYear }),
        });
        if (res.ok) {
          const data = await res.json();
          const card: BingoCard = data.card;
          setCards((prev) => (prev.some((c) => c.id === card.id) ? prev : [card, ...prev]));
        } else if (res.status === 401) {
          setMode("local");
          addLocalCard();
        } else {
          setError("Couldn't generate card");
        }
      } else {
        addLocalCard();
      }
    } catch {
      setError("Couldn't generate card");
    } finally {
      setGenerating(false);
    }
  };

  const addLocalCard = () => {
    const squares = generateSquares();
    const card: BingoCard = {
      id: `local-${selectedSeason}-${selectedYear}-${Date.now()}`,
      title: `${seasonLabel(selectedSeason)} ${selectedYear} Anime Bingo`,
      season: selectedSeason,
      year: selectedYear,
      squares: JSON.stringify(squares),
      createdAt: new Date().toISOString(),
    };
    const next = loadLocalCards();
    if (next.some((c) => c.season === card.season && c.year === card.year)) {
      setError("You already have a card for this season!");
      return;
    }
    persistLocal([card, ...next]);
  };

  const deleteCard = async (cardId: string) => {
    if (mode === "local") {
      persistLocal(loadLocalCards().filter((c) => c.id !== cardId));
      return;
    }
    try {
      const res = await fetch(`/api/bingo/${cardId}`, { method: "DELETE" });
      if (res.ok) setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch {
      setError("Couldn't delete card");
    }
  };

  const updateCard = useCallback(
    (cardId: string, newSquares: BingoSquare[]) => {
      if (mode !== "local") return;
      persistLocal(loadLocalCards().map((c) => (c.id === cardId ? { ...c, squares: JSON.stringify(newSquares) } : c)));
    },
    [mode, persistLocal]
  );

  return (
    <div className="relative min-h-screen animate-page-in">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-50 blur-[120px]" style={{ background: "radial-gradient(45% 50% at 15% 10%, rgba(255,51,102,0.3), transparent 70%), radial-gradient(50% 50% at 85% 15%, rgba(0,255,255,0.3), transparent 70%), radial-gradient(40% 40% at 50% 90%, rgba(255,215,0,0.2), transparent 70%)" }} />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="console-label mb-3">✦ Mini Game · Season Tracker</p>
            <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">Anime Bingo 🎱</h1>
            <p className="mt-3 text-sm text-[var(--color-mute)]">Track your watching habits with bingo cards! Mark off squares as you complete challenges — finish a line to call BINGO!</p>
            <div className="mt-5 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowHowTo(!showHowTo)}
                className="rounded-xl border border-white/[0.09] bg-black/25 px-5 py-2.5 text-sm font-bold text-[var(--color-mute)] transition-colors hover:border-[#ff3366]/50 hover:text-white"
              >
                {showHowTo ? "Hide How to Play" : "❓ How to Play"}
              </motion.button>
              <span className="hidden items-center gap-1.5 rounded-full border border-[#00ffff]/30 bg-[#00ffff]/10 px-3 py-1.5 text-[11px] font-bold text-[#00ffff] sm:flex">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="inline-block">●</motion.span>
                {mode === "server" ? "Synced to account" : "Saved on this device"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[
              { icon: "🎱", color: "#ff3366" },
              { icon: "🎯", color: "#00ffff" },
              { icon: "🏆", color: "#ffd700" },
              { icon: "✨", color: "#00ff7c" },
            ].map((t, i) => (
              <motion.div
                key={t.icon}
                animate={{ y: [0, -8, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
                className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25 text-2xl sm:flex"
                style={{ boxShadow: `0 0 16px ${t.color}22`, color: t.color }}
              >
                {t.icon}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div initial={{ y: 12 }} animate={{ y: 0 }} className="group meme-card-border relative mt-6 overflow-hidden rounded-3xl bg-[#15121d]/90 p-6 backdrop-blur-sm sm:p-7">
              <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 20% 0%, rgba(255,51,102,0.14), transparent 55%)" }} />
              <div className="relative z-10">
                <p className="console-label mb-4">📋 How to Play</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    {[
                      "Select a season and year for your bingo card",
                      "Click on squares to mark them as completed",
                      "Complete a row, column, or diagonal for BINGO!",
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.07, ...spring }}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#ff3366] to-[#8a2be2] text-[10px] font-black text-white" style={{ boxShadow: "0 0 12px rgba(255,51,102,0.4)" }}>{i + 1}</span>
                        <span className="text-sm text-[var(--color-ink)]">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#ff7ad9]">Categories</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { label: "Anime Tropes", color: "#ff3366" },
                        { label: "Watch Patterns", color: "#00ffff" },
                        { label: "Community", color: "#ffd700" },
                        { label: "Discovery", color: "#8a2be2" },
                        { label: "Fun", color: "#00ff7c" },
                      ].map((c) => (
                        <motion.span key={c.label} whileHover={{ scale: 1.05 }} className="rounded-lg border px-2.5 py-1 font-semibold" style={{ borderColor: `${c.color}33`, background: `${c.color}10`, color: c.color }}>
                          {c.label}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group meme-card-border relative mt-6 overflow-hidden rounded-3xl bg-[#15121d]/90 p-5 backdrop-blur-sm sm:p-7">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 75% -10%, rgba(0,255,255,0.1), transparent 55%), radial-gradient(120% 120% at 10% 110%, rgba(255,51,102,0.12), transparent 55%)" }} />
        <div className="relative z-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="console-label mb-2">✨ Generate New Card</p>
              <p className="text-xs text-[var(--color-mute)]">One card per season — complete the 5×5 board</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Season</label>
                <div className="flex gap-1.5">
                  {SEASONS.map((s) => (
                    <motion.button
                      key={s.value}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedSeason(s.value)}
                      className={`relative rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${selectedSeason === s.value ? "text-black" : "border border-white/[0.07] bg-black/20 text-[var(--color-mute)] hover:text-white"}`}
                    >
                      {selectedSeason === s.value && (
                        <motion.span layoutId="season-pill" className="absolute inset-0 rounded-xl" transition={spring} style={{ background: "linear-gradient(90deg, #00ffff, #ff3366)", boxShadow: "0 0 18px rgba(0,255,255,0.35)" }} />
                      )}
                      <span className="relative z-10"><span className="mr-1">{s.icon}</span>{s.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-mute)]">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-xs font-bold text-white outline-none transition-colors focus:border-[#00ffff]/50"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="bg-[#15121d]">{y}</option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={generateCard}
                disabled={generating}
                className="rounded-xl px-6 py-2.5 text-sm font-black uppercase tracking-wider text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "linear-gradient(90deg, #00ffff, #ff3366)", boxShadow: "0 0 26px rgba(0,255,255,0.3)" }}
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="inline-block">◐</motion.span>
                    Rolling...
                  </span>
                ) : "Generate Card →"}
              </motion.button>
            </div>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-xs font-semibold text-[#ff5050]">
              ⚠ {error}
            </motion.p>
          )}
          {mode === "local" && (
            <p className="mt-3 text-[11px] text-[var(--color-mute)]">
              You&apos;re not signed in — cards save to this device only.{" "}
              <a href="/login" className="font-bold text-[#00ffff] hover:underline">Sign in</a> to sync them to your account.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#00ffff] to-[#ff3366]" />
        <h2 className="font-display text-xl font-black">Your Cards</h2>
        <motion.span key={cards.length} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={spring} className="rounded-full border border-white/[0.1] bg-black/25 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#00ffff]">
          {cards.length}
        </motion.span>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-3xl border border-white/[0.06] bg-[#15121d]/60 p-5">
              <div className="shimmer h-4 w-1/3 rounded" />
              <div className="shimmer h-2 w-full rounded" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, j) => (
                  <div key={j} className="shimmer aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-5 rounded-3xl border border-dashed border-white/[0.12] bg-black/20 p-12 text-center">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity }} className="inline-block text-4xl">🎱</motion.span>
          <p className="mt-3 text-sm font-bold text-[var(--color-ink)]">No bingo cards yet</p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">Generate your first card above!</p>
        </motion.div>
      ) : (
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {cards.map((card, i) => {
              let parsed: BingoSquare[] = [];
              try {
                parsed = JSON.parse(card.squares);
              } catch {
                // ignore
              }
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BingoCardComponent
                    id={card.id}
                    title={card.title}
                    season={card.season}
                    year={card.year}
                    squares={parsed}
                    onUpdate={(sq) => updateCard(card.id, sq)}
                    remote={mode === "server"}
                  />
                  <motion.button
                    whileHover={{ x: 3 }}
                    onClick={() => deleteCard(card.id)}
                    className="ml-2 mt-2 text-[10px] font-semibold text-[var(--color-mute)] transition-colors hover:text-[#ff5050]"
                  >
                    ✕ Delete card
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}