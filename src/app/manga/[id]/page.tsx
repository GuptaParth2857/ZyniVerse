"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMangaDetailFull, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { useWatchlist } from "@/components/WatchlistProvider";
import Carousel3D from "@/components/Carousel3D";
import { PageTransition } from "@/components/PageTransition";
import type { MediaMangaFull } from "@/lib/anilist";

function stripHtml(str = "") { return str.replace(/<[^>]*>/g, ""); }
function formatScore(score?: number) { return score ? (score / 10).toFixed(1) : "—"; }

export default function MangaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<MediaMangaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllStaff, setShowAllStaff] = useState(false);
  const { isSaved, toggle } = useWatchlist();

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setManga(null);
    window.scrollTo(0, 0);
    getMangaDetailFull(id!)
      .then((d) => !cancelled && setManga(d))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <Loader label="Loading manga details..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!manga) return null;

  const title = bestTitle(manga.title);
  const saved = isSaved(manga.id);
  const chars = manga.characters?.edges || [];
  const staffEdges = manga.staff?.edges || [];
  const links = (manga.externalLinks || []).filter((l) => !l.isDisabled);
  const relations = (manga.relations?.edges || []).filter(
    (e) => ["SEQUEL", "PREQUEL", "SIDE_STORY", "ALTERNATIVE", "SUMMARY", "ADAPTATION", "SOURCE"].includes(e.relationType)
  );
  const recs = manga.recommendations?.edges || [];
  const rankings = manga.rankings || [];
  const scoreDist = manga.stats?.scoreDistribution || [];

  return (
    <PageTransition><div>
      {/* Hero */}
      <div className="relative border-b border-[var(--color-line)]">
        {manga.bannerImage && (
          <div className="absolute inset-0">
            <img src={manga.bannerImage} alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/80 to-[var(--color-void)]/30" />
          </div>
        )}

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:px-6 sm:py-14">
          <div className="shrink-0">
            <img
              src={manga.coverImage?.extraLarge || manga.coverImage?.large}
              alt={title}
              className="h-64 w-44 rounded-xl border border-[var(--color-line)] object-cover shadow-2xl sm:h-80 sm:w-56"
            />
          </div>

          <div className="min-w-0 flex-1">
            {manga.status === "RELEASING" && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-[var(--color-violet)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-violet)] pulse-dot" /> Publishing
              </span>
            )}
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{title}</h1>
            {manga.title.native && <p className="mt-1 text-[var(--color-mute)]">{manga.title.native}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {manga.genres?.map((g) => (
                <Link key={g} href={`/search?genre=${g}&type=MANGA`}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-mute)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)] transition-colors"
                >{g}</Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-mute)]">
              {manga.averageScore ? (
                <span className="font-mono text-[var(--color-violet)]">★ {formatScore(manga.averageScore)}</span>
              ) : null}
              {manga.chapters ? <span>{manga.chapters} ch</span> : null}
              {manga.volumes ? <span>{manga.volumes} vol</span> : null}
              {manga.format ? <span className="text-[10px] uppercase">{manga.format}</span> : null}
              {manga.source ? <span className="text-[10px] uppercase">{manga.source.replace(/_/g, " ")}</span> : null}
              {manga.countryOfOrigin ? <span>{manga.countryOfOrigin}</span> : null}
              {manga.startDate?.year ? (
                <span>
                  {manga.startDate.year}
                  {manga.endDate?.year ? ` — ${manga.endDate.year}` : manga.status === "RELEASING" ? " — Present" : ""}
                </span>
              ) : null}
            </div>

            {manga.format && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded border border-[var(--color-line)] px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                  {manga.format}
                </span>
                {manga.isLicensed && (
                  <span className="rounded border border-[var(--color-violet)]/30 px-2 py-0.5 text-[10px] font-mono text-[var(--color-violet)]">
                    LICENSED
                  </span>
                )}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => toggle(manga as any)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  saved ? "bg-[var(--color-magenta)] text-black" : "border border-[var(--color-line)] hover:border-[var(--color-magenta)]"
                }`}
              >
                {saved ? "✓ Saved" : "+ Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12 min-w-0">
          {/* Story */}
          <section>
            <SectionTitle>Story</SectionTitle>
            <p className="leading-relaxed text-[var(--color-mute)] whitespace-pre-line">
              {stripHtml(manga.description) || "No description available."}
            </p>
          </section>

          {/* Rankings */}
          {rankings.length > 0 && (
            <section>
              <SectionTitle>Rankings</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rankings.slice(0, 6).map((r) => (
                  <div key={r.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3 text-center">
                    <div className="text-xl font-bold font-mono text-[var(--color-magenta)]">#{r.rank}</div>
                    <div className="text-[10px] text-[var(--color-mute)] mt-0.5 uppercase tracking-wider">
                      {r.context}{r.year ? ` (${r.year})` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Characters */}
          {chars.length > 0 && (
            <section>
              <SectionTitle>Characters</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {chars.slice(0, 20).map((edge) => (
                  <Link key={edge.node.id} href={`/character/${edge.node.id}`}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 hover:border-[var(--color-violet)]/30 transition-colors"
                  >
                    <img src={edge.node.image?.medium} alt={edge.node.name?.full}
                      className="h-8 w-8 rounded-full object-cover border border-[var(--color-line)]" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{edge.node.name?.full}</p>
                      <p className="text-[9px] text-[var(--color-mute)] truncate uppercase tracking-wider">{edge.role}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Staff (authors/artists) */}
          {staffEdges.length > 0 && (
            <section>
              <SectionTitle>
                Staff
                {staffEdges.length > 15 && (
                  <button onClick={() => setShowAllStaff((o) => !o)}
                    className="ml-auto text-[10px] font-mono text-[var(--color-mute)] hover:text-[var(--color-violet)] transition-colors"
                  >{showAllStaff ? "Show less" : `View all (${staffEdges.length})`}</button>
                )}
              </SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(showAllStaff ? staffEdges : staffEdges.slice(0, 15)).map((s, i) => (
                  <Link key={`${s.node.id}-${i}`} href={`/staff/${s.node.id}`}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 hover:border-[var(--color-violet)]/30 transition-colors"
                  >
                    <img src={s.node.image?.medium} alt={s.node.name?.full}
                      className="h-8 w-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{s.node.name?.full}</p>
                      <p className="text-[9px] text-[var(--color-mute)] truncate">{s.role}</p>
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
                accent="violet"
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
                accent="violet"
                hrefFn={(m) => m.type === "ANIME" ? `/anime/${m.id}` : `/manga/${m.id}`}
              />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* External Links */}
          {links.length > 0 && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-display text-sm font-bold mb-3">Official Sites</h3>
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded px-2 py-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-violet)]"
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

          {/* Score Distribution */}
          {scoreDist.length > 0 && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-display text-sm font-bold mb-3">Score Distribution</h3>
              <div className="space-y-1">
                {scoreDist.filter((s) => s.amount > 0).slice(0, 10).map((s) => (
                  <div key={s.score} className="flex items-center gap-2 text-[11px]">
                    <span className="w-4 text-right font-mono text-[var(--color-mute)]">{s.score * 10}%</span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-violet)]" style={{ width: `${Math.min(100, (s.amount / Math.max(...scoreDist.map((d) => d.amount))) * 100)}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[var(--color-mute)]">{s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {manga.favourites ? (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-center">
              <div className="text-2xl font-bold font-mono text-[var(--color-magenta)]">{manga.favourites.toLocaleString()}</div>
              <div className="text-xs text-[var(--color-mute)] mt-0.5">Favorites</div>
            </div>
          ) : null}

          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-xs text-[var(--color-mute)]">
            Data from <a href={manga.siteUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-violet)]">AniList</a>.
            {manga.idMal && <> Also on <a href={`https://myanimelist.net/manga/${manga.idMal}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-violet)]">MyAnimeList</a>.</>}
          </div>
        </aside>
      </div>
    </div></PageTransition>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
    <span className="h-4 w-1 rounded-full bg-[var(--color-violet)]" />
    {children}
  </h2>;
}
