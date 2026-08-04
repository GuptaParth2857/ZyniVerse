import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import { buildWatchOrder } from "@/lib/watch-order";
import AnimeWatchOrder from "./AnimeWatchOrder";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const animeId = parseInt(id);
  if (isNaN(animeId)) return { title: "Watch Order — ZyniVerse", description: "Find the correct watch order for any anime series including sequels, prequels, movies, and OVAs. Never watch out of order again.", robots: { index: true, follow: true } };

  try {
    const anime = await getAnimeDetailFull(animeId);
    const title = bestTitle(anime.title);
    return {
      title: `${title} Watch Order — Auto-Generated | ZyniVerse`,
      description: `Watch order guide for ${title} including all sequels, prequels, and side stories. Never watch out of order again.`,
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Watch Order — ZyniVerse", description: "Find the correct watch order for any anime series including sequels, prequels, movies, and OVAs. Never watch out of order again.", robots: { index: true, follow: true } };
  }
}

export default async function AnimeWatchOrderPage({ params }: Props) {
  const { id } = await params;
  const animeId = parseInt(id);
  if (isNaN(animeId)) notFound();

  let anime;
  try {
    anime = await getAnimeDetailFull(animeId);
  } catch {
    notFound();
  }

  if (!anime) notFound();

  const title = bestTitle(anime.title);
  const relations = anime.relations?.edges || [];

  // Build smart watch order from relations
  const guide = buildWatchOrder(anime, relations);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-page-in">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/watch-order" className="hover:text-[var(--color-cyan)] transition-colors">Watch Orders</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{title}</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--glass-border)] mb-8">
        <div className="absolute inset-0">
          <Image
            src={anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
            alt={title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/70 to-[var(--color-panel)]/30" />
        </div>
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Image
              src={anime.coverImage?.large || ""}
              alt={title}
              width={96}
              height={128}
              className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-lg shrink-0"
            />
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
                {/* auto-generated watch order */}
              </p>
              <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
                  {title}
                </h1>
              </div>
              <p className="mt-2 text-sm text-[var(--color-mute)] max-w-xl leading-relaxed">
                {anime.genres?.slice(0, 5).join(" · ")}
                {anime.episodes && ` · ${anime.episodes} episodes`}
                {anime.startDate?.year && ` · ${anime.startDate.year}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
                  {guide.totalEntries} entries
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-magenta)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-magenta)] border border-[var(--color-magenta)]/20">
                  Auto-Generated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Watch Order Timeline */}
      <AnimeWatchOrder guide={guide} />

      {/* Back link */}
      <div className="mt-10 text-center">
        <Link
          href="/watch-order"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          Back to all watch orders
        </Link>
      </div>
    </div>
  );
}


