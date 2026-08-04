"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import MomentCard from "./MomentCard";
import { generateMomentPng } from "@/lib/moment-canvas";
import { logError } from "@/lib/logger";

interface MomentMakerProps {
  isOpen: boolean;
  onClose: () => void;
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  initialQuote?: string;
  initialCharacter?: string;
  initialEpisode?: string | number | null;
  initialTimestamp?: string | null;
}

const STYLES = ["classic", "neon", "minimal", "sakura", "dark"] as const;

const PROXY = "/api/proxy-image?url=";

function CoverImg({ src, className }: { src: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`${className} bg-gradient-to-br from-purple-800/40 to-cyan-800/40 flex items-center justify-center`}><span className="text-white/30 text-lg font-bold">?</span></div>;
  }
  return <Image src={`${PROXY}${encodeURIComponent(src)}`} alt="" width={40} height={56} className={className} onError={() => setFailed(true)} />;
}

function UserAvatar() {
  const { data: session } = useSession();
  const [failed, setFailed] = useState(false);
  const name = session?.user?.name || "U";
  const initial = name.charAt(0).toUpperCase();

  if (session?.user?.image && !failed) {
    return (
      <Image
        src={session.user.image}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover border border-white/20"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-black text-xs font-bold">
      {initial}
    </div>
  );
}

export default function MomentMaker({
  isOpen,
  onClose,
  animeId,
  animeTitle,
  animeCover,
  initialQuote = "",
  initialCharacter = "",
  initialEpisode = null,
  initialTimestamp = null,
}: MomentMakerProps) {
  const [quote, setQuote] = useState(initialQuote);
  const [character, setCharacter] = useState(initialCharacter);
  const [episode, setEpisode] = useState<string>(initialEpisode?.toString() || "");
  const [timestamp, setTimestamp] = useState(initialTimestamp || "");
  const [style, setStyle] = useState<string>("classic");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!quote.trim() || !character.trim()) return;
    setCapturing(true);
    try {
      const blob = await generateMomentPng({
        quote: quote.trim(),
        character: character.trim(),
        animeTitle,
        animeCover,
        episode: episode || null,
        timestamp: timestamp || null,
        style,
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `zyniverse-moment-${animeId}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      logError(err);
    } finally {
      setCapturing(false);
    }
  }, [quote, character, animeId, animeTitle, animeCover, episode, timestamp, style]);

  const handleSave = useCallback(async () => {
    if (!quote.trim() || !character.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user",
          animeId,
          animeTitle,
          animeCover,
          quote: quote.trim(),
          character: character.trim(),
          episode: episode || null,
          timestamp: timestamp || null,
          style,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || "Failed to save");
        return;
      }
      setSaved(true);
    } catch (err) {
      logError(err);
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  }, [quote, character, animeId, animeTitle, animeCover, episode, timestamp, style]);

  const handleShareTwitter = useCallback(() => {
    const text = `"${quote}" — ${character} (${animeTitle})`;
    const url = `https://zyverse.in/anime/${animeId}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
  }, [quote, character, animeTitle, animeId]);

  const handleShareWhatsApp = useCallback(() => {
    const text = `"${quote}" — ${character} (${animeTitle})\nhttps://zyverse.in/anime/${animeId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }, [quote, character, animeTitle, animeId]);

  const handleCopyLink = useCallback(() => {
    const text = `"${quote}" — ${character} (${animeTitle})\nhttps://zyverse.in/anime/${animeId}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [quote, character, animeTitle, animeId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl mx-auto rounded-2xl bg-[var(--color-panel)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto neon-rgb-border"
            onClick={(e) => e.stopPropagation()}
          >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[var(--color-panel)] z-10">
          <div className="flex items-center gap-3">
            <UserAvatar />
            <h2 className="font-display text-lg font-bold">
              <span className="bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
                Create Moment
              </span>
            </h2>
          </div>
          <button onClick={onClose} className="text-sm text-[var(--color-mute)] hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-white/5">
            Close ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-5">
          {/* LEFT: Form */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Anime info */}
            <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/30 p-4">
              {animeCover && <CoverImg src={animeCover} className="h-14 w-10 rounded-lg object-cover shrink-0" />}
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-mute)] uppercase tracking-wider font-medium">Anime</p>
                <p className="text-sm font-bold text-[var(--color-ink)] truncate">{animeTitle}</p>
              </div>
            </div>

            {/* Quote */}
            <div className="neon-rgb-border rounded-xl">
              <div className="m-[1px] rounded-[11px] bg-[var(--color-void)]">
                <div className="px-4 py-3">
                  <label className="block text-xs font-medium text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">Quote *</label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={4}
                    placeholder="Enter the quote..."
                    className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none resize-none border-0 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Character + Episode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="neon-rgb-border rounded-xl">
                <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                  <label className="block text-xs font-medium text-[var(--color-mute)] mb-1 uppercase tracking-wider">Character *</label>
                  <input
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    placeholder="Character name"
                    className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none border-0 p-0"
                  />
                </div>
              </div>
              <div className="neon-rgb-border rounded-xl">
                <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                  <label className="block text-xs font-medium text-[var(--color-mute)] mb-1 uppercase tracking-wider">Episode</label>
                  <input
                    value={episode}
                    onChange={(e) => setEpisode(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none border-0 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="neon-rgb-border rounded-xl">
              <div className="m-[1px] rounded-[11px] bg-[var(--color-void)] p-4">
                <label className="block text-xs font-medium text-[var(--color-mute)] mb-1 uppercase tracking-wider">
                  Timestamp <span className="text-[10px] font-normal normal-case opacity-50">(optional)</span>
                </label>
                <input
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="e.g. 12:30"
                  className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none border-0 p-0"
                />
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-mute)] mb-2 uppercase tracking-wider">Card Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`neon-rgb-border rounded-xl px-4 py-2 text-xs font-semibold transition-all capitalize ${
                      style === s ? "text-white" : "text-[var(--color-mute)]"
                    }`}
                  >
                    <span className="m-[1px] rounded-[11px] block px-1 py-0.5">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              {saveError && <p className="text-xs text-red-400">{saveError}</p>}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || saved || !quote.trim() || !character.trim()}
                  className="rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saved ? "✓ Saved!" : saving ? "Saving..." : "Save to Gallery"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={capturing || !quote.trim() || !character.trim()}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {capturing ? "Generating..." : "Download PNG"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleShareTwitter} disabled={!quote.trim() || !character.trim()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Twitter/X</button>
                <button onClick={handleShareWhatsApp} disabled={!quote.trim() || !character.trim()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">WhatsApp</button>
                <button onClick={handleCopyLink} disabled={!quote.trim() || !character.trim()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {copied ? "✓ Copied!" : "Copy Text"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="shrink-0 flex items-start justify-center lg:pt-8">
            <div className="w-[300px] max-w-full rounded-xl overflow-hidden shadow-2xl">
              <MomentCard
                quote={quote || "Your quote will appear here"}
                character={character || "Character Name"}
                animeTitle={animeTitle}
                animeCover={animeCover}
                episode={episode || null}
                timestamp={timestamp || null}
                animeId={animeId}
                style={style}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
