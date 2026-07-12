import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import { getFillerForAnime } from "@/lib/filler";
import FillerGuide from "@/components/FillerGuide";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const anime = await getAnimeDetailFull(id);
    const title = bestTitle(anime.title);
    const filler = await getFillerForAnime(anime.id, title);
    const fillerPct = filler?.fillerPercent ?? 0;

    return {
      title: `${title} Filler List — Complete Episode Guide | ZyniVerse`,
      description:
        fillerPct > 0
          ? `Full ${title} filler guide. ${fillerPct}% filler — skip episodes ${filler?.quickList?.filler?.slice(0, 3).join(", ") || ""} and watch only canon. Complete episode list with manga-canon, anime-canon, and filler marked.`
          : `Complete episode guide for ${title}. Every episode listed with manga-canon, anime-canon, and filler types. Plan your watch with ZyniVerse.`,
      openGraph: {
        title: `${title} Filler List & Episode Guide — ZyniVerse`,
        description: `Skip filler in ${title}. ${filler ? `${filler.total} episodes total, ${fillerPct}% filler.` : "Complete episode breakdown with canon/filler markings."}`,
        images: anime.coverImage?.extraLarge ? [{ url: anime.coverImage.extraLarge }] : [],
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Filler Guide — ZyniVerse" };
  }
}

export default async function FillerPage({ params }: Props) {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/search?type=ANIME" className="hover:text-[var(--color-cyan)] transition-colors">Anime</Link>
        <span>/</span>
        <Link href={`/anime/${anilistId}`} className="hover:text-[var(--color-cyan)] transition-colors truncate max-w-[200px]">{title}</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Filler Guide</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="neon-premium rounded-xl shrink-0">
          <div className="neon-premium-track rounded-xl" />
          <div className="neon-premium-overlay rounded-[10.5px]" />
          <div className="neon-premium-content">
            <div className="relative h-48 w-32 rounded-xl overflow-hidden">
              <Image
                src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
                alt={title}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Filler Guide</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">{title} — Filler List</h1>
          <p className="mt-2 text-[var(--color-mute)] max-w-2xl">
            Complete episode breakdown for <strong>{title}</strong>. Every episode marked as manga-canon, anime-canon, mixed-canon, or filler — so you can skip straight to the story.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/anime/${anilistId}`}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
            >← Back to {title}</Link>
            <Link href="/schedule"
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
            >Airing Schedule</Link>
          </div>
        </div>
      </div>

      {/* Filler Guide Component */}
      <div className="max-w-3xl">
        <FillerGuide anilistId={anilistId} animeTitle={title} />
      </div>

      {/* Related Links */}
      <div className="mt-12 border-t border-[var(--color-line)] pt-8">
        <h2 className="font-display text-lg font-bold mb-4">Popular Filler Guides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {POPULAR_FILLER_ANIME.filter((a) => a.id !== anilistId).slice(0, 8).map((a) => (
            <Link key={a.id} href={`/anime/${a.id}/filler`}
              className="neon-premium rounded-xl no-underline group"
            >
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-3 text-center">
                <p className="text-sm font-semibold truncate group-hover:text-[var(--color-cyan)] transition-colors">{a.title}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Filler Guide</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/filler"
            className="text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors underline"
          >View all filler guides →</Link>
        </div>
      </div>
    </div>
  );
}

const POPULAR_FILLER_ANIME = [
  { id: 20, title: "Naruto" },
  { id: 1735, title: "Naruto Shippuden" },
  { id: 21, title: "One Piece" },
  { id: 5114, title: "Bleach" },
  { id: 5116, title: "Bleach: Thousand-Year Blood War" },
  { id: 11061, title: "Hunter x Hunter" },
  { id: 16498, title: "Dragon Ball Super" },
  { id: 813, title: "Dragon Ball Z" },
  { id: 22319, title: "Boruto" },
  { id: 9253, title: "Steins;Gate" },
  { id: 19815, title: "One Punch Man" },
  { id: 41467, title: "Solo Leveling" },
  { id: 30276, title: "One Punch Man S2" },
  { id: 15335, title: "Attack on Titan" },
  { id: 37521, title: "Demon Slayer" },
  { id: 23755, title: "Black Clover" },
  { id: 22147, title: "My Hero Academia" },
  { id: 100, title: "Pokémon" },
  { id: 150, title: "Gintama" },
  { id: 11757, title: "Fairy Tail" },
];
