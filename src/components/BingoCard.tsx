"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkWin, type BingoSquare } from "@/lib/bingo";

interface BingoCardProps {
  id: string;
  title: string;
  season: string;
  year: number;
  squares: BingoSquare[];
  onUpdate?: (squares: BingoSquare[]) => void;
  remote?: boolean;
}

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

function Confetti() {
  const colors = ["#ff3366", "#00ffff", "#ffd700", "#8a2be2", "#00ff7c"];
  const pieces = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const c = colors[i % colors.length];
        const angle = (i / pieces.length) * Math.PI * 2;
        const dist = 70 + ((i * 37) % 70);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{ x, y, opacity: 0, scale: 1, rotate: i * 47 }}
            transition={{ duration: 1.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
            style={{ background: c, boxShadow: `0 0 10px ${c}` }}
          />
        );
      })}
    </div>
  );
}

export default function BingoCardComponent({ id, title, season, year, squares: initialSquares, onUpdate, remote = true }: BingoCardProps) {
  const [squares, setSquares] = useState<BingoSquare[]>(initialSquares);
  const [showBingo, setShowBingo] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const bingoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedCount = squares.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / 25) * 100);
  const savedLines = useMemo(() => checkWin(squares), [squares]);
  const winningIndexes = useMemo(() => new Set(savedLines.flat()), [savedLines]);

  const toggleSquare = useCallback(async (index: number) => {
    if (index === 12) return;
    const square = squares.find((s) => s.index === index);
    if (!square) return;

    const next = squares.map((s) => (s.index === index ? { ...s, completed: !s.completed } : s));
    const newLines = checkWin(next);

    if (newLines.length > savedLines.length) {
      if (bingoTimer.current) clearTimeout(bingoTimer.current);
      setShowBingo(true);
      bingoTimer.current = setTimeout(() => setShowBingo(false), 3200);
    } else if (newLines.length === 0) {
      setShowBingo(false);
    }

    setSquares(next);
    onUpdate?.(next);

    if (remote) {
      fetch(`/api/bingo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squares: [{ index, completed: next.find((s) => s.index === index)?.completed }] }),
      }).catch(() => {});
    }
  }, [squares, savedLines.length, id, remote, onUpdate]);

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
    <div className="group relative">
      <AnimatePresence>
        {showBingo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-3xl bg-black/85 backdrop-blur-md"
          >
            <Confetti />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="relative text-center"
            >
              <motion.div
                animate={{ textShadow: ["0 0 20px rgba(0,255,224,0.6)", "0 0 45px rgba(255,61,140,0.9)", "0 0 20px rgba(0,255,224,0.6)"] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="bg-gradient-to-r from-[#00ffe0] via-[#ff3d8c] to-[#ffd700] bg-clip-text font-display text-6xl font-black text-transparent"
              >
                BINGO!
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ...spring }}
                className="mt-2 text-sm font-bold text-white/80"
              >
                {savedLines.length} line{savedLines.length !== 1 ? "s" : ""} completed! 🎉
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 80% -10%, rgba(255,51,102,0.16), transparent 55%), radial-gradient(120% 120% at 10% 110%, rgba(0,255,255,0.1), transparent 55%)" }} />

        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-display font-black text-[var(--color-ink)]">{title}</h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--color-cyan)]">
                  {season} {year}
                </span>
                {savedLines.length > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={spring}
                    className="rounded-full border border-[#ffd700]/30 bg-[#ffd700]/10 px-2 py-0.5 text-[9px] font-black text-[#ffd700]"
                  >
                    {savedLines.length} LINE{savedLines.length !== 1 ? "S" : ""} ✓
                  </motion.span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <motion.span
                key={completedCount}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                className="font-mono text-sm font-black tabular-nums text-[#00ffff]"
                style={{ textShadow: "0 0 14px rgba(0,255,255,0.35)" }}
              >
                {completedCount}<span className="text-[10px] text-[var(--color-mute)]">/25</span>
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareCard}
                className="relative rounded-lg border border-white/[0.08] bg-black/25 px-2.5 py-1.5 text-[10px] font-bold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)]"
              >
                {shareTooltip ? "✓ Copied!" : "Share"}
              </motion.button>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ff3366] via-[#8a2be2] to-[#00ffff]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ boxShadow: "0 0 12px rgba(41,242,224,0.3)" }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-mute)]">{progress}% complete</span>
            {progress === 100 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring} className="text-[10px] font-black text-[#00ff7c]">
                FULL BOARD! 🏆
              </motion.span>
            )}
          </div>
        </div>

        <div className="relative z-10 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {squares.map((square) => {
              const isWin = winningIndexes.has(square.index);
              const isFree = square.index === 12;
              return (
                <motion.button
                  key={square.index}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => toggleSquare(square.index)}
                  disabled={isFree}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg p-0.5 text-center transition-all duration-200 sm:rounded-xl ${
                    isFree ? "cursor-default" : "cursor-pointer"
                  }`}
                  style={{
                    background: square.completed
                      ? `linear-gradient(135deg, ${square.color}26, ${square.color}08)`
                      : "rgba(255,255,255,0.03)",
                    border: isWin && square.completed ? `1.5px solid ${square.color}88` : square.completed ? `1px solid ${square.color}55` : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: square.completed ? `0 0 18px ${square.color}33, inset 0 0 14px ${square.color}10` : undefined,
                  }}
                >
                  {square.completed && !isFree && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute right-0.5 top-0.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-black text-black sm:h-4 sm:w-4 sm:text-[9px]"
                      style={{ background: square.color, boxShadow: `0 0 10px ${square.color}88` }}
                    >
                      ✓
                    </motion.div>
                  )}
                  {isWin && square.completed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.15, 0.4, 0.15] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="pointer-events-none absolute inset-0 rounded-lg sm:rounded-xl"
                      style={{ background: `${square.color}22` }}
                    />
                  )}
                  <span
                    className={`relative z-10 leading-tight ${isFree ? "text-[10px] sm:text-sm font-black" : "text-[8px] sm:text-[10px] font-bold"} ${square.completed ? "opacity-100" : "opacity-60"}`}
                    style={{ color: isFree ? "#ffd700" : square.completed ? square.color : "var(--color-mute)" }}
                  >
                    {square.completed && !isFree ? "" : square.text}
                  </span>
                  <span className="relative z-10 mt-px hidden text-[6px] uppercase tracking-widest text-[var(--color-mute)]/60 sm:block" style={{ color: square.completed ? undefined : undefined }}>
                    {isFree ? "★" : square.category}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-30 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 award-sheen" />
      </div>
    </div>
  );
}