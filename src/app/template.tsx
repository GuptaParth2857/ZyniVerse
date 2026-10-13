"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Runs on every route change (App Router template remounts per navigation),
 * giving each page a smooth fade + subtle rise-in instead of an abrupt swap.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 10, filter: reduce ? undefined : "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}