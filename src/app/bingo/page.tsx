"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import BingoCardComponent from "@/components/BingoCard";

interface BingoCard {
  id: string;
  title: string;
  season: string;
  year: number;
  squares: string;
  createdAt: string;
}

const SEASONS = [
  { value: "WINTER", label: "Winter", icon: "\u{2744}\u{FE0F}" },
  { value: "SPRING", label: "Spring", icon: "\u{1F338}" },
  { value: "SUMMER", label: "Summer", icon: "\u{2600}\u{FE0F}" },
  { value: "FALL", label: "Fall", icon: "\u{1F342}" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

export default function BingoPage() {
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("WINTER");
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [showHowTo, setShowHowTo] = useState(false);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/bingo");
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch {
      // ignore
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
    try {
      const res = await fetch("/api/bingo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: selectedSeason, year: selectedYear }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card && !cards.find((c) => c.id === data.card.id)) {
          setCards((prev) => [data.card, ...prev]);
        }
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      const res = await fetch(`/api/bingo/${cardId}`, { method: "DELETE" });
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen animate-page-in">
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[var(--color-void)]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#ff3366]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#00ffff]/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-rgb-border rounded-xl h-12 w-12 flex items-center justify-center bg-[var(--color-panel)]/60 backdrop-blur-sm">
                  <span className="text-2xl">{"\u{1F3B2}"}</span>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff3366]" style={{ textShadow: "0 0 10px rgba(255,51,102,0.5)" }}>Mini Game</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-ink)]" style={{ textShadow: "0 0 30px rgba(255,51,102,0.3), 0 0 60px rgba(0,255,255,0.2)" }}>
                Anime <span className="text-[#ff3366]">Bingo</span>
              </h1>
              <p className="mt-3 text-base text-[var(--color-mute)] max-w-lg">
                Track your anime watching habits with bingo cards! Mark off squares as you complete challenges.
              </p>
            </div>
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="neon-rgb-border rounded-xl bg-[var(--color-panel)]/60 backdrop-blur-sm px-5 py-2.5 text-sm font-bold text-[var(--color-cyan)]"
            >
              {"\u{2753}"} How to Play
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff3366] to-transparent shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-6 mb-8"
          >
            <h2 className="font-display text-lg font-bold mb-3">{"\u{1F4CB}"} How to Play</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-[var(--color-mute)]">
              <div className="space-y-2">
                <p><span className="text-[var(--color-cyan)] font-bold">1.</span> Select a season and year for your bingo card</p>
                <p><span className="text-[var(--color-cyan)] font-bold">2.</span> Click on squares to mark them as completed</p>
                <p><span className="text-[var(--color-cyan)] font-bold">3.</span> Complete a row, column, or diagonal for BINGO!</p>
              </div>
              <div className="space-y-2">
                <p><span className="text-[var(--color-magenta)] font-bold">Categories:</span></p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ff336620", color: "#ff3366" }}>Anime Tropes</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#00ffff20", color: "#00ffff" }}>Watch Patterns</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#ffd70020", color: "#ffd700" }}>Community</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#8a2be220", color: "#8a2be2" }}>Discovery</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#00ff7f20", color: "#00ff7f" }}>Fun</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm p-5 mb-8">
          <h2 className="font-display text-lg font-bold mb-4">{"\u{2728}"} Generate New Card</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[10px] font-medium text-[var(--color-mute)] mb-1 block uppercase tracking-wider">Season</label>
              <div className="flex gap-1.5">
                {SEASONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSeason(s.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-all border ${
                      selectedSeason === s.value
                        ? "bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] text-black border-transparent shadow-lg"
                        : "bg-white/5 border-white/10 text-[var(--color-mute)] hover:border-white/20"
                    }`}
                  >
                    <span className="mr-1">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-[var(--color-mute)] mb-1 block uppercase tracking-wider">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs font-bold text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cyan)]/50"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateCard}
              disabled={generating}
              className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-cyan)]/20 transition-all disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Card"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[var(--color-cyan)] to-[var(--color-magenta)]" />
          <h2 className="text-xl font-display font-bold">Your Cards</h2>
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
            {cards.length}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 p-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 25 }).map((_, j) => (
                    <div key={j} className="aspect-square bg-white/5 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">{"\u{1F3B2}"}</div>
              <p className="text-sm text-[var(--color-mute)]">No bingo cards yet. Generate your first card above!</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <BingoCardComponent
                  id={card.id}
                  title={card.title}
                  season={card.season}
                  year={card.year}
                  squares={JSON.parse(card.squares)}
                />
                <button
                  onClick={() => deleteCard(card.id)}
                  className="mt-2 text-[10px] text-[var(--color-mute)] hover:text-red-400 transition-colors ml-2"
                >
                  Delete card
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
