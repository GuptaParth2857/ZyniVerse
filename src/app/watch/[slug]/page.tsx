import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import { getStreamingSources } from "@/lib/streaming";
import { getDubInfo } from "@/lib/dub-data";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mediaId = parseInt(slug);
  if (isNaN(mediaId)) return {};

  try {
    const media = await getAnimeDetailFull(mediaId);
    const title = bestTitle(media.title);
    
    return {
      title: `Where to Watch ${title} in India — Streaming, Hindi Dub & More | ZyniVerse`,
      description: `Complete guide to watch ${title} in India. Find streaming platforms, Hindi dub availability, and where to watch legally.`,
      openGraph: {
        title: `Where to Watch ${title} in India | ZyniVerse`,
        description: `Stream ${title} on Crunchyroll, Netflix, JioHotstar and more. Hindi dub info included.`,
        images: [media.coverImage?.extraLarge || media.coverImage?.large || ""],
      },
      twitter: {
        title: `Where to Watch ${title} in India | ZyniVerse`,
        description: `Stream ${title} on Crunchyroll, Netflix, JioHotstar and more. Hindi dub info included.`,
      },
    };
  } catch {
    return {};
  }
}

export default async function WatchGuidePage({ params }: Props) {
  const { slug } = await params;
  const mediaId = parseInt(slug);
  if (isNaN(mediaId)) notFound();

  let media;
  try {
    media = await getAnimeDetailFull(mediaId);
  } catch {
    notFound();
  }

  const title = bestTitle(media.title);
  const streamingSources = getStreamingSources(title);
  const dubInfo = getDubInfo(mediaId);

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/anime/${mediaId}`} className="hover:text-[var(--color-cyan)]">{title}</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">Where to Watch</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex gap-6">
          {media.coverImage?.extraLarge && (
            <img
              src={media.coverImage.extraLarge}
              alt={title}
              className="h-48 w-32 flex-shrink-0 rounded-xl object-cover shadow-lg"
            />
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
              Watch Guide — India
            </p>
            <h1 className="font-display text-2xl font-black sm:text-3xl tracking-tight mt-1">
              Where to Watch {title} in India
            </h1>
            <p className="mt-2 text-sm text-[var(--color-mute)]">
              Complete guide to streaming platforms, Hindi dub availability, and legal viewing options.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {media.genres?.slice(0, 4).map((g: any) => (
                <span key={g.name} className="rounded-full bg-[var(--color-surface2)] px-2.5 py-0.5 text-[10px] text-[var(--color-mute)]">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hindi Dub Info */}
        {dubInfo && (
          <div className="mb-8 rounded-xl border border-green-500/30 bg-green-500/5 p-6">
            <h2 className="mb-3 text-lg font-bold text-green-400">Hindi Dub Available</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--color-mute)]">Platform</p>
                <p className="text-sm font-medium">{dubInfo.platform}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-mute)]">Studio</p>
                <p className="text-sm font-medium">{dubInfo.studio}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-mute)]">Languages</p>
                <p className="text-sm font-medium">{dubInfo.languages.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-mute)]">Status</p>
                <p className="text-sm font-medium capitalize">{dubInfo.status}</p>
              </div>
            </div>
          </div>
        )}

        {/* Streaming Platforms */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">Streaming Platforms</h2>
          {streamingSources.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {streamingSources.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 transition-all hover:border-[var(--color-cyan)] hover:shadow-lg hover:shadow-[var(--color-cyan)]/5"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">{source.name}</h3>
                    <p className="text-[10px] text-[var(--color-mute)]">
                      {source.languages.join(", ")} • {source.region}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    source.type === "free" ? "bg-green-500/20 text-green-400" :
                    source.type === "subscription" ? "bg-blue-500/20 text-blue-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {source.type === "free" ? "FREE" : source.type === "subscription" ? "PAID" : "ADS"}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-6 text-center">
              <p className="text-sm text-[var(--color-mute)]">No streaming sources found for this anime in India.</p>
              <p className="mt-2 text-xs text-[var(--color-mute)]">
                Check back later or request us to add this anime to our database.
              </p>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">Quick Links</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/anime/${mediaId}`}
              className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 transition-all hover:border-[var(--color-cyan)]"
            >
              <h3 className="text-sm font-bold">Anime Details</h3>
              <p className="text-xs text-[var(--color-mute)]">View full anime information</p>
            </Link>
            <Link
              href={`/filler/${mediaId}`}
              className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 transition-all hover:border-[var(--color-cyan)]"
            >
              <h3 className="text-sm font-bold">Filler Guide</h3>
              <p className="text-xs text-[var(--color-mute)]">Check which episodes to skip</p>
            </Link>
            <Link
              href={`/watch-order/${mediaId}`}
              className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 transition-all hover:border-[var(--color-cyan)]"
            >
              <h3 className="text-sm font-bold">Watch Order</h3>
              <p className="text-xs text-[var(--color-mute)]">Recommended viewing order</p>
            </Link>
            <Link
              href={`/recommendations`}
              className="rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-4 transition-all hover:border-[var(--color-cyan)]"
            >
              <h3 className="text-sm font-bold">Similar Anime</h3>
              <p className="text-xs text-[var(--color-mute)]">Get recommendations</p>
            </Link>
          </div>
        </section>

        {/* SEO Content */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">About {title}</h2>
          <div className="prose prose-invert max-w-none text-sm text-[var(--color-mute)]">
            {media.description ? (
              <div dangerouslySetInnerHTML={{ __html: media.description }} />
            ) : (
              <p>No description available.</p>
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-[var(--color-cyan)] bg-[var(--color-cyan)]/5 p-6 text-center">
          <h3 className="mb-2 text-lg font-bold">Track Your Progress</h3>
          <p className="mb-4 text-sm text-[var(--color-mute)]">
            Add {title} to your watchlist and track your viewing progress on ZyniVerse.
          </p>
          <Link
            href={`/anime/${mediaId}`}
            className="inline-block rounded-lg bg-[var(--color-cyan)] px-6 py-2 text-sm font-bold text-black transition-colors hover:bg-[var(--color-cyan)]/80"
          >
            View on ZyniVerse
          </Link>
        </div>

        <div className="mt-8">
          <NativeBannerAd />
        </div>
      </div>
    </PageTransition>
  );
}
