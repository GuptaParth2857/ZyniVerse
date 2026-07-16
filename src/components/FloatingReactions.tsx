"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["🔥", "👍", "😂", "❤️", "😮", "💀", "😭", "🎉"];

interface FloatingReactionsProps {
  onReact: (emoji: string) => void;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

export default function FloatingReactions({ onReact }: FloatingReactionsProps) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const counterRef = useRef(0);

  const addReaction = useCallback((emoji: string) => {
    onReact(emoji);
    const id = `${Date.now()}-${counterRef.current++}`;
    const x = Math.random() * 60 + 20;
    setFloating((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((f) => f.id !== id));
    }, 2000);
  }, [onReact]);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 flex-wrap">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addReaction(emoji)}
            className="h-9 w-9 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-base hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)] hover:scale-110 active:scale-95 transition-all duration-200"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {floating.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 1, y: 0, x: `${f.x}%` }}
              animate={{ opacity: 0, y: -80 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute bottom-0 text-2xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
