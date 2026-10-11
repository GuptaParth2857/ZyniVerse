"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatorData {
  id: string;
  displayName: string | null;
  kofiUrl: string | null;
  buymeacoffeeUrl: string | null;
  upiId: string | null;
  user: { id: string; username: string; avatar: string | null };
}

export default function TipButton({ creator }: { creator: CreatorData }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ZyniVerse does not process payments itself, so a creator can only receive
  // support via a payment method they've configured. Hide the button otherwise.
  const hasPayment = Boolean(creator.kofiUrl || creator.buymeacoffeeUrl || creator.upiId);
  if (!hasPayment) return null;

  const name = creator.displayName || creator.user.username;

  const copyUpi = async () => {
    if (!creator.upiId) return;
    try {
      await navigator.clipboard.writeText(creator.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, nothing to do
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
      >
        Support Creator
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-[var(--color-panel)] border border-[var(--color-line)] p-6 sm:rounded-3xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Support {name}</h3>
                <button onClick={() => setOpen(false)} className="text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="mb-5 text-xs leading-relaxed text-[var(--color-mute)]">
                You pay {name} directly using the options below. ZyniVerse does not process payments.
              </p>

              <div className="space-y-2">
                {creator.upiId && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-green-400">UPI</span>
                      <span className="block truncate text-sm font-semibold text-[var(--color-ink)]">{creator.upiId}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <a
                        href={`upi://pay?pa=${encodeURIComponent(creator.upiId)}&pn=${encodeURIComponent(name)}`}
                        className="rounded-lg bg-green-500/15 px-3 py-1.5 text-[10px] font-bold text-green-400 hover:bg-green-500/25"
                      >
                        Pay
                      </a>
                      <button
                        onClick={copyUpi}
                        className="rounded-lg bg-green-500/15 px-3 py-1.5 text-[10px] font-bold text-green-400 hover:bg-green-500/25"
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </span>
                  </div>
                )}

                {creator.kofiUrl && (
                  <a
                    href={creator.kofiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 px-4 py-3 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10"
                  >
                    <span>Ko-fi</span>
                    <span aria-hidden>↗</span>
                  </a>
                )}

                {creator.buymeacoffeeUrl && (
                  <a
                    href={creator.buymeacoffeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <span>Buy Me a Coffee</span>
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
