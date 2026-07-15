import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import { getFillerForAnime } from "@/lib/filler";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const anime = await getAnimeDetailFull(id);
    const title = bestTitle(anime.title);
    const filler = await getFillerForAnime(anime.id, title);

    const total = filler?.total ?? anime.episodes ?? 0;
    const fillerCount = filler?.filler ?? 0;
    const fillerPct = filler?.fillerPercent ?? 0;

    return {
      title: `Is ${title} Worth Watching? Filler Episode Guide | ZyniVerse`,
      description: filler
        ? `${title} has ${total} episodes with ${fillerCount} filler episodes (${fillerPct}%). Skip filler and watch only canon. Complete episode-by-episode breakdown.`
        : `Is ${title} worth watching? Complete filler and canon episode guide for ${title}. Every episode classified.`,
      openGraph: {
        title: `Is ${title} Worth Watching? Filler Episode Guide`,
        description: `${total} episodes, ${fillerCount} filler (${fillerPct}%). Skip to canon with ZyniVerse.`,
        images: anime.coverImage?.extraLarge ? [{ url: anime.coverImage.extraLarge }] : [],
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Filler Episode Guide | ZyniVerse" };
  }
}

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "manga-canon": { label: "Manga Canon", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  "anime-canon": { label: "Anime Canon", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  "mixed-manga": { label: "Mixed", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  filler: { label: "Filler", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default async function AnimeFillerSeoPage({ params }: Props) {
  const { id } = await params;
  const anilistId = Number(id);
  if (isNaN(anilistId)) notFound();

  let anime;
  try {
    anime = await getAnimeDetailFull(anilistId);
  } catch {
    notFound();
  }

  const title = bestTitle(anime.title);
  const filler = await getFillerForAnime(anime.id, title);
  if (!filler) notFound();

  const total = filler.total;
  const fillerCount = filler.filler;
  const mangaCanonCount = filler.mangaCanon;
  const animeCanonCount = filler.animeCanon;
  const mixedCount = filler.mixed;
  const fillerPct = filler.fillerPercent;
  const canonPct = total > 0 ? Math.round(((mangaCanonCount + animeCanonCount) / total) * 100) : 0;
  const fillerEpisodes = filler.episodes.filter((e) => e.type === "filler");
  const canonEpisodes = filler.episodes.filter((e) => e.type !== "filler");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Is ${title} Worth Watching? Complete Filler Episode Guide`,
    description: `${title} has ${total} episodes with ${fillerCount} filler episodes (${fillerPct}%). Skip filler and watch only canon.`,
    author: { "@type": "Organization", name: "ZyniVerse" },
    publisher: { "@type": "Organization", name: "ZyniVerse" },
    image: anime.coverImage?.extraLarge || anime.coverImage?.large || "",
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://zyniverse.in/anime/${anilistId}/filler` },
    about: {
      "@type": "TVSeries",
      name: title,
      numberOfEpisodes: total,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/filler" className="hover:text-[var(--color-cyan)] transition-colors">Filler Guides</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">{title}</span>
        </nav>

        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-56 w-40 shrink-0 overflow-hidden rounded-xl border-2 border-[var(--color-magenta)]/20 shadow-xl shadow-[var(--color-magenta)]/5">
            <Image
              src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
              alt={title}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Is {title} Worth Watching?
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
              Filler Episode Guide
            </p>
            <p className="mt-3 max-w-2xl text-[var(--color-mute)] leading-relaxed">
              {title} has <strong className="text-[var(--color-ink)]">{total} episodes</strong>.
              Of those, <strong className="text-green-400">{mangaCanonCount + animeCanonCount} are canon</strong>,
              <strong className="text-amber-400"> {mixedCount} are mixed</strong>, and
              <strong className="text-red-400"> {fillerCount} are filler ({fillerPct}%)</strong>.
              {canonPct > 80
                ? " Most of this anime is canon — great value."
                : fillerPct > 30
                ? " Consider skipping filler episodes to save time."
                : " A solid watch with minimal filler."}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/anime/${anilistId}`}
                className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors">
                ← Back to {title}
              </Link>
              {fillerEpisodes.length > 0 && (
                <a href="#filler-list"
                  className="rounded-full bg-red-500/10 border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors">
                  Skip to Filler ({fillerEpisodes.length} eps)
                </a>
              )}
              {canonEpisodes.length > 0 && (
                <a href="#canon-list"
                  className="rounded-full bg-green-500/10 border border-green-500/30 px-4 py-2 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors">
                  Skip to Canon ({canonEpisodes.length} eps)
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
            <p className="font-mono text-2xl font-bold text-[var(--color-ink)]">{total}</p>
            <p className="text-xs text-[var(--color-mute)]">Total Episodes</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-green-400">{mangaCanonCount + animeCanonCount}</p>
            <p className="text-xs text-[var(--color-mute)]">Canon Episodes</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-amber-400">{mixedCount}</p>
            <p className="text-xs text-[var(--color-mute)]">Mixed Episodes</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="font-mono text-2xl font-bold text-red-400">{fillerCount}</p>
            <p className="text-xs text-[var(--color-mute)]">Filler Episodes</p>
          </div>
        </div>

        <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-[var(--color-line)]">
          {mangaCanonCount + animeCanonCount > 0 && (
            <div className="h-full bg-green-500" style={{ width: `${(mangaCanonCount / total) * 100}%` }} title="Manga Canon" />
          )}
          {animeCanonCount > 0 && (
            <div className="h-full bg-blue-500" style={{ width: `${(animeCanonCount / total) * 100}%` }} title="Anime Canon" />
          )}
          {mixedCount > 0 && (
            <div className="h-full bg-amber-500" style={{ width: `${(mixedCount / total) * 100}%` }} title="Mixed" />
          )}
          {fillerCount > 0 && (
            <div className="h-full bg-red-500" style={{ width: `${(fillerCount / total) * 100}%` }} title="Filler" />
          )}
        </div>

        <div className="mb-4 flex items-center gap-4 text-xs text-[var(--color-mute)]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Manga Canon</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Anime Canon</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Mixed</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Filler</span>
        </div>

        {fillerEpisodes.length > 0 && (
          <section id="filler-list" className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-red-500" />
              Filler Episodes — Safe to Skip
            </h2>
            <p className="mb-4 text-sm text-[var(--color-mute)]">
              These {fillerCount} episodes do not affect the main storyline. You can skip them entirely.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {fillerEpisodes.map((ep) => {
                const style = TYPE_STYLES[ep.type];
                return (
                  <div key={ep.episode} className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 font-mono text-xs font-bold text-red-400">
                      {ep.episode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ep.title}</p>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style?.bg} ${style?.color} ${style?.border}`}>
                        {style?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section id="canon-list" className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-green-500" />
            Canon &amp; Mixed Episodes — Must Watch
          </h2>
          <p className="mb-4 text-sm text-[var(--color-mute)]">
            These {canonEpisodes.length} episodes are essential to the story. Do not skip these.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {canonEpisodes.map((ep) => {
              const style = TYPE_STYLES[ep.type];
              return (
                <div key={ep.episode} className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-void)] font-mono text-xs font-bold text-[var(--color-ink)]">
                    {ep.episode}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{ep.title}</p>
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style?.bg} ${style?.color} ${style?.border}`}>
                      {style?.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8 mb-10">
          <h2 className="font-display text-lg font-bold mb-3">Quick Skip Guide for {title}</h2>
          <div className="space-y-2 text-sm text-[var(--color-mute)]">
            {filler.quickList.filler && filler.quickList.filler.length > 0 && (
              <p>
                <strong className="text-red-400">Filler episodes:</strong>{" "}
                <span className="font-mono text-[var(--color-ink)]">{filler.quickList.filler.join(", ")}</span>
              </p>
            )}
            {filler.quickList["manga-canon"] && filler.quickList["manga-canon"].length > 0 && (
              <p>
                <strong className="text-green-400">Manga canon:</strong>{" "}
                <span className="font-mono text-[var(--color-ink)]">{filler.quickList["manga-canon"].join(", ")}</span>
              </p>
            )}
            {filler.quickList["anime-canon"] && filler.quickList["anime-canon"].length > 0 && (
              <p>
                <strong className="text-blue-400">Anime canon:</strong>{" "}
                <span className="font-mono text-[var(--color-ink)]">{filler.quickList["anime-canon"].join(", ")}</span>
              </p>
            )}
            {filler.quickList["mixed-manga"] && filler.quickList["mixed-manga"].length > 0 && (
              <p>
                <strong className="text-amber-400">Mixed episodes:</strong>{" "}
                <span className="font-mono text-[var(--color-ink)]">{filler.quickList["mixed-manga"].join(", ")}</span>
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-line)]">
            <p className="text-sm text-[var(--color-mute)]">
              {fillerPct === 0
                ? `${title} has no filler episodes. You can watch the entire series straight through.`
                : fillerPct < 10
                ? `${title} has minimal filler (${fillerPct}%). You can safely skip just the ${fillerCount} filler episode${fillerCount > 1 ? "s" : ""}.`
                : fillerPct < 30
                ? `${title} has moderate filler (${fillerPct}%). Skipping the ${fillerCount} filler episodes will save you time without missing story.`
                : `${title} has significant filler (${fillerPct}%). Following the canon list above will give you a much tighter experience.`}
            </p>
          </div>
        </section>

        <div className="border-t border-[var(--color-line)] pt-8 mb-10">
          <h2 className="font-display text-lg font-bold mb-4">More Filler Guides</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/filler" className="text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors underline">
              Browse all filler guides →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
