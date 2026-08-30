import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { POSTER_CATEGORIES, posterCategoryOf, type PosterCategory } from "@/lib/post-types";
import NewPostComposer from "@/components/NewPostComposer";

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface PageProps {
  searchParams: Promise<{ cat?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const baseTitle =
    cat === "collab"
      ? "Collab Posters & Creator Spotlights"
      : cat === "news"
        ? "Anime News Posters"
        : cat === "anime"
          ? "Anime Posters"
          : cat === "other"
            ? "More Posters"
            : "Posts, Posters & Community";
  return {
    title: `${baseTitle} | ZyniVerse`,
    description:
      "ZyniVerse Posts — collaboration posters, creator spotlights, anime news cards and community threads & critiques in one main feed.",
    alternates: { canonical: `${BASE_URL}/posts` },
    openGraph: {
      title: `${baseTitle} | ZyniVerse`,
      description: "Posters, creator spotlights, news cards and community posts.",
      url: `${BASE_URL}/posts`,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
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

interface PosterCardData {
  id: string;
  title: string;
  image: string | null;
  type: string;
  content: string;
  createdAt: Date;
  author: { id: string; username: string; avatar: string | null };
  _count: { comments: number };
}

async function queryPosters(cat: string | undefined) {
  const where: Prisma.PostWhereInput = { image: { not: null } };
  switch (cat) {
    case "collab":
      where.type = { contains: "COLLAB" };
      break;
    case "news":
      where.type = { contains: "NEWS" };
      break;
    case "anime":
      where.type = { in: ["POSTER", "POSTER_ANIME", "ANIME"] };
      break;
    case "other":
      where.NOT = {
        OR: [
          { type: { contains: "COLLAB" } },
          { type: { contains: "NEWS" } },
          { type: { in: ["POSTER", "POSTER_ANIME", "ANIME"] } },
        ],
      };
      break;
  }
  const [posters, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);
  return { posters: posters as PosterCardData[], total };
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { cat } = await searchParams;
  const activeCat: PosterCategory = (["collab", "news", "anime", "other"] as PosterCategory[]).includes(
    cat as PosterCategory
  )
    ? (cat as PosterCategory)
    : "anime";

  let posters: PosterCardData[] = [];
  let totalPosters = 0;
  try {
    const res = await queryPosters(cat);
    posters = res.posters;
    totalPosters = res.total;
  } catch (e) {
    logError(e);
  }

  let communityPosts: (PosterCardData)[] = [];
  try {
    communityPosts = (await prisma.post.findMany({
      where: { type: { in: ["POST", "CRITIQUE"] } },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    })) as PosterCardData[];
  } catch (e) {
    logError(e);
  }

  const tabs = [{ key: "all", label: "All", emoji: "🌟" }, ...POSTER_CATEGORIES];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      <div className="relative text-center space-y-4 py-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cyan)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[11px] font-medium text-[var(--color-mute)] mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          The Main Feed
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-ink)]">
          ZyniVerse <span className="text-[var(--color-cyan)]">Posts</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-[var(--color-mute)]">
          Collaboration posters, creator spotlights, news cards and community threads & critiques — everything in one place.
        </p>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-2">
        {tabs.map((t) => {
          const active = t.key === "all" ? cat === undefined || !(["collab", "news", "anime", "other"] as string[]).includes(cat ?? "") : activeCat === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/posts" : `/posts?cat=${t.key}`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                active
                  ? "neon-rgb-border bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                  : "bg-white/5 border border-white/10 text-[var(--color-mute)] hover:text-white"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.key === "all" ? "All" : t.label}
            </Link>
          );
        })}
        <span className="ml-1 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] text-[var(--color-mute)]">
          {totalPosters} posters
        </span>
      </nav>

      {posters.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 py-16 text-center">
          <p className="text-sm text-[var(--color-muted)]">No posters in this category yet.</p>
          <Link
            href="/posts"
            className="rounded-full neon-rgb-border bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            View all
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {posters.map((poster) => {
            const catMeta = posterCategoryOf(poster.type);
            return (
              <Link
                key={poster.id}
                href={`/posts/${poster.id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]"
              >
                {poster.image ? (
                  <Image
                    src={poster.image}
                    alt={poster.title}
                    width={480}
                    height={600}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/70 to-[var(--color-magenta)]/70" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                  {catMeta.emoji} {catMeta.label}
                </div>
                <div className="absolute inset-x-2.5 bottom-2">
                  <p className="line-clamp-2 text-sm font-bold text-white drop-shadow">{poster.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-[10px] text-white/70">
                    <span>@{poster.author.username}</span>
                    <span>{formatCount(poster._count.comments)} 💬</span>
                    <span>{timeAgo(poster.createdAt)}</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="border-t border-[var(--color-line)] pt-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
            <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">Threads & Critiques</h2>
          </div>
          <Link href="/forum" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
            Forum →
          </Link>
        </div>
        {communityPosts.length === 0 ? (
          <p className="rounded-2xl neon-rgb-border bg-[var(--color-panel)]/60 py-10 text-center text-sm text-[var(--color-muted)]">
            No community posts yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {communityPosts.map((p) => {
              const isCritique = p.type === "CRITIQUE";
              return (
                <Link
                  key={p.id}
                  href={`/posts/${p.id}`}
                  className="group rounded-xl neon-rgb-border bg-[var(--color-panel)]/60 p-4 transition hover:bg-[var(--color-panel)]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCritique
                          ? "border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 text-[var(--color-magenta)]"
                          : "border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                      }`}
                    >
                      {isCritique ? "Critique" : "Thread"}
                    </span>
                    <span className="text-[10px] text-[var(--color-mute)]">{timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="line-clamp-2 font-display text-sm font-bold text-[var(--color-ink)] group-hover:text-[var(--color-cyan)]">
                    {p.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--color-mute)]">{p.content}</p>
                  <p className="mt-2 text-[10px] text-[var(--color-mute)]">
                    @{p.author.username} · {formatCount(p._count.comments)} 💬
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <NewPostComposer />
    </div>
  );
}