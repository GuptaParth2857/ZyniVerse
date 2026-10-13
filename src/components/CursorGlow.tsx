"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Neon cursor glow: a soft cyan core + wider magenta halo that follows the
 * pointer with spring physics. Mounted always; CSS media queries gate it to
 * fine pointers and reduced-motion-friendly users only (no JS state needed).
 */
export default function CursorGlow() {
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 380, damping: 38, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 380, damping: 38, mass: 0.6 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="cursor-glow"
      style={{ left: sx, top: sy }}
    >
      <div className="cursor-glow-core" />
      <div className="cursor-glow-halo" />
    </motion.div>
  );
}