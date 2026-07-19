import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnimeDetailFull, bestTitle, type MediaAnimeFull } from "@/lib/anilist";
import AnimeWatchOrder from "./AnimeWatchOrder";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const animeId = parseInt(id);
  if (isNaN(animeId)) return { title: "Watch Order — ZyniVerse" };

  try {
    const anime = await getAnimeDetailFull(animeId);
    const title = bestTitle(anime.title);
    return {
      title: `${title} Watch Order — Auto-Generated | ZyniVerse`,
      description: `Watch order guide for ${title} including all sequels, prequels, and side stories.`,
    };
  } catch {
    return { title: "Watch Order — ZyniVerse" };
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

  // Build watch order from relations
  const watchOrder = buildWatchOrder(anime, relations);

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
          <img
            src={anime.bannerImage || anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-panel)] via-[var(--color-panel)]/70 to-[var(--color-panel)]/30" />
        </div>
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <img
              src={anime.coverImage?.large || ""}
              alt={title}
              className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-lg shrink-0"
            />
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
                {/* auto-generated watch order */}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-[var(--color-ink)]">
                {title}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-mute)] max-w-xl leading-relaxed">
                {anime.genres?.slice(0, 5).join(" · ")}
                {anime.episodes && ` · ${anime.episodes} episodes`}
                {anime.startDate?.year && ` · ${anime.startDate.year}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--color-cyan)] border border-[var(--color-cyan)]/20">
                  {watchOrder.length} entries
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
      <AnimeWatchOrder entries={watchOrder} mainId={animeId} />

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

interface WatchOrderEntry {
  id: number;
  title: string;
  format?: string;
  episodes?: number;
  relationType: string;
  coverImage?: string;
  status?: string;
}

function buildWatchOrder(anime: MediaAnimeFull, relations: { id: number; relationType: string; node: { id: number; title: { romaji?: string | null; english?: string | null; native?: string | null; userPreferred?: string | null }; coverImage?: { large?: string | null }; format?: string; episodes?: number; status?: string } }[]): WatchOrderEntry[] {
  const mainEntry: WatchOrderEntry = {
    id: anime.id,
    title: bestTitle(anime.title),
    format: anime.format || undefined,
    episodes: anime.episodes || undefined,
    relationType: "MAIN",
    coverImage: anime.coverImage?.large || undefined,
    status: anime.status || undefined,
  };

  // Categorize relations
  const prequels: WatchOrderEntry[] = [];
  const sequels: WatchOrderEntry[] = [];
  const sideStories: WatchOrderEntry[] = [];
  const alternatives: WatchOrderEntry[] = [];
  const spinoffs: WatchOrderEntry[] = [];

  for (const edge of relations) {
    const node = edge.node;
    const entry: WatchOrderEntry = {
      id: node.id,
      title: bestTitle(node.title),
      format: node.format || undefined,
      episodes: node.episodes || undefined,
      relationType: edge.relationType,
      coverImage: node.coverImage?.large || undefined,
      status: node.status || undefined,
    };

    switch (edge.relationType) {
      case "PREQUEL":
        prequels.push(entry);
        break;
      case "SEQUEL":
        sequels.push(entry);
        break;
      case "SIDE_STORY":
        sideStories.push(entry);
        break;
      case "ALTERNATIVE":
        alternatives.push(entry);
        break;
      case "SPIN_OFF":
        spinoffs.push(entry);
        break;
    }
  }

  // Build the chain: prequels (reversed) → main → sequels
  const chain: WatchOrderEntry[] = [];

  // Sort prequels by episode count or status to find the right order
  prequels.sort((a, b) => (a.episodes || 0) - (b.episodes || 0));
  for (const p of prequels) {
    chain.push(p);
  }

  chain.push(mainEntry);

  // Sort sequels
  sequels.sort((a, b) => (a.episodes || 0) - (b.episodes || 0));
  for (const s of sequels) {
    chain.push(s);
  }

  // Add side stories, alternatives, spinoffs at the end
  if (sideStories.length > 0 || alternatives.length > 0 || spinoffs.length > 0) {
    for (const ss of sideStories) chain.push(ss);
    for (const alt of alternatives) chain.push(alt);
    for (const so of spinoffs) chain.push(so);
  }

  return chain;
}
