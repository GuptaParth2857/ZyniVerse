"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin neon reading-progress bar pinned to the top of the viewport.
 * Springs follow scroll so it stays smooth even on fast jumps.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="scroll-progress fixed inset-x-0 top-0 z-[70] h-[3px] origin-left"
      style={{ scaleX }}
    />
  );
}