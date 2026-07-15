"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LIVE_ACTION_ANIME, LIVE_ACTION_PLATFORMS, type LiveActionAnime } from "@/lib/live-action-anime";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";

function stripHtml(str = "") { return str.replace(/<[^>]*>/g, ""); }
function formatScore(score: number) { return score > 0 ? score.toFixed(1) : "—"; }

function PersonAvatar({ name, imageUrl, size = "md" }: { name: string; imageUrl?: string; size?: "sm" | "md" }) {
  const [imgError, setImgError] = useState(false);
  const px = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const text = size === "sm" ? "text-sm" : "text-base";
  const showImg = imageUrl && !imgError;
  return (
    <div className={`${px} rounded-full overflow-hidden border-2 border-[var(--color-line)] shrink-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-cyan)]/20`}>
      {showImg ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" loading="lazy" onError={() => setImgError(true)} />
      ) : (
        <span className={`${text} font-bold text-white/40`}>{name.charAt(0)}</span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: LiveActionAnime["status"] }) {
  const config = {
    available: { label: "Available Now", color: "#48BB78" },
    upcoming: { label: "Coming Soon", color: "#ED8936" },
    cancelled: { label: "Cancelled", color: "#E53E3E" },
  };
  const c = config[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur border"
      style={{ background: `${c.color}22`, color: c.color, borderColor: `${c.color}44` }}
    >
      <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

function PosterCard({ anime }: { anime: LiveActionAnime }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link href={`/live-action/${anime.id}`} className="shrink-0 w-[130px] sm:w-[150px] group/card">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300 group-hover/card:border-[var(--color-magenta)] group-hover/card:shadow-[0_0_30px_-8px_var(--color-magenta)]">
        {anime.posterUrl && !imgErr ? (
          <img src={anime.posterUrl} alt={anime.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" loading="lazy" onError={() => setImgErr(true)} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 flex items-center justify-center">
            <span className="text-3xl opacity-30">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-2 group-hover/card:translate-y-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
          <p className="font-display text-xs font-bold leading-tight line-clamp-2">{anime.title}</p>
        </div>
        {anime.rating > 0 && (
          <span className="absolute right-1.5 top-2 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[var(--color-cyan)] backdrop-blur">
            ★ {anime.rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function LiveActionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const anime = useMemo(() => LIVE_ACTION_ANIME.find((a) => a.id === id), [id]);

  const related = useMemo(() => {
    if (!anime) return [];
    return LIVE_ACTION_ANIME.filter(
      (a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g))
    ).slice(0, 10);
  }, [anime]);

  const sameSource = useMemo(() => {
    if (!anime) return [];
    return LIVE_ACTION_ANIME.filter((a) => a.id !== anime.id && a.basedOn === anime.basedOn);
  }, [anime]);

  if (!anime) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-2xl font-bold mb-2">Title Not Found</p>
          <p className="text-sm text-[var(--color-mute)] mb-6">This live-action entry doesn&apos;t exist.</p>
          <Link href="/live-action" className="rounded-lg bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-all">
            ← Back to Live Action
          </Link>
        </div>
      </PageTransition>
    );
  }

  const availablePlatforms = anime.platforms.filter((p) => p.available);
  const cast = anime.cast?.filter((c) => c.name !== "TBA") || [];
  const crew = anime.crew?.filter((c) => c.name !== "TBA") || [];
  const voiceActors = anime.voiceActors || [];
  const hasCastData = cast.length > 0 && cast[0].name !== "TBA";

  return (
    <PageTransition>
      <ErrorBoundary label="LiveActionDetail">
        <div>
          {/* ── Hero ── */}
          <div className="relative min-h-[50vh] sm:min-h-[70vh] flex items-end border-b border-[var(--color-line)] overflow-hidden">
            {/* Background poster as banner */}
            {anime.posterUrl && !posterError && (
              <div className="absolute inset-0">
                <div className="relative h-full w-full">
                  <img src={anime.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm scale-110" onError={() => setPosterError(true)} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/70 to-[var(--color-void)]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-void)]/80 via-transparent to-[var(--color-void)]/40" />
              </div>
            )}
            {(!anime.posterUrl || posterError) && (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-void)] via-[#0d0d1a] to-[#050510]" />
            )}

            {/* Content */}
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                {/* Cover */}
                <div className="shrink-0 mx-auto sm:mx-0 -mb-16 sm:-mb-20 z-20">
                  <div className="relative h-64 w-44 sm:h-80 sm:w-56">
                    {anime.posterUrl && !posterError ? (
                      <img
                        src={anime.posterUrl}
                        alt={anime.title}
                        className="absolute inset-0 h-full w-full rounded-xl border-2 border-[var(--color-magenta)]/30 object-cover shadow-2xl shadow-[var(--color-magenta)]/10"
                        onError={() => setPosterError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 rounded-xl border-2 border-[var(--color-magenta)]/30 bg-gradient-to-br from-[var(--color-cyan)]/20 to-[var(--color-magenta)]/20 flex items-center justify-center">
                        <span className="text-5xl opacity-30">🎬</span>
                      </div>
                    )}
                    {anime.rating > 0 && (
                      <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-magenta)] text-sm font-bold text-black shadow-lg">
                        {formatScore(anime.rating)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 pb-4 text-center sm:text-left">
                  <div className="mb-2 flex justify-center sm:justify-start">
                    <StatusBadge status={anime.status} />
                  </div>
                  <h1 className="font-display text-2xl font-bold leading-tight break-words sm:text-4xl lg:text-5xl drop-shadow-lg">
                    {anime.title}
                  </h1>
                  {anime.japaneseTitle && (
                    <p className="mt-1 text-[var(--color-mute)] text-lg">{anime.japaneseTitle}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-[var(--color-mute)]">
                    <span className="font-medium text-[var(--color-ink)]">{anime.type === "series" ? "Series" : "Movie"}</span>
                    {anime.episodes && <span>{anime.episodes} Episodes</span>}
                    {anime.seasons && <span>{anime.seasons} Season{anime.seasons > 1 ? "s" : ""}</span>}
                    <span>{anime.releaseYear}{anime.endYear ? `–${anime.endYear}` : ""}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                    {anime.genres.map((g) => (
                      <span key={g} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Streaming platforms */}
                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {availablePlatforms.length > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">Streaming On:</span>
                    )}
                    {availablePlatforms.map((p) => (
                      <a
                        key={p.name}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105"
                        style={{ background: `${p.logoColor}22`, color: p.logoColor, border: `1px solid ${p.logoColor}44` }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.logoColor }} />
                        {p.name}
                        <span className="text-[8px]">↗</span>
                      </a>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-3">
                    {availablePlatforms.length > 0 && (
                      <a
                        href={availablePlatforms[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full px-6 py-2.5 text-sm font-bold transition-all bg-[var(--color-magenta)] text-white hover:shadow-[0_0_25px_-5px_var(--color-magenta)]"
                      >
                        ▶ Watch on {availablePlatforms[0].name}
                      </a>
                    )}
                    {anime.trailerUrl && (
                      <a
                        href={anime.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-cyan)]/10 hover:border-[var(--color-cyan)] transition-all backdrop-blur"
                      >
                        ▶ Trailer
                      </a>
                    )}
                    <Link
                      href="/live-action"
                      className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/50 hover:text-white transition-all"
                    >
                      ← All Live-Action
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="border-b border-[var(--color-line)] bg-[var(--color-panel)]">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 text-sm sm:px-6">
              {anime.rating > 0 && (
                <span className="font-mono text-xs text-[var(--color-magenta)]">
                  ★ {anime.rating.toFixed(1)} rating
                </span>
              )}
              <span className="font-mono text-xs text-[var(--color-mute)]">
                ◎ #{anime.popularity} popularity
              </span>
              <span className="font-mono text-xs text-[var(--color-mute)]">
                {anime.type === "series" ? "📺 Series" : "🎬 Film"}
              </span>
              {anime.episodes && (
                <span className="font-mono text-xs text-[var(--color-mute)]">
                  {anime.episodes} episodes
                </span>
              )}
              <span className="font-mono text-xs text-[var(--color-mute)]">
                {anime.releaseYear}{anime.endYear ? `–${anime.endYear}` : ""}
              </span>
              {anime.languages.length > 0 && (
                <span className="font-mono text-xs text-[var(--color-cyan)]">
                  {anime.languages.join(" · ")}
                </span>
              )}
            </div>
          </div>

          {/* ── Main Layout ── */}
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
            {/* ── Left Column ── */}
            <div className="space-y-12 min-w-0">
              {/* Synopsis */}
              <section>
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
                  Synopsis
                </h2>
                <p className="leading-relaxed text-[var(--color-mute)] whitespace-pre-line text-[15px]">
                  {anime.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {anime.genres.map((g) => (
                    <span key={g} className="rounded-full bg-[var(--color-void)] px-2.5 py-1 text-[10px] text-[var(--color-mute)] border border-[var(--color-line)]">
                      {g}
                    </span>
                  ))}
                </div>
              </section>

              {/* Cast & Crew */}
              {hasCastData && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
                    Cast & Crew
                  </h2>
                  <div className="space-y-2">
                    {(showAllCast ? cast : cast.slice(0, 10)).map((c, i) => (
                      <div
                        key={`${c.name}-${i}`}
                        className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-magenta)]/40 transition-all group"
                      >
                        <PersonAvatar name={c.name} imageUrl={c.imageUrl} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-[11px] text-[var(--color-mute)]">{c.role}</p>
                        </div>
                        {i < 3 && (
                          <span className="shrink-0 rounded-full bg-[var(--color-magenta)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--color-magenta)]">
                            #{i + 1}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {cast.length > 10 && (
                    <button
                      onClick={() => setShowAllCast(!showAllCast)}
                      className="mt-3 text-xs font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                    >
                      {showAllCast ? "Show less" : `View all ${cast.length} cast members →`}
                    </button>
                  )}
                  {/* Crew */}
                  {crew.length > 0 && (
                    <>
                      <h3 className="font-display text-lg font-bold mt-8 mb-3 flex items-center gap-2">
                        <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
                        Crew
                      </h3>
                      <div className="space-y-2">
                        {(showAllCrew ? crew : crew.slice(0, 5)).map((c, i) => (
                          <div
                            key={`crew-${c.name}-${i}`}
                            className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-cyan)]/40 transition-all group"
                          >
                            <PersonAvatar name={c.name} imageUrl={c.imageUrl} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">{c.name}</p>
                              <p className="text-[11px] text-[var(--color-mute)]">{c.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {crew.length > 5 && (
                        <button
                          onClick={() => setShowAllCrew(!showAllCrew)}
                          className="mt-3 text-xs font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                        >
                          {showAllCrew ? "Show less" : `View all ${crew.length} crew members →`}
                        </button>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Voice Actors (original anime) */}
              {voiceActors.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
                    Original Voice Actors
                  </h2>
                  <p className="text-xs text-[var(--color-mute)] mb-3">Voice actors from the original anime</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {voiceActors.map((va, i) => (
                      <div key={`${va.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-cyan)]/40 transition-all">
                        <PersonAvatar name={va.name} imageUrl={va.imageUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{va.name}</p>
                          <p className="text-[10px] text-[var(--color-mute)] truncate">
                            <span className="text-[var(--color-cyan)]">{va.character}</span>
                            {" · "}{va.language}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Same Source Adaptations */}
              {sameSource.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-[var(--color-violet)]" />
                    Other Adaptations of {anime.basedOn.split(" by ")[0]}
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                    {sameSource.map((a) => (
                      <PosterCard key={a.id} anime={a} />
                    ))}
                  </div>
                </section>
              )}

              {/* More Like This */}
              {related.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
                    More Like This
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                    {related.map((a) => (
                      <PosterCard key={a.id} anime={a} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Right Column (Sidebar) ── */}
            <aside className="space-y-6">
              {/* Details */}
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                <h3 className="font-display text-sm font-bold mb-3">Details</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Type", value: anime.type === "series" ? "Series" : "Movie" },
                    anime.episodes ? { label: "Episodes", value: anime.episodes } : null,
                    anime.seasons ? { label: "Seasons", value: anime.seasons } : null,
                    { label: "Release", value: `${anime.releaseYear}${anime.endYear ? `–${anime.endYear}` : ""}` },
                    { label: "Status", value: anime.status.charAt(0).toUpperCase() + anime.status.slice(1) },
                    { label: "Rating", value: `★ ${formatScore(anime.rating)}`, color: "text-[var(--color-magenta)]" },
                    { label: "Popularity", value: `#${anime.popularity}`, color: "text-[var(--color-cyan)]" },
                    { label: "Languages", value: anime.languages.join(", ") },
                    { label: "Based On", value: anime.basedOn, small: true },
                  ].filter(Boolean).map((item) => item && (
                    <div key={item.label} className="flex justify-between items-start gap-2">
                      <span className="text-[var(--color-mute)] shrink-0">{item.label}</span>
                      <span className={`font-medium text-right ${item.color || ""} ${item.small ? "text-xs" : ""}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Where to Watch */}
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                <h3 className="font-display text-sm font-bold mb-3">Where to Watch</h3>
                <div className="space-y-2">
                  {LIVE_ACTION_PLATFORMS.map((p) => {
                    const pd = anime.platforms.find((ap) => ap.name === p.name);
                    const avail = pd?.available || false;
                    return (
                      <div
                        key={p.name}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-all"
                        style={{
                          borderColor: avail ? `${pd?.logoColor || p.logoColor}44` : "var(--color-line)",
                          background: avail ? `${pd?.logoColor || p.logoColor}08` : "transparent",
                          opacity: avail ? 1 : 0.4,
                        }}
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: `${pd?.logoColor || p.logoColor}22`, color: pd?.logoColor || p.logoColor }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{p.name}</p>
                          {pd?.subtitle && <p className="text-[10px] text-[var(--color-mute)] truncate">{pd.subtitle}</p>}
                        </div>
                        {avail && pd && (
                          <a href={pd.url} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-semibold hover:scale-105 transition-all"
                            style={{ background: `${pd.logoColor}22`, color: pd.logoColor }}
                          >Watch →</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Genres */}
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
                <h3 className="font-display text-sm font-bold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((g) => (
                    <span key={g} className="rounded-full border border-[var(--color-magenta)]/20 bg-[var(--color-magenta)]/5 px-3 py-1 text-xs text-[var(--color-magenta)]">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
                  <p className="text-2xl font-black font-mono text-[var(--color-magenta)]">
                    {formatScore(anime.rating)}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">Rating</p>
                </div>
                <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
                  <p className="text-2xl font-black font-mono text-[var(--color-cyan)]">#{anime.popularity}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">Popularity</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}
