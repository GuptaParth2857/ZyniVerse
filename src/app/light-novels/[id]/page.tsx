"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getMangaDetailFull, bestTitle } from "@/lib/anilist";
import Loader, { ErrorState } from "@/components/Loader";
import { DynamicCarousel3D as Carousel3D } from "@/components/lazy";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import MangaProgress from "@/components/MangaProgress";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/manga";
import type { MediaMangaFull } from "@/lib/anilist";

function stripHtml(str = "") { return str.replace(/<[^>]*>/g, ""); }
function formatScore(score?: number) { return score ? (score / 10).toFixed(1) : "—"; }

interface LightNovelEntryDB {
  id: string;
  mediaId: number;
  title: string;
  coverImage: string | null;
  status: string;
  chapters: number;
  volumes: number;
  totalChapters: number | null;
  totalVolumes: number | null;
  score: number | null;
}

interface MangaChapterDB {
  id: string;
  chapter: number;
  title: string | null;
  read: boolean;
  readAt: string | null;
}

const STATUS_OPTIONS = ["READING", "COMPLETED", "PLANNING", "DROPPED", "PAUSED", "REREADING"];

export default function LightNovelDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [ln, setLn] = useState<MediaMangaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [entry, setEntry] = useState<LightNovelEntryDB | null>(null);
  const [chapters, setChapters] = useState<MangaChapterDB[]>([]);
  const [showChapters, setShowChapters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PLANNING");

  async function fetchEntry() {
    try {
      const res = await fetch(`/api/light-novels/list/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setEntry(data.entry);
    } catch {}
  }

  async function fetchChapters() {
    try {
      const res = await fetch(`/api/light-novels/chapters?mediaId=${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setChapters(data.chapters || []);
      setShowChapters(true);
    } catch {}
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null); setLn(null);
    window.scrollTo(0, 0);
    Promise.all([
      getMangaDetailFull(id!),
      fetch(`/api/light-novels/list/${id}`).then((r) => r.ok ? r.json() : { entry: null }).catch(() => ({ entry: null })),
    ])
      .then(([m, d]) => {
        if (!cancelled) {
          setLn(m);
          setEntry(d.entry || null);
          if (d.entry) {
            setShowChapters(true);
            fetchChapters();
          }
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  async function addToList(status: string) {
    if (!ln) return;
    try {
      const res = await fetch("/api/light-novels/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: ln.id,
          title: bestTitle(ln.title),
          coverImage: ln.coverImage?.extraLarge || ln.coverImage?.large,
          status,
          totalChapters: ln.chapters,
          totalVolumes: ln.volumes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEntry(data.entry);
        fetchChapters();
      }
    } catch (e) {
      console.error("Failed to add light novel", e);
    }
  }

  async function removeFromList() {
    try {
      const res = await fetch("/api/light-novels/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: Number(id) }),
      });
      if (res.ok) {
        setEntry(null);
        setChapters([]);
        setShowChapters(false);
      }
    } catch (e) {
      console.error("Failed to remove light novel", e);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      const res = await fetch(`/api/light-novels/list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setEntry(data.entry);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  }

  async function markChapter(chapter: number, read: boolean) {
    try {
      const res = await fetch("/api/light-novels/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: Number(id), chapter, read }),
      });
      if (res.ok) {
        fetchChapters();
        fetchEntry();
      }
    } catch (e) {
      console.error("Failed to mark chapter", e);
    }
  }

  function handleProgressUpdate(chapters: number, volumes: number) {
    setEntry((prev) => prev ? { ...prev, chapters, volumes } : prev);
  }

  if (loading) return <Loader label="Loading light novel details..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!ln) return null;

  const title = bestTitle(ln.title);
  const chars = ln.characters?.edges || [];
  const staffEdges = ln.staff?.edges || [];
  const links = (ln.externalLinks || []).filter((l) => !l.isDisabled);
  const relations = (ln.relations?.edges || []).filter(
    (e) => ["SEQUEL", "PREQUEL", "SIDE_STORY", "ALTERNATIVE", "SUMMARY", "ADAPTATION", "SOURCE"].includes(e.relationType)
  );
  const recs = ln.recommendations?.edges || [];
  const rankings = ln.rankings || [];
  const scoreDist = ln.stats?.scoreDistribution || [];

  return (
    <PageTransition><ErrorBoundary label="LightNovelDetails"><div>
      {/* Hero */}
      <div className="relative border-b border-[var(--color-line)]">
        {ln.bannerImage && (
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={ln.bannerImage} alt="" fill className="object-cover opacity-20" sizes="100vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/80 to-[var(--color-void)]/30" />
          </div>
        )}

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:px-6 sm:py-14">
          <div className="relative shrink-0 h-64 w-44 sm:h-80 sm:w-56 rounded-xl border border-[var(--color-line)] shadow-2xl overflow-hidden">
            <Image
              src={ln.coverImage?.extraLarge || ln.coverImage?.large || ""}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cyan)]/20 px-2.5 py-1 text-xs font-bold text-[var(--color-cyan)] uppercase tracking-wider">
              Light Novel
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl mt-2">{title}</h1>
            {ln.title.native && <p className="mt-1 text-[var(--color-mute)]">{ln.title.native}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {ln.genres?.map((g) => (
                <Link key={g} href={`/search?genre=${g}&type=MANGA`}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
                >{g}</Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--color-mute)]">
              {ln.averageScore ? (
                <span className="font-mono text-[var(--color-cyan)]">★ {formatScore(ln.averageScore)}</span>
              ) : null}
              {ln.chapters ? <span>{ln.chapters} ch</span> : null}
              {ln.volumes ? <span>{ln.volumes} vol</span> : null}
              {ln.source ? <span className="text-[10px] uppercase">{ln.source.replace(/_/g, " ")}</span> : null}
              {ln.countryOfOrigin ? <span>{ln.countryOfOrigin}</span> : null}
              {ln.startDate?.year ? (
                <span>
                  {ln.startDate.year}
                  {ln.endDate?.year ? ` — ${ln.endDate.year}` : ln.status === "RELEASING" ? " — Present" : ""}
                </span>
              ) : null}
            </div>

            {/* Add to List / Status selector */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {entry ? (
                <>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-black"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] || "var(--color-mute)" }}
                  >{STATUS_LABELS[entry.status] || entry.status}</span>
                  <select value={entry.status} onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs outline-none focus:border-[var(--color-cyan)]"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
                  </select>
                  <button onClick={removeFromList}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >Remove</button>
                  {entry && (
                    <span className="text-xs text-[var(--color-mute)]">
                      Ch: {entry.chapters}{entry.totalChapters ? `/${entry.totalChapters}` : ""}
                      {entry.volumes > 0 && ` | Vol: ${entry.volumes}${entry.totalVolumes ? `/${entry.totalVolumes}` : ""}`}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                    className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs outline-none focus:border-[var(--color-cyan)]"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
                  </select>
                  <button onClick={() => addToList(selectedStatus)}
                    className="rounded-full bg-[var(--color-cyan)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
                  >Add to My List</button>
                </>
              )}
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
              {stripHtml(ln.description) || "No description available."}
            </p>
          </section>

          {/* Chapter list */}
          {entry && showChapters && chapters.length > 0 && (
            <section>
              <SectionTitle>Chapter List</SectionTitle>
              <div className="rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] max-h-80 overflow-y-auto">
                {chapters.map((ch) => (
                  <button key={ch.id} onClick={() => markChapter(ch.chapter, !ch.read)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${
                      ch.read ? "opacity-50" : ""
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      ch.read ? "bg-cyan-500 border-cyan-500" : "border-[var(--color-line)]"
                    }`}>
                      {ch.read && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="font-mono text-xs text-[var(--color-mute)] w-12">Ch. {ch.chapter}</span>
                    <span className="flex-1 truncate">{ch.title || `Chapter ${ch.chapter}`}</span>
                    {ch.readAt && <span className="text-[10px] text-[var(--color-mute)]">{new Date(ch.readAt).toLocaleDateString()}</span>}
                  </button>
                ))}
              </div>
            </section>
          )}

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
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 hover:border-[var(--color-cyan)]/30 transition-colors"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[var(--color-line)] shrink-0">
                      <Image src={edge.node.image?.medium || ""} alt={edge.node.name?.full || ""} fill className="object-cover" sizes="32px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{edge.node.name?.full}</p>
                      <p className="text-[9px] text-[var(--color-mute)] truncate uppercase tracking-wider">{edge.role}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Staff */}
          {staffEdges.length > 0 && (
            <section>
              <SectionTitle>
                Staff
                {staffEdges.length > 15 && (
                  <button onClick={() => setShowAllStaff((o) => !o)}
                    className="ml-auto text-[10px] font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                  >{showAllStaff ? "Show less" : `View all (${staffEdges.length})`}</button>
                )}
              </SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(showAllStaff ? staffEdges : staffEdges.slice(0, 15)).map((s, i) => (
                  <Link key={`${s.node.id}-${i}`} href={`/staff/${s.node.id}`}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-2 hover:border-[var(--color-cyan)]/30 transition-colors"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                      <Image src={s.node.image?.medium || ""} alt={s.node.name?.full || ""} fill className="object-cover" sizes="32px" />
                    </div>
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
                accent="magenta"
                hrefFn={(item: {id: number; type?: string}) => item.type === "ANIME" ? `/anime/${item.id}` : `/manga/${item.id}`}
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
                hrefFn={(m: {id: number; type?: string}) => m.type === "ANIME" ? `/anime/${m.id}` : `/manga/${m.id}`}
              />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Progress (when added to list) */}
          {entry && (
            <MangaProgress
              mediaId={Number(id)}
              chapters={entry.chapters}
              volumes={entry.volumes}
              totalChapters={entry.totalChapters}
              totalVolumes={entry.totalVolumes}
              onUpdate={handleProgressUpdate}
            />
          )}

          {/* External Links */}
          {links.length > 0 && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-display text-sm font-bold mb-3">Official Sites</h3>
              <ul className="space-y-1">
                {links.map((l) => (
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

          {/* Score Distribution */}
          {scoreDist.length > 0 && (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <h3 className="font-display text-sm font-bold mb-3">Score Distribution</h3>
              <div className="space-y-1">
                {scoreDist.filter((s) => s.amount > 0).slice(0, 10).map((s) => (
                  <div key={s.score} className="flex items-center gap-2 text-[11px]">
                    <span className="w-4 text-right font-mono text-[var(--color-mute)]">{s.score * 10}%</span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--color-line)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--color-cyan)]" style={{ width: `${Math.min(100, (s.amount / Math.max(...scoreDist.map((d) => d.amount))) * 100)}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[var(--color-mute)]">{s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ln.favourites ? (
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-center">
              <div className="text-2xl font-bold font-mono text-[var(--color-magenta)]">{ln.favourites.toLocaleString()}</div>
              <div className="text-xs text-[var(--color-mute)] mt-0.5">Favorites</div>
            </div>
          ) : null}

          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-xs text-[var(--color-mute)]">
            Data from <a href={ln.siteUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">AniList</a>.
            {ln.idMal && <> Also on <a href={`https://myanimelist.net/manga/${ln.idMal}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">MyAnimeList</a>.</>}
          </div>
        </aside>
      </div>
    </div></ErrorBoundary></PageTransition>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
    <span className="h-4 w-1 rounded-full bg-[var(--color-cyan)]" />
    {children}
  </h2>;
}
