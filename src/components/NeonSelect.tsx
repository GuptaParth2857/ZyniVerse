"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Neon RGB shell — same as the /characters search bar */
export function NeonFilterShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative group va-search-shell ${className}`}>
      <div className="absolute -inset-1 rounded-2xl bg-[linear-gradient(135deg,#ff00e6,#29f2e0,#7000ff,#ff00e6)] bg-[length:300%_300%] opacity-30 group-focus-within:opacity-80 blur-[6px] transition-all duration-700 animate-neon-rgb pointer-events-none" />
      <div className="relative flex h-full items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/90 backdrop-blur-xl transition-all duration-300 group-focus-within:border-white/[0.18] group-focus-within:bg-[var(--color-panel)]">
        {children}
      </div>
    </div>
  );
}

export type NeonSelectOption = { value: string; label: string; badge?: string };

/* Custom dropdown — options styled like the neon-premium quote cards */
export function NeonSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  panelClassName = "",
  panelAlign = "left",
  variant = "neon",
}: {
  value: string;
  onChange: (v: string) => void;
  options: NeonSelectOption[];
  placeholder?: string;
  panelClassName?: string;
  panelAlign?: "left" | "right";
  variant?: "neon" | "plain";
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((p) => Math.min(options.length - 1, p + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((p) => Math.max(0, p - 1));
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        onChange(options[activeIdx].value);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, activeIdx, options, onChange]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {variant === "neon" ? (
        <NeonFilterShell>
          <button
            type="button"
            onClick={() => { setOpen((o) => !o); setActiveIdx(options.findIndex((o) => o.value === value)); }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-left text-[var(--color-ink)] outline-none"
          >
            <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
            <motion.svg
              animate={{ rotate: open ? 180 : 0 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="shrink-0 text-[var(--color-mute)]"
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>
        </NeonFilterShell>
      ) : (
        <div className="rgb-border rgb-border-always">
          <button
            type="button"
            onClick={() => { setOpen((o) => !o); setActiveIdx(options.findIndex((o) => o.value === value)); }}
            className="relative z-10 flex w-full max-w-[200px] cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-panel)] px-4 py-3 text-left text-sm text-[var(--color-ink)] outline-none"
          >
            <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
            <motion.svg
              animate={{ rotate: open ? 180 : 0 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="shrink-0 text-[var(--color-mute)]"
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`neon-premium top-full z-50 mt-2 rounded-2xl w-max min-w-[240px] max-w-[80vw] ${panelAlign === "right" ? "right-0" : "left-0"} ${panelClassName}`}
            style={{ position: "absolute" }}
          >
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
            <div className="neon-premium-content max-h-72 overflow-y-auto rounded-2xl p-1.5" style={{ scrollbarWidth: "thin" }}>
              {options.map((o, i) => {
                const isSel = o.value === value;
                const isAct = i === activeIdx;
                return (
                  <motion.button
                    key={o.value}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.2) }}
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`group relative flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm transition-colors ${
                      isSel ? "text-white" : isAct ? "text-white" : "text-[var(--color-mute)] hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all ${
                        isSel ? "opacity-100 shadow-[0_0_8px_rgba(255,45,120,0.9)] bg-[var(--color-magenta)]" : "opacity-0 bg-[var(--color-cyan)]"
                      }`}
                    />
                    <span
                      className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "linear-gradient(90deg, rgba(255,45,120,0.12), rgba(41,242,224,0.06), transparent)" }}
                    />
                    <span className="relative flex-1 truncate">{o.label}</span>
                    {o.badge && (
                      <span className="relative rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
                        {o.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
