"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

const typeAccent: Record<string, string> = {
  iconic: "#facc15",
  funny: "#4ade80",
  inspiring: "#60a5fa",
  sad: "#a78bfa",
  badass: "#f87171",
  romantic: "#f472b6",
};

const langLabels: Record<string, string> = {
  english: "EN",
  japanese: "JP",
  hindi: "HI",
  tamil: "TA",
  telugu: "TE",
};

export default function VoiceLineCard({ line, index = 0 }: { line: VoiceLine; index?: number }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(line.likes);
  const [likeBusy, setLikeBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [momentOpen, setMomentOpen] = useState(false);
  const [characterImage, setCharacterImage] = useState<string | null>(null);

  const accent = typeAccent[line.type] || "#00ffe0";

  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (momentOpen) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.015)`;
  }, [momentOpen]);

  const handlePointerLeave = useCallback(() => {
    if (momentOpen) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, [momentOpen]);

  function handleOpenMoment() {
    if (ref.current) {
      ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
    }
    setMomentOpen(true);
    if (!characterImage) {
      const params = new URLSearchParams();
      if (line.characterId) params.set("characterId", String(line.characterId));
      params.set("animeId", String(line.animeId));
      params.set("character", line.character);
      fetch(`/api/voice-lines/character-image?${params}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.image) setCharacterImage(d.image);
        })
        .catch(() => {});
    }
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/voice-lines/${line.id}/like`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) {
          setLiked(d.liked);
          setLikes(d.likes);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [line.id]);

  function handleShare() {
    const text = `"${line.line}" — ${line.character} (${line.animeTitle})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    const prevLiked = liked;
    const prevLikes = likes;
    setLiked(!prevLiked);
    setLikes((l) => (prevLiked ? l - 1 : l + 1));
    try {
      const res = await fetch(`/api/voice-lines/${line.id}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setLiked(prevLiked);
        setLikes(prevLikes);
        if (res.status === 401) {
          router.push("/login");
        }
        return;
      }
      setLiked(data.liked);
      setLikes(data.likes);
    } catch {
      setLiked(prevLiked);
      setLikes(prevLikes);
    } finally {
      setLikeBusy(false);
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min((index % 6) * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative overflow-hidden rounded-3xl meme-card-border bg-[#15121d]/85 backdrop-blur-xl"
      style={{ transition: "transform 0.2s ease-out, border-color 0.3s, box-shadow 0.3s" }}
    >
      {/* hairline shimmer on top edge */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px z-40 meme-hairline" />

      {/* QUOTE HEADER — accent aurora backdrop */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5" style={{ background: "#0a0910" }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 75% -10%, ${accent}1f, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${accent}0f, transparent 55%)`,
          }}
        />
        <div className="award-sheen" />

        {/* Top badges */}
        <div className="relative z-10 mb-3 flex flex-wrap items-center gap-1.5">
          <span className="h-1.5 w-8 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}88` }} />
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeColors[line.type] || "bg-white/10 text-[var(--color-mute)]"}`}>
            {line.type}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--color-mute)]">
              {langLabels[line.language] || line.language}
            </span>
            {line.language !== "english" && line.lineJapanese && (
              <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)] px-2 py-0.5 text-[10px] font-mono uppercase text-[var(--color-mute)]">
                JP
              </span>
            )}
          </span>
        </div>

        {/* Quote */}
        <Link href={`/voice-lines/${line.id}`} className="relative z-10 block no-underline">
          <div className="relative">
            <span
              className="pointer-events-none absolute -top-3 -left-2 select-none font-serif text-6xl leading-none opacity-20"
              style={{ color: accent }}
            >
              &quot;
            </span>
            <p className="relative pl-2 text-[15px] leading-relaxed italic text-[var(--color-ink)] sm:text-lg font-sans tracking-tight line-clamp-4">
              {line.line}
            </p>
          </div>
          {line.lineHindi && (
            <p className="mt-2 text-[13px] font-medium italic text-[var(--color-magenta)]">{line.lineHindi}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <span className="font-bold text-[var(--color-cyan)]">{line.character}</span>
            <span className="text-[var(--color-mute)]">·</span>
            <span className="text-[var(--color-mute)]">{line.animeTitle}</span>
          </div>
          {line.episode && (
            <p className="mt-1 font-mono text-[10px] text-[var(--color-mute)]">
              Ep. {line.episode}
              {line.timestamp && ` · ${line.timestamp}`}
            </p>
          )}
        </Link>
      </div>

      {/* BODY */}
      <div className="relative z-10 px-4 pt-3 pb-3 sm:px-5">
        <p className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.35em] text-[var(--color-cyan)]/80">
          ✦ Anime Dialogue
        </p>
        {line.context && (
          <p className="text-xs leading-relaxed text-[var(--color-mute)] line-clamp-2">{line.context}</p>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-[var(--color-line)] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-stretch gap-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/80 p-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            disabled={likeBusy}
            aria-label="Like"
            className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all disabled:opacity-60 ${
              liked
                ? "text-[var(--color-magenta)] bg-[var(--color-magenta)]/15 shadow-[0_0_18px_rgba(255,0,230,0.25)]"
                : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-magenta)]"
            }`}
          >
            <motion.svg
              key={liked ? "liked" : "unliked"}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </motion.svg>
            <motion.span
              key={likes}
              initial={{ y: 10, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className={`tabular-nums ${liked ? "text-[var(--color-magenta)]" : ""}`}
            >
              {likes}
            </motion.span>
          </motion.button>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 sm:px-3 py-2 text-[11px] font-semibold text-[var(--color-mute)] transition-all hover:bg-white/10 hover:text-[var(--color-cyan)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </motion.button>
          {line.animeId > 0 && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleOpenMoment}
              className="flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 sm:px-3 py-2 text-[11px] font-semibold text-[var(--color-mute)] transition-all hover:bg-white/10 hover:text-[var(--color-magenta)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="hidden sm:inline">Moment</span>
            </motion.button>
          )}
        </div>
      </div>

      <MomentMaker
        isOpen={momentOpen}
        onClose={() => setMomentOpen(false)}
        animeId={line.animeId}
        animeTitle={line.animeTitle}
        animeCover={characterImage}
        initialQuote={line.line}
        initialCharacter={line.character}
        initialEpisode={line.episode ?? null}
        initialTimestamp={line.timestamp ?? null}
      />
    </motion.div>
  );
}