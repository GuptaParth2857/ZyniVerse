"use client";

import { useState } from "react";

export default function ShareGameResult({
  game,
  score,
  total,
  streak,
  label,
  text,
}: {
  game: string;
  score: string | number;
  total?: string | number;
  streak?: string | number;
  label?: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  const base = typeof window !== "undefined" ? window.location.origin : "https://zyverse.in";
  const params = new URLSearchParams({
    game,
    label: label || "Daily",
    score: String(score),
    user: "Me on ZyniVerse",
  });
  if (total) params.set("total", String(total));
  if (streak) params.set("streak", String(streak));
  const ogUrl = `${base}/api/og/game?${params.toString()}`;

  const shareText = text || `I scored ${score}${total ? `/${total}` : ""}${streak ? ` with a ${streak}-day streak` : ""} on ZyniVerse ${game}! Think you can beat me? 😤`;
  // WhatsApp pre-filled message that drops the share card image when available
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${ogUrl}\n\nPlay here: ${base}/quiz`) }`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366]/15 border border-[#25d366]/40 px-3 py-1.5 text-[11px] font-bold text-[#25d366] hover:bg-[#25d366]/25 transition-colors"
      >WhatsApp</a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText) }&url=${encodeURIComponent(base + "/quiz")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 px-3 py-1.5 text-[11px] font-bold text-cyan-300 hover:bg-cyan-400/15 transition-colors"
      >𝕏 / X</a>
      <button
        onClick={() => void copy()}
        className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
      >{copied ? "Copied ✓" : "Copy"}</button>
      <span className="text-[9px] text-[var(--color-mute)]">result card →</span>
    </div>
  );
}