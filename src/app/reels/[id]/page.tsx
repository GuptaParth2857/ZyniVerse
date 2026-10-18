import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RichCaption from "@/components/RichCaption";
import ReelShare from "./ReelShare";
import ReelViewReporter from "./ReelViewReporter";

export const revalidate = 1800;

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export function generateStaticParams() {
  return [];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface PageProps {
  params: Promise<{ id: string }>;
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d < 1 && h < 1) return `${Math.max(m, 1)}m ago`;
  if (d < 1) return `${h}h ago`;
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  let caption: string | null = null;
  let author: string | null = null;
  try {
    const reel = await prisma.reel.findUnique({
      where: { id },
      select: { caption: true, user: { select: { username: true } } },
    });
    caption = reel?.caption ?? null;
    author = reel?.user.username ?? null;
  } catch {
    caption = null;
  }
  const ogImage = `${BASE_URL}/api/og/reel/${id}`;
  const title = caption
    ? `${caption.slice(0, 60)} | ZyniVerse Reels`
    : "Anime Reel | ZyniVerse";
  return {
    title,
    description: caption
      ? `${caption.slice(0, 160)} — anime reel${author ? ` by @${author}` : ""} on ZyniVerse.`
      : "Watch anime reels, clips and fandoms on ZyniVerse.",
    alternates: { canonical: `${BASE_URL}/reels/${id}` },
    openGraph: {
      title: caption ? caption.slice(0, 90) : "Anime Reel | ZyniVerse",
      description: caption
        ? caption.slice(0, 160)
        : "Anime reels, clips and fandoms on ZyniVerse.",
      type: "video.other" as const,
      url: `${BASE_URL}/reels/${id}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: caption || "Anime reel",
        },
      ],
    },
    twitter: { card: "summary_large_image" as const, images: [ogImage] },
    robots: { index: true, follow: true },
  };
}

export default async function ReelDetailPage({ params }: PageProps) {
  const { id } = await params;
  const reel = await prisma.reel.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!reel) notFound();

  // Related reels: same creator first, then trending — deduped, capped at 9.
  const [mine, trending] = await Promise.all([
    prisma.reel.findMany({
      where: { userId: reel.userId, id: { not: id } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        thumbnailUrl: true,
        caption: true,
        views: true,
        user: { select: { username: true } },
      },
    }),
    prisma.reel.findMany({
      where: { id: { not: id } },
      orderBy: { views: "desc" },
      take: 9,
      select: {
        id: true,
        thumbnailUrl: true,
        caption: true,
        views: true,
        user: { select: { username: true } },
      },
    }),
  ]);
  const seen = new Set([id]);
  const related: typeof mine = [];
  for (const r of [...mine, ...trending]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    related.push(r);
    if (related.length >= 9) break;
  }

  const authorPath = `/creators/${reel.user.username}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: reel.caption?.slice(0, 200) || "Anime Reel",
    description: reel.caption?.slice(0, 400) || "Anime reel on ZyniVerse",
    thumbnailUrl: reel.thumbnailUrl
      ? [reel.thumbnailUrl]
      : [`${BASE_URL}/api/og/reel/${id}`],
    uploadDate: reel.createdAt.toISOString(),
    contentUrl: reel.videoUrl,
    embedUrl: `${BASE_URL}/reels/${id}`,
    duration: reel.duration ? `PT${reel.duration}S` : undefined,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: reel.views,
    },
    author: {
      "@type": "Person",
      name: `@${reel.user.username}`,
      url: `${BASE_URL}${authorPath}`,
    },
    publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 animate-page-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)]">
          Home
        </Link>
        <span>›</span>
        <Link href="/reels" className="hover:text-[var(--color-cyan)]">
          Reels
        </Link>
        <span>›</span>
        <span className="line-clamp-1 text-[var(--color-ink)]">
          {reel.caption?.slice(0, 40) || "Reel"}
        </span>
      </nav>

      <article className="overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/70">
        <div
          className="relative mx-auto aspect-[9/16] overflow-hidden bg-black"
          style={{ width: "min(100%, calc(78dvh * 0.5625))" }}
        >
          <video
            src={reel.videoUrl}
            poster={reel.thumbnailUrl || `${BASE_URL}/api/og/reel/${id}`}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="p-4 sm:p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-fg)]">
            <RichCaption text={reel.caption || "Anime reel on ZyniVerse"} />
          </p>

          {reel.animeTitle && (
            <Link
              href={
                reel.animeId ? `/anime/${reel.animeId}` : "/search?type=ANIME"
              }
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold text-cyan-200 transition hover:bg-cyan-500/25 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {reel.animeTitle}
            </Link>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-mute)]">
            <Link
              href={authorPath}
              className="flex items-center gap-2 hover:text-[var(--color-cyan)]"
            >
              {reel.user.avatar ? (
                <span className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-pink-500/70">
                  <Image
                    src={reel.user.avatar}
                    alt={reel.user.username}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white">
                  {reel.user.username.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="font-semibold text-[var(--color-fg)]">
                @{reel.user.username}
              </span>
            </Link>
            <span>▶ {reel.views.toLocaleString()} views</span>
            <span>❤️ {reel._count.likes}</span>
            <span>💬 {reel._count.comments}</span>
            <span>{timeAgo(reel.createdAt)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/reels"
              className="rounded-full neon-rgb-border px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
            >
              ← Back to Reels Feed
            </Link>
            <Link
              href={`/reels?reel=${encodeURIComponent(id)}`}
              className="rounded-full neon-rgb-border px-4 py-2 text-xs font-semibold text-[var(--color-magenta)] hover:border-[var(--color-magenta)] transition-colors"
            >
              Open in Feed ⟶
            </Link>
            <ReelShare
              url={`${BASE_URL}/reels/${id}`}
              title={
                reel.caption
                  ? `${reel.caption.slice(0, 60)} | ZyniVerse Reels`
                  : "Anime Reel | ZyniVerse"
              }
            />
          </div>
        </div>
      </article>

      <nav className="mt-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href={authorPath} className="hover:text-[var(--color-cyan)]">
          More from @{reel.user.username}
        </Link>
      </nav>

      <ReelViewReporter reelId={id} />

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">More reels</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/reels/${r.id}`}
                className="group overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 transition-all hover:border-[var(--color-cyan)] hover:brightness-110"
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-black">
                  {r.thumbnailUrl ? (
                    <Image
                      src={r.thumbnailUrl}
                      alt={r.caption || "Anime reel"}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">
                      🎬
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    ▶ {r.views.toLocaleString()}
                  </span>
                </div>
                <p className="line-clamp-1 px-2 py-1.5 text-xs text-[var(--color-fg)]">
                  {r.caption || `@${r.user.username}`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--color-mute)]">
        ANIME REEL • ZYNIVERSE • REPOSTED WITH PERMISSION
      </p>
    </div>
  );
}
