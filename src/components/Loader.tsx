import FluidNeonOrb from "./FluidNeonOrb";

export default function Loader({ label: _label }: { label?: string }) {
  return <FluidNeonOrb />;
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="aspect-[2/3] bg-white/[0.04]" />
      <div className="h-10 border-t border-white/5" />
    </div>
  );
}

import { motion } from "framer-motion";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] py-16 px-6 text-center overflow-hidden"
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Broken signal icon */}
      <div className="relative">
        <motion.svg
          width="56"
          height="56"
          viewBox="0 0 48 48"
          fill="none"
          stroke="var(--color-magenta)"
          strokeWidth="2"
          strokeLinecap="round"
          className="relative z-10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.path
            d="M6 34c4-4 8-6 12-6"
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M10 28c3-3 6-4.5 9-4.5"
            opacity="0.6"
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.path
            d="M14 22c2-2 4-3 6-3"
            opacity="0.3"
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
          <line x1="20" y1="40" x2="28" y2="32" strokeWidth="2" opacity="0.5" />
          <line x1="28" y1="40" x2="20" y2="32" strokeWidth="2" opacity="0.5" />
          <circle cx="24" cy="40" r="4" fill="var(--color-magenta)" stroke="none" opacity="0.3" />
        </motion.svg>
      </div>

      {/* Text */}
      <motion.p
        className="font-display text-xl text-[var(--color-magenta)]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        Signal lost
      </motion.p>
      <motion.p
        className="max-w-sm text-sm text-[var(--color-mute)] leading-relaxed"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        {message}
      </motion.p>

      {onRetry && (
        <motion.button
          onClick={onRetry}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative mt-1 overflow-hidden rounded-full border border-[var(--color-cyan)]/40 px-6 py-2.5 text-sm font-medium text-[var(--color-cyan)] transition-all"
        >
          <motion.span
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,229,255,0.1), transparent)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <span className="relative z-10 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Retry
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}
