"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface ThemeSong {
  id?: string;
  mediaId: number;
  type: "OP" | "ED";
  sequence: number;
  title: string;
  artist: string;
  composer?: string | null;
  episodeStart?: number | null;
  episodeEnd?: number | null;
  youtubeId?: string | null;
}

interface AnimeInfo {
  title: string;
  image: string | null;
}

const ANIME_TITLES: Record<number, string> = {
  21: "One Piece", 16498: "Attack on Titan", 1735: "Naruto Shippuden",
  5114: "Fullmetal Alchemist: Brotherhood", 1535: "Death Note",
  813: "Dragon Ball Z", 11061: "Fate/Zero", 113415: "Solo Leveling",
  101922: "Frieren: Beyond Journey's End", 127230: "Demon Slayer",
  30276: "Code Geass", 9253: "K-On!", 1: "Cowboy Bebop", 2001: "Steins;Gate",
  23755: "Jujutsu Kaisen", 24701: "Mashle", 28755: "Your Lie in April",
  31964: "Beastars", 34438: "Yuri on Ice", 37521: "Princess Connect! Re:Dive",
  11757: "Sword Art Online", 19815: "Kill la Kill", 20464: "Parasyte",
  21459: "No Game No Life", 21570: "Barakamon", 22319: "Dragon Ball Super",
  10087: "Guilty Crown", 23273: "Yuki Yuna is a Hero", 2904: "Madoka Magica",
  31240: "Kabaneri", 33352: "Idolmaster Cinderella Girls", 35760: "Your Lie in April",
  37991: "Interspecies Reviewers", 40748: "Chainsaw Man", 41467: "Blue Lock",
};

export default function ThemeDetailClient({ mediaId }: { mediaId: number }) {
  const [themes, setThemes] = useState<ThemeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo>({
    title: ANIME_TITLES[mediaId] || `Anime #${mediaId}`,
    image: null,
  });
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/themes/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setThemes(d.themes || []); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: `query ($id: Int) { Media(id: $id, type: ANIME) { title { romaji english } coverImage { large } bannerImage } }`,
        variables: { id: mediaId },
      }),
      signal: AbortSignal.timeout(5000),
    })
      .then((r) => r.json())
      .then((d) => {
        const m = d?.data?.Media;
        if (m) setAnimeInfo({
          title: m.title?.english || m.title?.romaji || ANIME_TITLES[mediaId],
          image: m.coverImage?.large || null,
        });
      })
      .catch(() => {});
  }, [mediaId]);

  const ops = themes.filter((t) => t.type === "OP");
  const eds = themes.filter((t) => t.type === "ED");
  const handlePlay = (key: string) => setPlaying(playing === key ? null : key);

  useEffect(() => {
    if (playing && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [playing]);

  const renderThemeList = (items: ThemeSong[], type: "OP" | "ED", color: string) => (
    <div className="space-y-2">
      {items.map((t) => {
        const key = `${t.type}-${t.sequence}`;
        const isPlaying = playing === key;
        return (
          <motion.div key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: t.sequence * 0.03 }}
          >
            <div className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 transition-all ${
              isPlaying
                ? "border-white/20 bg-white/5"
                : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
            }`}
              style={isPlaying ? { borderColor: `${color}50`, background: `${color}08` } : undefined}
            >
              <button onClick={() => handlePlay(key)}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110"
                style={{ background: `${color}15`, color }}
              >
                <span className="text-lg">{isPlaying ? "⏸" : "▶"}</span>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${color}15`, color }}>
                    {type} {t.sequence}
                  </span>
                  <p className="text-sm font-semibold truncate">{t.title}</p>
                </div>
                <p className="text-xs text-white/40 mt-0.5 truncate">
                  {t.artist}{t.composer ? ` · Composed by ${t.composer}` : ""}
                </p>
              </div>

              {(t.episodeStart || t.episodeEnd) && (
                <span className="text-[11px] text-white/30 whitespace-nowrap hidden sm:block font-mono">
                  Ep {t.episodeStart}{t.episodeEnd && t.episodeEnd !== t.episodeStart ? `\u2013${t.episodeEnd}` : ""}
                </span>
              )}

              {t.youtubeId ? (
                <a href={`https://www.youtube.com/watch?v=${t.youtubeId}`} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => { e.preventDefault(); handlePlay(key); }}
                  className="text-[11px] text-white/30 hover:text-white transition-colors shrink-0 px-2 py-1 rounded hover:bg-white/5">
                  YouTube
                </a>
              ) : (
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${t.title} ${t.artist} anime`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-white/20 hover:text-white/50 transition-colors shrink-0 px-2 py-1 rounded hover:bg-white/5">
                  Search
                </a>
              )}
            </div>

            <AnimatePresence>
              {isPlaying && t.youtubeId && (
                <motion.div ref={playerRef}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pl-6 sm:pl-13">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl"
                      style={{ boxShadow: `0 8px 32px ${color}20` }}>
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
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen">
        {/* Hero Banner */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          {animeInfo.image ? (
            <div className="absolute inset-0">
              <Image src={animeInfo.image} alt="" fill className="object-cover scale-110 blur-lg opacity-40" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[var(--color-bg)]" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-bg)]" />
          )}

          <div className="relative z-10 h-full flex items-end">
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 pb-6 flex items-end gap-5">
              {animeInfo.image && (
                <div className="relative w-24 h-36 sm:w-32 sm:h-44 rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-2xl">
                  <Image src={animeInfo.image} alt={animeInfo.title} fill className="object-cover" sizes="128px" />
                </div>
              )}
              <div className="min-w-0 pb-1">
                <Link href="/themes" className="text-xs text-white/40 hover:text-[var(--color-cyan)] transition-colors mb-2 inline-flex items-center gap-1">
                  <span className="text-[10px]">←</span> All Anime
                </Link>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-cyan)] mt-1">Theme Songs</p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-white">{animeInfo.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                  <span>{themes.length} themes</span>
                  {ops.length > 0 && <span className="text-[var(--color-cyan)]">{ops.length} openings</span>}
                  {eds.length > 0 && <span className="text-[var(--color-magenta)]">{eds.length} endings</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 animate-page-in">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse bg-[var(--color-panel)]" />
              ))}
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm">No theme songs found for this anime.</p>
              <Link href="/themes" className="text-xs text-[var(--color-cyan)] hover:underline mt-4 inline-block">
                Browse all anime →
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {ops.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-cyan)] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[var(--color-cyan)]/10 flex items-center justify-center text-[10px] font-mono">{ops.length}</span>
                    Openings
                  </h2>
                  {renderThemeList(ops, "OP", "#29f2e0")}
                </section>
              )}
              {eds.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-magenta)] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[var(--color-magenta)]/10 flex items-center justify-center text-[10px] font-mono">{eds.length}</span>
                    Endings
                  </h2>
                  {renderThemeList(eds, "ED", "#ff2d78")}
                </section>
              )}
            </div>
          )}

          <div className="mt-16 text-center pb-8">
            <Link href={`/anime/${mediaId}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold hover:border-[var(--color-cyan)] hover:bg-white/5 transition-all">
              View Anime Details →
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
