"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function TrailerModal({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  const ytId = url ? extractYouTubeId(url) : null;

  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [url, onClose]);

  useEffect(() => {
    if (!url) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [url]);

  return (
    <AnimatePresence>
      {url && ytId && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, y: 14 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 14 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`}
              className="w-full aspect-video rounded-xl shadow-2xl border border-[var(--color-line)]"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Trailer"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--color-mute)]/60">
                ZyniVerse · Trailer
              </span>
              <button
                onClick={onClose}
                className="text-sm text-white/70 hover:text-white px-3 py-1 rounded-full hover:bg-white/5 transition-all"
              >
                Close ✕
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
