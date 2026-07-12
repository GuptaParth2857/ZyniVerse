"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import MomentCard from "./MomentCard";

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    setQuote(initialQuote);
    setCharacter(initialCharacter);
    setEpisode(initialEpisode?.toString() || "");
    setTimestamp(initialTimestamp || "");
  }, [initialQuote, initialCharacter, initialEpisode, initialTimestamp]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `zyniverse-moment-${animeId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate moment image", err);
    } finally {
      setCapturing(false);
    }
  }, [animeId]);

  const handleShare = useCallback(() => {
    const text = `"${quote}" — ${character} (${animeTitle})`;
    const url = `https://zyverse.in/anime/${animeId}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
  }, [quote, character, animeTitle, animeId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl mx-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
          <h2 className="font-display text-lg font-bold">Create Moment</h2>
          <button
            onClick={onClose}
            className="text-sm text-[var(--color-mute)] hover:text-white transition-colors"
          >
            Close ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Left — Form */}
          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <label className="block text-xs font-medium text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">
                Quote
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={4}
                placeholder="Enter the quote..."
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">
                  Character
                </label>
                <input
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  placeholder="Character name"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">
                  Episode
                </label>
                <input
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">
                Timestamp <span className="text-[10px] font-normal normal-case opacity-50">(optional)</span>
              </label>
              <input
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="e.g. 12:30"
                className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-cyan)]"
              />
            </div>

            <div className="pt-4 border-t border-[var(--color-line)]">
              <p className="text-xs text-[var(--color-mute)] mb-3">
                Anime: <span className="text-[var(--color-ink)] font-medium">{animeTitle}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownload}
                  disabled={capturing || !quote.trim() || !character.trim()}
                  className="rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {capturing ? "Generating..." : "Download PNG"}
                </button>
                <button
                  onClick={handleShare}
                  disabled={!quote.trim() || !character.trim()}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Share on Twitter/X
                </button>
              </div>
            </div>
          </div>

          {/* Right — Live Preview */}
          <div className="shrink-0 flex items-start justify-center">
            <div className="rounded-xl border border-[var(--color-line)] overflow-hidden shadow-2xl scale-[0.6] origin-top-right lg:origin-top">
              <div ref={cardRef}>
                <MomentCard
                  quote={quote || "Your quote will appear here"}
                  character={character || "Character Name"}
                  animeTitle={animeTitle}
                  animeCover={animeCover}
                  episode={episode || null}
                  timestamp={timestamp || null}
                  animeId={animeId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
