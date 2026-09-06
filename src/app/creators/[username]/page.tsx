import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDecode } from "@/lib/url-params";

export const revalidate = 43200;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface PageProps {
  params: Promise<{ username: string }>;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = safeDecode(rawUsername);

  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true, bio: true },
  });
  if (!user) return { title: "Creator Not Found | ZyniVerse" };

  const title = `@${user.username} — Anime Reel Creator | ZyniVerse`;
  const description = user.bio
    ? `${user.bio} · Watch @${user.username}'s anime reels and edits on ZyniVerse.`
    : `Watch anime reels and edits by @${user.username} on ZyniVerse.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/creators/${username}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/creators/${username}`,
      type: "profile",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CreatorPage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = safeDecode(rawUsername);

  const [user, reels] = await Promise.all([
    prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        banner: true,
        themeColor: true,
        createdAt: true,
        provider: true,
      },
    }),
    prisma.reel.findMany({
      where: { user: { username } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        caption: true,
        thumbnailUrl: true,
        videoUrl: true,
        duration: true,
        views: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user || reels.length === 0) notFound();

  const totalViews = reels.reduce((s, r) => s + r.views, 0);
  const joinedLabel = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: `@${user.username}`,
      identifier: user.username,
      description: user.bio || `Anime reel creator on ZyniVerse.`,
      url: `${BASE_URL}/creators/${username}`,
      mainEntityOfPage: {
        "@type": "WebPage",
        url: `${BASE_URL}/creators/${username}`,
        inLanguage: "en",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "ZyniVerse",
      url: BASE_URL,
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/70">
        {user.banner ? (
          <div className="h-28 w-full overflow-hidden sm:h-36">
            <Image
              src={user.banner}
              alt=""
              width={1024}
              height={224}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
          </div>
        ) : (
          <div className="h-28 w-full bg-gradient-to-r from-[var(--color-violet)]/50 via-[var(--color-magenta)]/40 to-[var(--color-cyan)]/50 sm:h-36" />
        )}

        <div className="relative flex flex-col gap-4 p-5 pt-2 sm:flex-row sm:items-end sm:justify-between sm:p-6 sm:pt-3">
          <div className="flex items-end gap-4">
            <div className="relative -mt-12 h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-black/60 sm:-mt-14 sm:h-24 sm:w-24">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.username} width={96} height={96} className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-pink-600 text-2xl font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="font-display text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
                @{user.username}
              </h1>
              {user.bio && <p className="mt-0.5 max-w-xl text-xs text-[var(--color-muted)] sm:text-sm">{user.bio}</p>}
              <p className="mt-1.5 text-[11px] uppercase tracking-wider text-[var(--color-mute)]">Joined {joinedLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:pb-1">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-[var(--color-ink)]">{reels.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Reels</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-[var(--color-ink)]">{formatCount(totalViews)}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Views</p>
            </div>
            <Link
              href="/reels"
              className="rounded-full neon-rgb-border bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Watch feed
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--color-line)] px-5 py-2.5 sm:px-6">
          <p className="text-[11px] text-[var(--color-mute)]">
            ✓ Content published on ZyniVerse with the creator&apos;s permission.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
          Reels by <span className="text-[var(--color-magenta)]">@{user.username}</span>
        </h2>
        <Link href="/creators" className="text-xs font-semibold text-[var(--color-magenta)] hover:underline">
          All creators →
        </Link>
      </div>

      {reels.length === 0 ? (
        <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 py-16 text-center text-sm text-[var(--color-muted)]">
          No reels yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {reels.map((reel) => (
            <Link
              key={reel.id}
              href={`/reels?reel=${encodeURIComponent(reel.id)}`}
              className="group relative block aspect-[9/16] overflow-hidden rounded-xl neon-rgb-border bg-black"
            >
              {reel.thumbnailUrl ? (
                <Image
                  src={reel.thumbnailUrl}
                  alt={reel.caption || `Anime reel by @${user.username}`}
                  width={360}
                  height={640}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/70 to-[var(--color-magenta)]/70">
                  <span className="text-3xl text-white/90">▶</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {reel.caption && (
                <p className="absolute inset-x-2.5 bottom-2 line-clamp-2 text-xs font-medium text-white/95 drop-shadow">
                  {reel.caption.slice(0, 120)}
                </p>
              )}
              <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                {formatCount(reel.views)} views
              </div>
              <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur">
                {timeAgo(reel.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link
          href={`/reels?username=${encodeURIComponent(username)}`}
          className="text-sm font-semibold text-[var(--color-magenta)] hover:underline"
        >
          Watch @{user.username}&apos;s reels in the full-screen feed →
        </Link>
      </div>
    </div>
  );
}