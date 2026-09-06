"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logError } from "@/lib/logger";

interface CreatorData {
  id: string;
  displayName: string | null;
  kofiUrl: string | null;
  buymeacoffeeUrl: string | null;
  upiId: string | null;
  user: { id: string; username: string; avatar: string | null };
}

const PRESETS = [50, 100, 200, 500];

export default function TipButton({ creator }: { creator: CreatorData }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  async function sendTip() {
    if (sending || finalAmount <= 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          amount: finalAmount,
          message: message.trim() || undefined,
          anonymous,
        }),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => { setOpen(false); setSent(false); setMessage(""); setAnonymous(false); setCustomAmount(""); }, 1500);
      }
    } catch (e) { logError(e); }
    setSending(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
      >
        Tip Creator
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
              {sent ? (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-3">✨</div>
                  <p className="text-lg font-bold text-[var(--color-cyan)]">Tip Sent!</p>
                  <p className="mt-1 text-sm text-[var(--color-mute)]">Thanks for supporting {creator.displayName || creator.user.username}</p>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">Tip {creator.displayName || creator.user.username}</h3>
                    <button onClick={() => setOpen(false)} className="text-[var(--color-mute)] hover:text-[var(--color-ink)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => { setAmount(p); setCustomAmount(""); }}
                        className={`rounded-xl border py-2.5 text-sm font-bold transition-colors ${
                          amount === p && !customAmount
                            ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                            : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50"
                        }`}
                      >
                        ₹{p}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none mb-4"
                  />

                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message (optional)"
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-ink)]/5 px-4 py-3 text-sm text-[var(--color-ink)] focus:border-[var(--color-cyan)] focus:outline-none mb-4"
                  />

                  <label className="flex items-center gap-2 mb-5 cursor-pointer">
                    <div
                      onClick={() => setAnonymous(!anonymous)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${anonymous ? "bg-[var(--color-cyan)]" : "bg-[var(--color-line)]"}`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${anonymous ? "left-4.5 translate-x-0" : "left-0.5"}`} />
                    </div>
                    <span className="text-xs text-[var(--color-mute)]">Send anonymously</span>
                  </label>

                  {(creator.kofiUrl || creator.buymeacoffeeUrl || creator.upiId) && (
                    <div className="mb-5 rounded-xl border border-[var(--color-line)]/60 bg-[var(--color-ink)]/3 p-3">
                      <p className="text-[10px] font-bold text-[var(--color-mute)] uppercase tracking-wider mb-2">Direct payment links</p>
                      <div className="flex flex-wrap gap-2">
                        {creator.upiId && (
                          <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold text-green-400">
                            UPI: {creator.upiId}
                          </span>
                        )}
                        {creator.kofiUrl && (
                          <a href={creator.kofiUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-bold text-[var(--color-cyan)] hover:opacity-80">
                            Ko-fi
                          </a>
                        )}
                        {creator.buymeacoffeeUrl && (
                          <a href={creator.buymeacoffeeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-400 hover:opacity-80">
                            Buy Me a Coffee
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={sendTip}
                    disabled={sending || finalAmount <= 0}
                    className="w-full rounded-xl bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] py-3 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {sending ? "Sending..." : `Tip ₹${finalAmount || 0}`}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
