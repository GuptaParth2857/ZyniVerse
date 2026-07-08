"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getCharacter, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import type { CharacterFull } from "@/lib/anilist";

function stripHtml(str = "") { return str.replace(/<[^>]*>/g, ""); }

function formatBirthday(dob: { year?: number; month?: number; day?: number } | undefined) {
  if (!dob?.month && !dob?.day) return null;
  const d = new Date(2000, (dob.month || 1) - 1, dob.day || 1);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + (dob.year ? `, ${dob.year}` : "");
}

function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 55%, 50%)`;
}

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const [char, setChar] = useState<CharacterFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"anime" | "manga">("anime");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setChar(null);
    window.scrollTo(0, 0);
    getCharacter(id!)
      .then((d) => !cancelled && setChar(d))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  const accent = useMemo(() => hashColor(char?.name?.full), [char?.name?.full]);

  if (loading) return <Loader label="Loading character..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!char) return null;

  const mediaEdges = char.media?.edges || [];
  const animeRoles = mediaEdges.filter((e) => e.node.type === "ANIME");
  const mangaRoles = mediaEdges.filter((e) => e.node.type === "MANGA");
  const birthday = formatBirthday(char.dateOfBirth);
  const displayRoles = tab === "anime" ? animeRoles : mangaRoles;

  return (
    <div>
      {/* ── Hero ── */}
      <div className="relative min-h-[60vh] border-b border-[var(--color-line)] overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 40%, ${accent}33, transparent 70%)` }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 60%, ${accent}15, var(--color-void) 70%)` }} />

        <div className="relative z-10 mx-auto flex h-full min-h-[60vh] max-w-7xl items-center px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8 w-full">
            {/* Character Portrait */}
            <div className="shrink-0 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full opacity-40 blur-2xl" style={{ background: accent }} />
                <div className="relative h-56 w-56 sm:h-72 sm:w-72 overflow-hidden rounded-full border-4" style={{ borderColor: accent }}>
                  <Image
                    src={char.image?.large || ""}
                    alt={char.name?.full || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 224px, 288px"
                  />
                </div>
                {char.favourites != null && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-black/70 px-4 py-1 text-sm backdrop-blur border" style={{ borderColor: accent }}>
                    <span style={{ color: accent }}>♥</span>
                    <span className="font-bold font-mono" style={{ color: accent }}>{char.favourites.toLocaleString()}</span>
                    <span className="text-[var(--color-mute)] text-xs">favorites</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl font-bold sm:text-6xl drop-shadow-lg">{char.name?.full}</h1>
              {char.name?.native && <p className="mt-1 text-lg text-[var(--color-mute)]">{char.name.native}</p>}
              {char.name?.alternative && char.name.alternative.length > 0 && (
                <p className="mt-0.5 text-sm text-[var(--color-mute)]">aka {char.name.alternative.slice(0, 3).join(", ")}</p>
              )}

              {/* Bio */}
              {char.description && (
                <p className="mt-4 leading-relaxed text-sm text-[var(--color-mute)] line-clamp-4 whitespace-pre-line">
                  {stripHtml(char.description)}
                </p>
              )}

              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {char.gender && <StatCard accent={accent} label="Gender" value={char.gender} />}
                {char.age && <StatCard accent={accent} label="Age" value={char.age} />}
                {char.bloodType && <StatCard accent={accent} label="Blood Type" value={char.bloodType} />}
                {birthday && <StatCard accent={accent} label="Birthday" value={birthday} />}
              </div>

              {/* Anime/Manga Count */}
              <div className="mt-4 flex gap-3">
                <span className="text-sm text-[var(--color-mute)]">
                  <span style={{ color: accent }} className="font-bold">{animeRoles.length}</span> Anime
                </span>
                <span className="text-sm text-[var(--color-mute)]">
                  <span style={{ color: accent }} className="font-bold">{mangaRoles.length}</span> Manga
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      {animeRoles.length > 0 && mangaRoles.length > 0 && (
        <div className="border-b border-[var(--color-line)] bg-[var(--color-panel)] sticky top-0 z-20">
          <div className="mx-auto flex max-w-7xl px-4 sm:px-6">
            <button onClick={() => setTab("anime")}
              className={`relative px-6 py-3 text-sm font-semibold transition-colors ${tab === "anime" ? "text-[var(--color-ink)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}
            >
              Anime ({animeRoles.length})
              {tab === "anime" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
            </button>
            <button onClick={() => setTab("manga")}
              className={`relative px-6 py-3 text-sm font-semibold transition-colors ${tab === "manga" ? "text-[var(--color-ink)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"}`}
            >
              Manga ({mangaRoles.length})
              {tab === "manga" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Media Roles ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {displayRoles.length > 0 ? displayRoles.map((edge) => {
              const m = edge.node;
              const jpVA = edge.voiceActors?.[0];
              const enVA = edge.voiceActorRoles?.find((r) =>
                r.dubGroup?.toLowerCase().includes("english")
              )?.voiceActor;
              const mediaAccent = m.coverImage?.color || accent;
              return (
                <Link key={edge.id} href={`/${m.type?.toLowerCase()}/${m.id}`}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all group-hover:w-1.5" style={{ background: mediaAccent }} />

                  {/* Cover art */}
                  <div className="relative shrink-0 h-20 w-14 rounded-lg border border-[var(--color-line)] overflow-hidden">
                    <Image src={m.coverImage?.large || m.coverImage?.medium || ""} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{bestTitle(m.title)}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider rounded border border-[var(--color-line)] px-1.5 py-0.5" style={{ color: mediaAccent, borderColor: `${mediaAccent}44` }}>{edge.characterRole}</span>
                      {m.averageScore ? <span className="text-xs">★ {(m.averageScore / 10).toFixed(1)}</span> : null}
                      {m.format && <span className="text-[10px] text-[var(--color-mute)]">{m.format}</span>}
                      {m.type === "ANIME" && m.episodes ? <span className="text-[10px] text-[var(--color-mute)]">{m.episodes} ep</span> : null}
                      {m.type === "MANGA" && m.chapters ? <span className="text-[10px] text-[var(--color-mute)]">{m.chapters} ch</span> : null}
                      {m.startDate?.year && <span className="text-[10px] text-[var(--color-mute)]">{m.startDate.year}</span>}
                    </div>
                    <p className="text-[10px] text-[var(--color-mute)] mt-0.5">{m.status?.replace(/_/g, " ")}</p>
                  </div>

                  {/* VAs */}
                  <div className="hidden sm:flex items-center gap-3 shrink-0">
                    {jpVA && (
                      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-black/30 px-3 py-1.5">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                        <Image src={jpVA.image?.medium || ""} alt={jpVA.name?.full || ""}
                          fill className="object-cover" sizes="32px" />
                        </div>
                        <div className="text-right min-w-0 max-w-[100px]">
                          <p className="text-xs font-medium truncate">{jpVA.name?.full}</p>
                          <p className="text-[9px] text-[var(--color-mute)]">Japanese</p>
                        </div>
                      </div>
                    )}
                    {enVA && (
                      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-black/30 px-3 py-1.5">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                        <Image src={enVA.image?.medium || ""} alt={enVA.name?.full || ""}
                          fill className="object-cover" sizes="32px" />
                        </div>
                        <div className="text-right min-w-0 max-w-[100px]">
                          <p className="text-xs font-medium truncate">{enVA.name?.full}</p>
                          <p className="text-[9px] text-[var(--color-mute)]">English</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <span className="text-[var(--color-mute)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              );
            }) : (
              <p className="py-10 text-center text-sm text-[var(--color-mute)]">No {tab} appearances found.</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="https://www.crunchyroll.com/search?ref=zyniverse" target="_blank" rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F47521] to-[#f59e0b] px-3 py-1.5 text-[9px] font-bold text-black hover:opacity-90 transition-opacity"
          >▶ Watch on Crunchyroll</a>
          <a href="https://www.amazon.com/s?k=anime&tag=zyniverse-21" target="_blank" rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[9px] font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-all"
          >📦 Buy Anime on Amazon</a>
        </div>
        <div className="mt-4 text-center text-xs text-[var(--color-mute)]">
          Data from <a href={char.siteUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">AniList</a>.
        </div>
      </div>
    </div>
  );
}

function StatCard({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: "var(--color-line)" }}>
      <div className="text-sm font-bold font-mono" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] text-[var(--color-mute)] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}
