import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  const title = caption ? `${caption.slice(0, 60)} | ZyniVerse Reels` : "Anime Reel | ZyniVerse";
  return {
    title,
    description: caption
      ? `${caption.slice(0, 160)} — anime reel${author ? ` by @${author}` : ""} on ZyniVerse.`
      : "Watch anime reels, clips and fandoms on ZyniVerse.",
    alternates: { canonical: `${BASE_URL}/reels/${id}` },
    openGraph: {
      title: caption ? caption.slice(0, 90) : "Anime Reel | ZyniVerse",
      description: caption ? caption.slice(0, 160) : "Anime reels, clips and fandoms on ZyniVerse.",
      type: "video.other" as const,
      url: `${BASE_URL}/reels/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: caption || "Anime reel" }],
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

  const authorPath = `/creators/${reel.user.username}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: reel.caption?.slice(0, 200) || "Anime Reel",
    description: reel.caption?.slice(0, 400) || "Anime reel on ZyniVerse",
    thumbnailUrl: reel.thumbnailUrl ? [reel.thumbnailUrl] : [`${BASE_URL}/api/og/reel/${id}`],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
        <span>›</span>
        <Link href="/reels" className="hover:text-[var(--color-cyan)]">Reels</Link>
        <span>›</span>
        <span className="line-clamp-1 text-[var(--color-ink)]">{reel.caption?.slice(0, 40) || "Reel"}</span>
      </nav>

      <article className="overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/70">
        <div className="relative aspect-[9/16] max-h-96 w-full overflow-hidden bg-black sm:aspect-[4/3] sm:max-h-[480px]">
          <video
            src={reel.videoUrl}
            poster={reel.thumbnailUrl || `${BASE_URL}/api/og/reel/${id}`}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>

        <div className="p-4 sm:p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-fg)]">{reel.caption || "Anime reel on ZyniVerse"}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-mute)]">
            <Link href={authorPath} className="flex items-center gap-2 hover:text-[var(--color-cyan)]">
              {reel.user.avatar ? (
                <span className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-pink-500/70">
                  <Image src={reel.user.avatar} alt={reel.user.username} width={24} height={24} className="object-cover" />
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-[10px] font-bold text-white">
                  {reel.user.username.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="font-semibold text-[var(--color-fg)]">@{reel.user.username}</span>
            </Link>
            <span>▶ {reel.views.toLocaleString()} views</span>
            <span>❤️ {reel._count.likes}</span>
            <span>💬 {reel._count.comments}</span>
            <span>{timeAgo(reel.createdAt)}</span>
          </div>

          <div className="mt-4 flex gap-2">
            <Link href="/reels" className="rounded-full neon-rgb-border px-4 py-2 text-xs font-semibold text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors">
              ← Back to Reels Feed
            </Link>
            <Link href={`/reels?reel=${encodeURIComponent(id)}`} className="rounded-full neon-rgb-border px-4 py-2 text-xs font-semibold text-[var(--color-magenta)] hover:border-[var(--color-magenta)] transition-colors">
              Open in Feed ⟶
            </Link>
          </div>
        </div>
      </article>

      <nav className="mt-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href={authorPath} className="hover:text-[var(--color-cyan)]">More from @{reel.user.username}</Link>
      </nav>
      <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--color-mute)]">
        ANIME REEL • ZYNIVERSE • REPOSTED WITH PERMISSION
      </p>
    </div>
  );
}