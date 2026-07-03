"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("zyniverse_cookies");
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("zyniverse_cookies", "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("zyniverse_cookies", "rejected");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4"
        >
          <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/95 backdrop-blur-xl shadow-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-[var(--color-cyan)]/15 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2">
                  <path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5A10 10 0 0012 2z" />
                </svg>
              </div>
              <p className="text-xs text-[var(--color-mute)] leading-relaxed">
                We use cookies to enhance your experience. By continuing, you agree to our{" "}
                <Link href="/privacy" className="text-[var(--color-cyan)] hover:underline">Privacy Policy</Link>{" "}
                and{" "}
                <Link href="/terms" className="text-[var(--color-cyan)] hover:underline">Terms of Service</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={reject}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 transition-all"
              >Reject</button>
              <button onClick={accept}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--color-cyan)] text-black hover:opacity-90 transition-all shadow-lg shadow-[var(--color-cyan)]/30"
              >Accept All</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
