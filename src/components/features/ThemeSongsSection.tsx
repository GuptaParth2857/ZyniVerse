"use client";

import { useEffect, useState } from "react";
import type { ThemeSong as ThemeSongType } from "@prisma/client";

interface Props {
  mediaId: number;
}

export default function ThemeSongsSection({ mediaId }: Props) {
  const [themes, setThemes] = useState<ThemeSongType[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-3">Theme Songs</h3>
      <div className="space-y-3">
        {ops.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-cyan)] mb-1.5">Openings</p>
            <div className="space-y-1.5">
              {ops.map((t) => (
                <div key={`${t.type}-${t.sequence}`} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded bg-[var(--color-cyan)]/10 flex items-center justify-center font-mono text-[10px] text-[var(--color-cyan)] shrink-0">
                    {t.sequence === 1 ? "1" : t.sequence === 2 ? "2" : t.sequence === 3 ? "3" : t.sequence === 4 ? "4" : t.sequence === 5 ? "5" : `${t.sequence}`}
                  </span>
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
                      className="text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
                    >▶</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {eds.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-magenta)] mb-1.5">Endings</p>
            <div className="space-y-1.5">
              {eds.map((t) => (
                <div key={`${t.type}-${t.sequence}`} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded bg-[var(--color-magenta)]/10 flex items-center justify-center font-mono text-[10px] text-[var(--color-magenta)] shrink-0">
                    {t.sequence === 1 ? "1" : t.sequence === 2 ? "2" : t.sequence === 3 ? "3" : t.sequence === 4 ? "4" : t.sequence === 5 ? "5" : `${t.sequence}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{t.title}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">{t.artist}{t.composer ? ` (composer: ${t.composer})` : ""}</p>
                  </div>
                  {(t.episodeStart || t.episodeEnd) && (
                    <span className="text-[10px] text-[var(--color-mute)] whitespace-nowrap">
                      Ep {t.episodeStart}{t.episodeEnd && t.episodeEnd !== t.episodeStart ? `-${t.episodeEnd}` : ""}
                    </span>
                  )}
                  {t.youtubeId && (
                    <a href={`https://www.youtube.com/watch?v=${t.youtubeId}`} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--color-mute)] hover:text-[var(--color-magenta)] transition-colors"
                    >▶</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
