"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ThemeSong as ThemeSongType } from "@prisma/client";

interface Props {
  mediaId: number;
}

export default function ThemeSongsSection({ mediaId }: Props) {
  const [themes, setThemes] = useState<ThemeSongType[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/themes/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setThemes(d.themes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <div className="animate-pulse h-20 rounded-xl bg-[var(--color-panel)]" />;
  if (themes.length === 0) return null;

  const ops = themes.filter((t) => t.type === "OP");
  const eds = themes.filter((t) => t.type === "ED");

  const handlePlay = (key: string) => setPlaying(playing === key ? null : key);

  const renderList = (items: ThemeSongType[], type: "OP" | "ED", color: string) => (
    <div className="space-y-1.5">
      {items.map((t) => {
        const key = `${t.type}-${t.sequence}`;
        const isPlaying = playing === key;
        return (
          <div key={key}>
            <div className="flex items-center gap-2 text-xs">
              <button onClick={() => t.youtubeId && handlePlay(key)}
                className="w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all"
                style={{ background: isPlaying ? `${color}25` : `${color}10`, color }}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{t.title}</p>
                <p className="text-[10px] text-[var(--color-mute)]">{t.artist}</p>
              </div>
              {(t.episodeStart || t.episodeEnd) && (
                <span className="text-[10px] text-[var(--color-mute)] whitespace-nowrap">
                  Ep {t.episodeStart}{t.episodeEnd && t.episodeEnd !== t.episodeStart ? `-${t.episodeEnd}` : ""}
                </span>
              )}
              {t.youtubeId && (
                <a href={`https://www.youtube.com/watch?v=${t.youtubeId}`} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => { e.preventDefault(); handlePlay(key); }}
                  className="text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
                >▶</a>
              )}
            </div>
            <AnimatePresence>
              {isPlaying && t.youtubeId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pl-8">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${t.youtubeId}?autoplay=1&rel=0`}
                        title={`${t.title} - ${t.artist}`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-3">Theme Songs</h3>
      <div className="space-y-3">
        {ops.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan)] mb-1.5">Openings</p>
            {renderList(ops, "OP", "#29f2e0")}
          </div>
        )}
        {eds.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-magenta)] mb-1.5">Endings</p>
            {renderList(eds, "ED", "#ff2d78")}
          </div>
        )}
      </div>
    </div>
  );
}
