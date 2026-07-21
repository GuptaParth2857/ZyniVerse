"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TITLE = "ZyniVerse";
const TAGLINE = "Discover. Track. Discuss.";

const letterVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.3 + i * 0.06,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

const taglineVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.8,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  const dismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(dismiss, 1500);
    return () => clearTimeout(timer);
  }, [dismiss]);

  if (!isMounted) return null;

  return (
    <AnimatePresence onExitComplete={() => setIsMounted(false)}>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={dismiss}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ background: "#0a0a0f", willChange: "opacity" }}
        >
          {/* Subtle animated glow orbs - hidden on mobile for performance */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                x: [0, -20, 0],
                y: [0, -10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full hidden md:block"
              style={{
                top: "20%",
                left: "10%",
                width: "40%",
                height: "40%",
                background: "radial-gradient(circle, rgba(255,45,120,0.08), transparent 70%)",
                filter: "blur(40px)",
                willChange: "transform, opacity",
              }}
            />
            <motion.div
              animate={{
                opacity: [0.3, 0.7, 0.3],
                x: [0, 20, 0],
                y: [0, 10, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute rounded-full hidden md:block"
              style={{
                bottom: "20%",
                right: "10%",
                width: "40%",
                height: "40%",
                background: "radial-gradient(circle, rgba(138,92,255,0.08), transparent 70%)",
                filter: "blur(40px)",
                willChange: "transform, opacity",
              }}
            />
            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60%",
                height: "60%",
                background: "radial-gradient(circle, rgba(41,242,224,0.05), transparent 70%)",
                filter: "blur(30px)",
                willChange: "transform, opacity",
              }}
            />
          </div>

          {/* Text Content */}
          <div className="relative z-10 text-center pointer-events-none">
            <motion.div
              variants={glowVariants}
              animate="animate"
              className="absolute -inset-20 rounded-full pointer-events-none"
              style={{
                background: "rgba(255,45,120,0.08)",
                filter: "blur(60px)",
              }}
            />

            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4">
              {TITLE.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight"
                  style={{
                    color: "#f0eef8",
                    textShadow: "0 0 30px rgba(255,45,120,0.3), 0 0 60px rgba(138,92,255,0.15)",
                    willChange: "transform, opacity",
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              variants={taglineVariants}
              initial="hidden"
              animate="visible"
              className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase"
              style={{ color: "rgba(128, 123, 163, 0.9)" }}
            >
              {TAGLINE}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-mono pointer-events-none"
            style={{ color: "rgba(128, 123, 163, 0.4)" }}
          >
            Tap anywhere to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
