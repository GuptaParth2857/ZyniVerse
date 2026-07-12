"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import CountdownChip from "@/components/CountdownChip";
import { useWatchlist } from "@/components/WatchlistProvider";
import { DynamicCarousel3D as Carousel3D } from "@/components/lazy";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import FillerGuide from "@/components/FillerGuide";
import ReviewsSection from "@/components/ReviewsSection";
import WhereToWatch from "@/components/WhereToWatch";
import EpisodeTracker from "@/components/EpisodeTracker";
import AffiliateLink from "@/components/AffiliateLink";
import AdBanner from "@/components/AdBanner";
import ForumDiscussionWidget from "@/components/ForumDiscussionWidget";
import ThemeSongsSection from "@/components/features/ThemeSongsSection";
import ScoreDistributionChart from "@/components/features/ScoreDistributionChart";
import UsersAlsoLiked from "@/components/features/UsersAlsoLiked";
import MetadataPanel from "@/components/MetadataPanel";
import TagVotePanel from "@/components/TagVotePanel";
import ShareButton from "@/components/ShareButton";
import MomentMaker from "@/components/MomentMaker";
import RecRelationships from "@/components/RecRelationships";
import DiscussionLinks from "@/components/DiscussionLinks";
import CharacterVoteWidget from "@/components/CharacterVoteWidget";
import type { MediaAnimeFull } from "@/lib/anilist";

const DUB_LANG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  English: { bg: "#3b82f622", text: "#3b82f6", border: "#3b82f644" },
  Hindi: { bg: "#ff993322", text: "#ff9933", border: "#ff993344" },
  Tamil: { bg: "#e84a5f22", text: "#e84a5f", border: "#e84a5f44" },
  Telugu: { bg: "#6c63ff22", text: "#6c63ff", border: "#6c63ff44" },
};

const SITE_COLOR: Record<string, string> = {
  Crunchyroll: "#ff8a00", Funimation: "#5b0bb5", HIDIVE: "#00b4e6",
  Netflix: "#e50914", "Amazon Prime Video": "#00a8e1", Hulu: "#1ce783",
  "Disney+": "#113cc2", "Apple TV": "#555555", "YouTube": "#ff0000",
};

function stripHtml(str = "") { return str.replace(/<[^>]*>/g, ""); }
function formatScore(score?: number) { return score ? (score / 10).toFixed(1) : "—"; }

export default function AnimeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<MediaAnimeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [momentMakerOpen, setMomentMakerOpen] = useState(false);
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [dubLangs, setDubLangs] = useState<string[] | null>(null);
  const { isSaved, toggle } = useWatchlist();

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setAnime(null);
    window.scrollTo(0, 0);
    getAnimeDetailFull(id!)
      .then((d) => {
        if (cancelled) return;
        setAnime(d);
        if (d.idMal) {
          fetch(`/api/anime-dub-status?malId=${d.idMal}`)
            .then((r) => r.json())
            .then((res) => { if (!cancelled && res.success) setDubLangs(res.available); })
            .catch(() => {});
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <Loader label="Loading details..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!anime) return null;

  const title = bestTitle(anime.title);
  const saved = isSaved(anime.id);
  const chars = anime.characters?.edges || [];
  const staffEdges = anime.staff?.edges || [];
  const links = (anime.externalLinks || []).filter((l) => !l.isDisabled);
  const streamingLinks = links.filter((l) => l.type === "STREAMING");
  const infoLinks = links.filter((l) => l.type !== "STREAMING");
  const relations = (anime.relations?.edges || []).filter(
    (e) => ["SEQUEL", "PREQUEL", "SIDE_STORY", "ALTERNATIVE", "SUMMARY", "ADAPTATION", "SOURCE"].includes(e.relationType)
  );
  const recs = anime.recommendations?.edges || [];
  const rankings = anime.rankings || [];
  const scoreDist = anime.stats?.scoreDistribution || [];

  const heroChar = chars[0]?.node;
  const heroCharImage = heroChar?.image?.large;
  const heroCharName = heroChar?.name?.full;

  return (
    <PageTransition><ErrorBoundary label="AnimeDetails"><div>
      {/* ── Hero ── */}
      <div className="relative min-h-[50vh] sm:min-h-[70vh] flex items-end border-b border-[var(--color-line)] overflow-hidden">
        {/* Background banner */}
        {anime.bannerImage && (
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={anime.bannerImage} alt="" fill className="object-cover opacity-25" sizes="100vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/70 to-[var(--color-void)]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-void)]/80 via-transparent to-[var(--color-void)]/40" />
          </div>
        )}

        {/* Character art — right side */}
        {heroCharImage && (
          <div className="absolute bottom-0 right-0 hidden lg:block pointer-events-none">
            <div className="relative h-[85vh] aspect-[2/3]">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-void)] via-transparent to-transparent z-10" />
              <Image
                src={heroCharImage}
                alt={heroCharName || ""}
                fill
                className="object-contain [mask-image:linear-gradient(to_left,black_50%,transparent_90%)]"
                sizes="50vw"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {/* Cover */}
            <div className="shrink-0 -mb-16 sm:-mb-20 z-20">
              <div className="relative h-64 w-44 sm:h-80 sm:w-56">
                <Image
                  src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
                  alt={title}
                  fill
                  className="rounded-xl border-2 border-[var(--color-magenta)]/30 object-cover shadow-2xl shadow-[var(--color-magenta)]/10"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {anime.averageScore ? (
                  <div className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-magenta)] text-sm font-bold text-black shadow-lg">
                    {formatScore(anime.averageScore)}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 pb-4">
              {anime.status === "RELEASING" && (
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-[var(--color-magenta)] backdrop-blur border border-[var(--color-magenta)]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] pulse-dot" /> On Air
                </span>
              )}
              <h1 className="font-display text-2xl font-bold leading-tight break-words sm:text-4xl lg:text-6xl drop-shadow-lg">{title}</h1>
              {anime.title.native && <p className="mt-1 text-[var(--color-mute)] text-lg">{anime.title.native}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--color-mute)]">
                {anime.episodes ? <span className="font-medium text-[var(--color-ink)]">{anime.episodes} Episodes</span> : null}
                {anime.seasonYear ? <span>{anime.season || ""} {anime.seasonYear}</span> : null}
                {anime.studios?.nodes?.[0] && (
                  <Link href={`/studio/${anime.studios.nodes[0].id}`}
                    className="hover:text-[var(--color-cyan)] transition-colors"
                  >{anime.studios.nodes[0].name}</Link>
                )}
                {anime.format && <span className="text-[10px] uppercase tracking-wider border border-[var(--color-line)] px-2 py-0.5 rounded">{anime.format}</span>}
                {anime.source && <span className="text-[10px] uppercase">{anime.source.replace(/_/g, " ")}</span>}
                {anime.duration ? <span>{anime.duration}m</span> : null}
              </div>

              {/* Genres */}
              <div className="mt-3 flex flex-wrap gap-2">
                {anime.genres?.map((g) => (
                  <Link key={g} href={`/search?genre=${g}`}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-[var(--color-magenta)] hover:text-black hover:border-[var(--color-magenta)] transition-all backdrop-blur"
                  >{g}</Link>
                ))}
              </div>

              {/* Dub Availability */}
              {dubLangs && dubLangs.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-mute)]">
                    Dubs Available
                  </span>
                  {dubLangs.map((lang) => {
                    const s = DUB_LANG_STYLES[lang] || { bg: "#88888822", text: "#888888", border: "#88888844" };
                    return (
                      <span key={lang}
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
                        style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                      >{lang}</span>
                    );
                  })}
                  {dubLangs.length === 0 && (
                    <span className="text-[10px] text-[var(--color-mute)]">No dub data found</span>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => toggle(anime as any)}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                    saved
                      ? "bg-[var(--color-magenta)] text-black shadow-[0_0_20px_-5px_var(--color-magenta)]"
                      : "border border-white/20 bg-white/10 text-white hover:bg-[var(--color-magenta)] hover:text-black hover:border-[var(--color-magenta)]"
                  }`}
                >
                  {saved ? "✓ Saved to List" : "+ Add to List"}
                </button>
                {anime.trailer?.site === "youtube" && (
                  <button onClick={() => setTrailerOpen(true)}
                    className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-cyan)]/10 hover:border-[var(--color-cyan)] transition-all backdrop-blur"
                  >▶ Trailer</button>
                )}
                <div className="flex items-center gap-2">
                  <ShareButton mediaId={anime.id} title={title} />
                </div>
                <button onClick={() => setMomentMakerOpen(true)}
                  className="rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/5 px-6 py-2.5 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-all backdrop-blur"
                >✦ Create Moment</button>
                <Link href={`/search?sort=TRENDING_DESC`}
                  className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/50 hover:text-white transition-all"
                >Discover More →</Link>
              </div>

              {anime.nextAiringEpisode && (
                <div className="mt-4"><CountdownChip target={anime.nextAiringEpisode} /></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Bar ── */}
      <div className="border-b border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 text-sm sm:px-6">
          {rankings.slice(0, 3).map((r) => (
            <span key={r.id} className="font-mono text-xs text-[var(--color-mute)]">
              <span className="text-[var(--color-magenta)]">#{r.rank}</span> {r.context}{r.year ? ` (${r.year})` : ""}
            </span>
          ))}
          {anime.favourites ? (
            <span className="font-mono text-xs text-[var(--color-mute)]">
              ♥ {anime.favourites.toLocaleString()} favorites
            </span>
          ) : null}
          {anime.popularity ? (
            <span className="font-mono text-xs text-[var(--color-mute)]">
              ◎ {anime.popularity.toLocaleString()} popularity
            </span>
          ) : null}
          {anime.meanScore ? (
            <span className="font-mono text-xs text-[var(--color-cyan)]">
              ◎ Mean: {formatScore(anime.meanScore)}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left Column ── */}
        <div className="space-y-12 min-w-0">
          {/* Synopsis */}
          <section>
            <SectionTitle>Synopsis</SectionTitle>
            <p className="leading-relaxed text-[var(--color-mute)] whitespace-pre-line text-[15px]">
              {stripHtml(anime.description) || "No description available."}
            </p>
            {anime.tags && anime.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {anime.tags.filter((t) => t.rank >= 60 && !t.isMediaSpoiler).slice(0, 10).map((t) => (
                  <span key={t.id} className="rounded-full bg-[var(--color-void)] px-2.5 py-1 text-[10px] text-[var(--color-mute)] border border-[var(--color-line)]">
                    {t.name}
                    {t.isAdult && <span className="ml-1 text-[var(--color-magenta)]">●</span>}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <span className="h-3 w-1 rounded-full bg-[var(--color-magenta)]" />
                Community Tags
              </h3>
              <TagVotePanel mediaId={anime.id} />
            </div>
          </section>

          {/* Characters */}
          {chars.length > 0 && (
            <section>
              <SectionTitle>Characters & Voice Actors</SectionTitle>
              <div className="space-y-2">
                {chars.slice(0, 25).map((edge) => {
                  const char = edge.node;
                  const jpVA = edge.voiceActors?.[0];
                  const enVA = edge.voiceActorRoles?.find((r) => r.dubGroup?.toLowerCase().includes("english"))?.voiceActor;
                  return (
                    <Link key={char.id} href={`/character/${char.id}`}
                      className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-magenta)]/40 transition-all group"
                    >
                      <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[var(--color-line)] group-hover:border-[var(--color-magenta)]/50 transition-colors shrink-0">
                        <Image src={char.image?.medium || ""} alt={char.name?.full || ""} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{char.name?.full}</p>
                        <p className="text-[11px] text-[var(--color-mute)]">{edge.role}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <CharacterVoteWidget characterId={char.id} mediaId={anime.id} characterName={char.name?.full || ""} characterImage={char.image?.medium || ""} />
                        {jpVA && (
                          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-black/30 px-3 py-1.5">
                            <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
                              <Image src={jpVA.image?.medium || ""} alt={jpVA.name?.full || ""} fill className="object-cover" sizes="28px" />
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium truncate max-w-[100px]">{jpVA.name?.full}</p>
                              <p className="text-[9px] text-[var(--color-mute)]">Japanese</p>
                            </div>
                          </div>
                        )}
                        {enVA && (
                          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-black/30 px-3 py-1.5">
                            <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
                              <Image src={enVA.image?.medium || ""} alt={enVA.name?.full || ""} fill className="object-cover" sizes="28px" />
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium truncate max-w-[100px]">{enVA.name?.full}</p>
                              <p className="text-[9px] text-[var(--color-mute)]">English</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {chars.length > 25 && (
                <p className="mt-3 text-center text-xs text-[var(--color-mute)]">+{chars.length - 25} more characters</p>
              )}
            </section>
          )}

          {/* Staff */}
          {staffEdges.length > 0 && (
            <section>
              <SectionTitle>
                Staff
                {staffEdges.length > 12 && (
                  <button onClick={() => setShowAllStaff((o) => !o)}
                    className="ml-auto text-[10px] font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                  >{showAllStaff ? "Show less" : `View all (${staffEdges.length})`}</button>
                )}
              </SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(showAllStaff ? staffEdges : staffEdges.slice(0, 12)).map((s, i) => (
                  <Link key={`${s.node.id}-${i}`} href={`/staff/${s.node.id}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-magenta)]/40 transition-all group"
                  >
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[var(--color-line)] group-hover:border-[var(--color-magenta)]/50 transition-colors shrink-0">
                      <Image src={s.node.image?.medium || ""} alt={s.node.name?.full || ""} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.node.name?.full}</p>
                      <p className="text-[10px] text-[var(--color-mute)]">{s.role}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Relations */}
          {relations.length > 0 && (
            <section>
              <SectionTitle>Related</SectionTitle>
              <Carousel3D
                items={relations.map((r) => ({
                  id: r.node.id, coverImage: r.node.coverImage, title: r.node.title,
                  averageScore: r.node.averageScore,
                  format: r.node.type === "ANIME" ? `${r.node.episodes || ""} ep` : `${r.node.chapters || ""} ch`,
                  type: r.node.type,
                }))}
                accent="magenta"
                hrefFn={(item) => item.type === "ANIME" ? `/anime/${item.id}` : `/manga/${item.id}`}
              />
            </section>
          )}

          {/* Recommendations */}
          {recs.length > 0 && (
            <section>
              <SectionTitle>You May Also Like</SectionTitle>
              <Carousel3D
                items={recs.map((e) => e.node.mediaRecommendation)}
                accent="magenta"
                hrefFn={(m) => m.type === "MANGA" ? `/manga/${m.id}` : `/anime/${m.id}`}
              />
            </section>
          )}

          {/* Reviews */}
          <ReviewsSection mediaId={anime.id} />
        </div>

        {/* ── Right Column (Sidebar) ── */}
        <aside className="space-y-6">
          {/* Episode Tracker */}
          {anime.episodes && (
            <EpisodeTracker mediaId={anime.id} totalEpisodes={anime.episodes} animeTitle={title} />
          )}

          {/* Filler Guide */}
          <FillerGuide anilistId={anime.id} animeTitle={title} />

          {/* Ad Placement */}
          <AdBanner placement="anime-detail" type="sidebar" />

          {/* Theme Songs */}
          <ThemeSongsSection mediaId={anime.id} />

          {/* Detailed Metadata */}
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h3 className="font-display text-sm font-bold mb-3">Details</h3>
            <MetadataPanel mediaId={anime.id} />
          </div>

          {/* Recommendation Relationships */}
          <RecRelationships mediaId={anime.id} />

          {/* Reddit Discussions */}
          <DiscussionLinks mediaId={anime.id} />

          {/* Users Also Liked */}
          <UsersAlsoLiked mediaId={anime.id} />

          {/* Forum Discussion */}
          <ForumDiscussionWidget animeId={anime.id} animeTitle={title} animeImage={anime.coverImage?.large || ""} />

          {/* Where to Watch */}
          <WhereToWatch streamingLinks={streamingLinks.map((l) => ({ site: l.site, url: l.url }))} title={title} />

          {/* Affiliate Links */}
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h3 className="font-display text-sm font-bold mb-3">Support Us</h3>
            <div className="space-y-2">
              <AffiliateLink partner="amazon" path="https://www.amazon.com/s?k=anime" className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)] transition-all">
                <span className="text-[10px] font-bold">📦</span>
                Buy on Amazon
              </AffiliateLink>
              <AffiliateLink partner="cdjapan" path="https://www.cdjapan.co.jp" className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)] transition-all">
                <span className="text-[10px] font-bold">💿</span>
                Buy Blu-ray on CDJapan
              </AffiliateLink>
              <AffiliateLink partner="playasia" path="https://www.play-asia.com" className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)]/40 hover:text-[var(--color-cyan)] transition-all">
                <span className="text-[10px] font-bold">🎮</span>
                Merch on PlayAsia
              </AffiliateLink>
            </div>
          </div>

          {/* Official Links */}
          {infoLinks.length > 0 && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-display text-sm font-bold mb-2">Official Sites</h3>
              <ul className="space-y-1">
                {infoLinks.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded px-2 py-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                    >
                      <span>{l.site}</span>
                      {l.notes && <span className="text-[9px] opacity-60">— {l.notes}</span>}
                      <span className="ml-auto">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rankings */}
          {rankings.length > 0 && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-display text-sm font-bold mb-3">Rankings</h3>
              <div className="space-y-2">
                {rankings.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-magenta)]/10 text-xs font-bold font-mono text-[var(--color-magenta)]">
                        #{r.rank}
                      </span>
                      <span className="text-xs text-[var(--color-mute)]">{r.context}</span>
                    </div>
                    {r.year && <span className="text-[10px] text-[var(--color-mute)]">{r.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Distribution */}
          <ScoreDistributionChart scoreDistribution={scoreDist} />

          {anime.favourites ? (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-center">
              <div className="text-2xl font-bold font-mono text-[var(--color-magenta)]">{anime.favourites.toLocaleString()}</div>
              <div className="text-xs text-[var(--color-mute)] mt-0.5">Favorites</div>
            </div>
          ) : null}

          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-xs text-[var(--color-mute)]">
            Data from <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">AniList</a>.
            {anime.idMal && <> Also on <a href={`https://myanimelist.net/anime/${anime.idMal}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">MyAnimeList</a>.</>}
          </div>
        </aside>
      </div>

      {/* ── Moment Maker ── */}
      <MomentMaker
        isOpen={momentMakerOpen}
        onClose={() => setMomentMakerOpen(false)}
        animeId={anime.id}
        animeTitle={title}
        animeCover={anime.coverImage?.extraLarge || anime.coverImage?.large}
      />

      {/* ── Trailer Modal ── */}
      {trailerOpen && anime.trailer?.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setTrailerOpen(false)}>
          <div className="relative w-full max-w-4xl mx-4 aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${anime.trailer.id}?autoplay=1&rel=0`}
              className="h-full w-full rounded-xl"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <button onClick={() => setTrailerOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm"
            >Close ✕</button>
          </div>
        </div>
      )}
    </div></ErrorBoundary></PageTransition>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
    <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
    {children}
  </h2>;
}
