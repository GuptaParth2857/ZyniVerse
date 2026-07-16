"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InviteModalProps {
  partyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ partyId, isOpen, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/watch-party/${partyId}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Join my Watch Party on ZyniVerse! 🎬\n\n${inviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareTwitter() {
    const text = encodeURIComponent(`Join my anime Watch Party on ZyniVerse! 🎬🔥\n\n${inviteUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[20px] border border-[rgba(0,255,224,0.1)] bg-[rgba(18,17,30,0.95)] backdrop-blur-xl p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(0,255,224,0.08)] border border-[rgba(0,255,224,0.15)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffe0" strokeWidth="1.5">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-1">Invite Friends</h3>
              <p className="text-xs text-white/35">Share this link to invite others to your party</p>
            </div>

            <div className="flex items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] px-3 py-2.5 mb-4">
              <input readOnly value={inviteUrl} className="flex-1 bg-transparent text-xs text-white/60 outline-none truncate font-mono" />
              <button onClick={copyLink}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-[rgba(0,255,224,0.1)] text-[#00ffe0] border border-[rgba(0,255,224,0.2)] hover:bg-[rgba(0,255,224,0.2)]"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={shareWhatsApp}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(37,211,102,0.2)] bg-[rgba(37,211,102,0.05)] px-4 py-3 text-xs font-bold text-[#25d366] hover:bg-[rgba(37,211,102,0.1)] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
              <button onClick={shareTwitter}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs font-bold text-white/60 hover:bg-[rgba(255,255,255,0.06)] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
