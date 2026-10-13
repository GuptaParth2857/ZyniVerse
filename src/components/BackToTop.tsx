"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.5, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 14 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-cyan),var(--color-magenta),var(--color-violet))] text-white shadow-[0_0_22px_rgba(232,121,249,0.55)] transition-shadow hover:scale-110 hover:shadow-[0_0_34px_rgba(34,211,238,0.75)] sm:bottom-6 sm:right-6"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}