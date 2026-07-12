"use client";

import { useState } from "react";
import Link from "next/link";
import type { VoiceLine } from "@/lib/voice-lines";
import MomentMaker from "./MomentMaker";

const typeColors: Record<string, string> = {
  iconic: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  funny: "bg-green-500/20 text-green-400 border-green-500/30",
  inspiring: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  sad: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  badass: "bg-red-500/20 text-red-400 border-red-500/30",
  romantic: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const langLabels: Record<string, string> = {
  english: "EN",
  japanese: "JP",
  hindi: "HI",
  tamil: "TA",
  telugu: "TE",
};

export default function VoiceLineCard({ line }: { line: VoiceLine }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(line.likes);
  const [copied, setCopied] = useState(false);
  const [momentOpen, setMomentOpen] = useState(false);

  function handleShare() {
    const text = `"${line.line}" — ${line.character} (${line.animeTitle})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleLike() {
    if (liked) {
      setLikes((l) => l - 1);
    } else {
      setLikes((l) => l + 1);
    }
    setLiked((l) => !l);
  }

  return (
    <div className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/voice-lines/${line.id}`} className="block">
        <p className="text-lg leading-relaxed italic text-[var(--color-ink)] before:content-['\201C'] before:mr-1 after:content-['\201D'] after:ml-1">
          {line.line}
        </p>
        {line.lineHindi && (
          <p className="mt-2 text-sm text-[var(--color-magenta)] italic">
            {line.lineHindi}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-bold text-[var(--color-cyan)]">{line.character}</span>
          <span className="text-[var(--color-mute)]">·</span>
          <span className="text-[var(--color-mute)]">{line.animeTitle}</span>
        </div>
        {line.context && (
          <p className="mt-1.5 text-xs text-[var(--color-mute)]">{line.context}</p>
        )}
        {line.episode && (
          <p className="mt-0.5 text-[10px] font-mono text-[var(--color-mute)]">
            Ep. {line.episode}
            {line.timestamp && ` · ${line.timestamp}`}
          </p>
        )}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--color-line)] pt-3">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeColors[line.type] || "bg-white/10 text-[var(--color-mute)]"}`}
        >
          {line.type}
        </span>
        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--color-mute)]">
          {langLabels[line.language] || line.language}
        </span>
        {line.language !== "english" && (
          <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--color-mute)]">
            {line.lineJapanese && "JP"}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 rounded-md px-4 py-2 text-xs transition-colors ${
              liked
                ? "text-red-400 bg-red-500/10"
                : "text-[var(--color-mute)] hover:text-red-400 hover:bg-red-500/5"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likes}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-md px-4 py-2 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-cyan-500/5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>
          {line.animeId > 0 && (
            <button
              onClick={() => setMomentOpen(true)}
              className="flex items-center gap-1 rounded-md px-4 py-2 text-xs text-[var(--color-magenta)] hover:text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              Moment
            </button>
          )}
        </div>
      </div>

      <MomentMaker
        isOpen={momentOpen}
        onClose={() => setMomentOpen(false)}
        animeId={line.animeId}
        animeTitle={line.animeTitle}
        initialQuote={line.line}
        initialCharacter={line.character}
        initialEpisode={line.episode ?? null}
        initialTimestamp={line.timestamp ?? null}
      />
    </div>
  );
}
