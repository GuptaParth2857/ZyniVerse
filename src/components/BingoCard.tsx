"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Square {
  index: number;
  text: string;
  category: string;
  color: string;
  completed: boolean;
}

interface BingoCardProps {
  id: string;
  title: string;
  season: string;
  year: number;
  squares: Square[];
  onUpdate?: (squares: Square[]) => void;
}

const WINNING_LINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function checkWin(squares: Square[]): number[][] {
  return WINNING_LINES.filter((line) => line.every((idx) => squares[idx].completed));
}

export default function BingoCardComponent({ id, title, season, year, squares: initialSquares, onUpdate }: BingoCardProps) {
  const [squares, setSquares] = useState<Square[]>(initialSquares);
  const [showBingo, setShowBingo] = useState(false);
  const [savedLines, setSavedLines] = useState<number[][]>(checkWin(initialSquares));
  const [shareTooltip, setShareTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const completedCount = squares.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / 25) * 100);

  const toggleSquare = useCallback(
    async (index: number) => {
      if (index === 12) return;

      setSquares((prev) => {
        const next = prev.map((s) => (s.index === index ? { ...s, completed: !s.completed } : s));
        const newLines = checkWin(next);
        if (newLines.length > savedLines.length) {
          setShowBingo(true);
          setTimeout(() => setShowBingo(false), 3000);
        }
        setSavedLines(newLines);
        onUpdate?.(next);

        fetch(`/api/bingo/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ squares: [{ index, completed: next.find((s) => s.index === index)?.completed }] }),
        });

        return next;
      });
    },
    [id, savedLines, onUpdate]
  );

  const shareCard = useCallback(() => {
    const emoji = squares.map((s) => (s.completed ? "\u{2B50}" : "\u{2B1C}")).join("");
    const grid = [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => emoji[r * 5 + c]).join("")).join("\n");
    const text = `Anime Bingo \u{2022} ${title}\n${grid}\n${completedCount}/25 squares \u{2022} ${progress}%`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  }, [squares, title, completedCount, progress]);

  return (
    <div className="relative" ref={cardRef}>
      <AnimatePresence>
        {showBingo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="text-center"
            >
              <div className="text-6xl font-display font-black bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] bg-clip-text text-transparent">
                BINGO!
              </div>
              <div className="text-sm text-[var(--color-mute)] mt-2">Line completed!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="neon-rgb-border rounded-2xl bg-[var(--color-panel)]/60 backdrop-blur-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-display font-bold">{title}</h3>
              <span className="text-[10px] font-mono text-[var(--color-mute)]">{season} {year}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[var(--color-cyan)]">{completedCount}/25</span>
              <button onClick={shareCard} className="relative rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] font-medium text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/30 transition-all">
                {shareTooltip ? "\u{2714} Copied!" : "Share"}
              </button>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] shadow-[0_0_12px_rgba(41,242,224,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-[var(--color-mute)]">{progress}% complete</span>
            {savedLines.length > 0 && (
              <span className="text-[9px] font-bold text-green-400">{savedLines.length} line{savedLines.length !== 1 ? "s" : ""}!</span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {squares.map((square) => (
              <motion.button
                key={square.index}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSquare(square.index)}
                disabled={square.index === 12}
                className={`relative aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-1 text-center transition-all duration-200 border ${
                  square.completed
                    ? "border-white/20 shadow-lg"
                    : "border-white/5 hover:border-white/15 hover:scale-[1.05]"
                } ${square.index === 12 ? "cursor-default" : "cursor-pointer"}`}
                style={{
                  backgroundColor: square.completed ? `${square.color}20` : "rgba(255,255,255,0.03)",
                  boxShadow: square.completed ? `0 0 20px ${square.color}30, inset 0 0 20px ${square.color}10` : undefined,
                }}
              >
                {square.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-lg sm:rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${square.color}15, ${square.color}05)`,
                      border: `1px solid ${square.color}40`,
                    }}
                  />
                )}
                <span className={`text-[8px] sm:text-[10px] font-bold leading-tight relative z-10 ${square.completed ? "opacity-100" : "opacity-70"}`} style={{ color: square.completed ? square.color : "var(--color-mute)" }}>
                  {square.text}
                </span>
                <span className="text-[7px] sm:text-[8px] text-[var(--color-mute)]/60 relative z-10 mt-0.5 hidden sm:block">
                  {square.category}
                </span>
                {square.completed && square.index !== 12 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[8px] sm:text-[10px] relative z-10">
                    {"\u{2713}"}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
