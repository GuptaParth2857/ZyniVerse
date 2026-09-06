"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { logError } from "@/lib/logger";

interface Frame {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  category: string;
  unlockCondition: string | null;
  unlocked: boolean;
  userActive: boolean;
  unlockedAt: string | null;
}

const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
  rare: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  epic: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  legendary: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
};

export default function FrameSelector({
  frames: initialFrames,
  activeFrameId,
  userAvatar,
}: {
  frames: Frame[];
  activeFrameId: string | null;
  userAvatar: string | null;
}) {
  const [frames, setFrames] = useState(initialFrames);
  const [selected, setSelected] = useState<string | null>(activeFrameId);
  const [activating, setActivating] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function activate(frameId: string) {
    if (activating) return;
    setActivating(frameId);
    setError(null);
    try {
      const res = await fetch("/api/frames/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameId }),
      });
      if (res.ok) {
        setSelected(frameId);
        setFrames((prev) => prev.map((f) => ({ ...f, userActive: f.id === frameId })));
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to activate frame");
      }
    } catch (e) { logError(e); setError("Network error activating frame"); }
    setActivating(null);
  }

  async function unlock(frameId: string) {
    if (unlocking) return;
    setUnlocking(frameId);
    setError(null);
    try {
      const res = await fetch("/api/frames/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameId }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setFrames((prev) => prev.map((f) => (f.id === frameId ? { ...f, unlocked: true } : f)));
      } else {
        setError(d.error || "Failed to unlock frame");
      }
    } catch (e) { logError(e); setError("Network error unlocking frame"); }
    setUnlocking(null);
  }

  const previewFrame = frames.find((f) => f.id === selected) || frames.find((f) => f.id === activeFrameId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          {userAvatar ? (
            <Image src={userAvatar} alt="" fill className="rounded-full object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] text-2xl font-bold text-black">
              ?
            </div>
          )}
          {previewFrame && (
            <div className="absolute inset-0">
              <Image src={previewFrame.imageUrl} alt="" fill className="object-contain" sizes="96px" />
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-bold">Frame Preview</p>
          <p className="text-xs text-[var(--color-mute)]">
            {previewFrame ? previewFrame.name : "No frame selected"}
          </p>
          {selected && selected !== activeFrameId && (
            <button
              onClick={() => activate(selected)}
              disabled={activating === selected}
              className="mt-2 rounded-full bg-[var(--color-cyan)] px-4 py-1.5 text-[10px] font-bold text-black hover:opacity-90 disabled:opacity-50"
            >
              {activating === selected ? "Activating..." : "Activate"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {frames.map((frame) => {
          const colors = RARITY_COLORS[frame.rarity] || RARITY_COLORS.common;
          const isActive = frame.id === selected;

          return (
            <motion.button
              key={frame.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: frame.unlocked ? 1.05 : 1 }}
              onClick={() => frame.unlocked && setSelected(frame.id)}
              disabled={!frame.unlocked}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
                isActive
                  ? "border-[var(--color-cyan)] ring-2 ring-[var(--color-cyan)]/30"
                  : frame.unlocked
                    ? "border-[var(--color-line)] hover:border-[var(--color-cyan)]/50"
                    : "border-[var(--color-line)]/50 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="relative aspect-square">
                <Image src={frame.imageUrl} alt={frame.name} fill className="object-contain p-2" sizes="120px" />
              </div>
              <div className="p-2 text-center">
                <p className="text-[10px] font-bold line-clamp-1">{frame.name}</p>
                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {frame.rarity}
                </span>
              </div>
              {!frame.unlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60" onClick={(e) => e.stopPropagation()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <button
                    onClick={() => unlock(frame.id)}
                    disabled={unlocking === frame.id}
                    className="rounded-full bg-[var(--color-cyan)]/90 px-3 py-1 text-[9px] font-bold text-black hover:bg-[var(--color-cyan)] disabled:opacity-50"
                  >
                    {unlocking === frame.id ? "..." : "Unlock"}
                  </button>
                </div>
              )}
              {isActive && (
                <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-cyan)]">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {frames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm font-bold text-[var(--color-mute)]">No frames available</p>
        </div>
      )}
    </div>
  );
}
