import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Creators & Community Reels | ZyniVerse",
  description:
    "Browse anime edits, reels and fan content by the creators posting on ZyniVerse. Every creator's reel catalog in one place.",
  alternates: { canonical: "https://zyverse.in/creators" },
  openGraph: {
    title: "Creators & Community Reels | ZyniVerse",
    description: "Anime edits and fan reels by ZyniVerse creators.",
    url: "https://zyverse.in/creators",
    type: "website",
  },
  robots: { index: true, follow: true },
};

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface Creator {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  banner: string | null;
  themeColor: string | null;
  reelCount: number;
  totalViews: number;
}

export default async function CreatorsPage() {
  let creators: Creator[] = [];

  try {
    const [users, views] = await Promise.all([
      prisma.user.findMany({
        where: { reels: { some: {} } },
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,
          banner: true,
          themeColor: true,
          _count: { select: { reels: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
      prisma.reel.groupBy({
        by: ["userId"],
        _sum: { views: true },
      }),
    ]);

    const viewsByUser = new Map(views.map((v) => [v.userId, v._sum.views ?? 0]));
    creators = users
      .map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        banner: u.banner,
        themeColor: u.themeColor,
        reelCount: u._count.reels,
        totalViews: viewsByUser.get(u.id) ?? 0,
      }))
      .sort((a, b) => b.totalViews - a.totalViews);
  } catch (e) {
    logError(e);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      <div className="relative text-center space-y-4 py-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cyan)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[11px] font-medium text-[var(--color-mute)] mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
          Community Reels
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink)]">
          ZyniVerse <span className="text-[var(--color-magenta)]">Creators</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-[var(--color-mute)]">
          Anime edits, scraps and fan reels by the community. Content is reposted here with the creator&apos;s permission.
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 py-16 text-center">
          <p className="text-sm text-[var(--color-muted)]">No creators yet. Be the first to post a reel!</p>
          <Link
            href="/reels/upload"
            className="rounded-full neon-rgb-border bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Upload a reel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c, i) => (
            <Link
              key={c.id}
              href={`/creators/${encodeURIComponent(c.username)}`}
              className="group relative overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]/70 p-5 transition hover:bg-[var(--color-panel)] hover:brightness-110"
            >
              {c.banner ? (
                <div className="absolute inset-x-0 top-0 h-20 overflow-hidden">
                  <Image
                    src={c.banner}
                    alt=""
                    width={400}
                    height={80}
                    className="h-full w-full object-cover opacity-40 transition duration-300 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-[var(--color-violet)]/40 via-[var(--color-magenta)]/30 to-[var(--color-cyan)]/40" />
              )}

              <div className="relative mt-8 flex items-center gap-3.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-pink-500/80">
                  {c.avatar ? (
                    <Image src={c.avatar} alt={c.username} width={56} height={56} className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-pink-600 text-lg font-bold text-white">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[var(--color-ink)] group-hover:text-[var(--color-magenta)]">
                    @{c.username}
                  </p>
                  <p className="text-xs text-[var(--color-mute)]">
                    <span className="font-semibold text-[var(--color-fg)]">{c.reelCount}</span> reels ·{" "}
                    <span className="font-semibold text-[var(--color-fg)]">{formatCount(c.totalViews)}</span> views
                  </p>
                </div>
                <span className="ml-auto rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-mute)]">
                  #{i + 1}
                </span>
              </div>

              {c.bio && <p className="relative mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted)]">{c.bio}</p>}
            </Link>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-2xl text-center">
        <Link href="/reels" className="text-sm font-semibold text-[var(--color-magenta)] hover:underline">
          Watch all community reels →
        </Link>
      </div>
    </div>
  );
}