import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDecode } from "@/lib/url-params";
import { MyListShareRow } from "@/app/u/[username]/manga/share-row";

export const revalidate = 21600;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: raw } = await params;
  const username = safeDecode(raw);
  return {
    title: `${username}'s Anime List — Watchlist & Manga Progress | ZyniVerse`,
    description: `Browse ${username}'s anime watchlist and manga reading list on ZyniVerse. See what they're watching, reading, scoring, and following.`,
    alternates: { canonical: `${BASE_URL}/list/${username}` },
    openGraph: {
      title: `${username}'s Anime List | ZyniVerse`,
      description: `See what ${username} is watching and reading on ZyniVerse.`,
      url: `${BASE_URL}/list/${username}`,
      type: "profile",
      username,
    },
    robots: { index: true, follow: true },
  };
}

interface UserRow {
  id: string;
  username: string;
  avatar: string | null;
}

export default async function PublicListHubPage({ params }: PageProps) {
  const { username: raw } = await params;
  const username = safeDecode(raw);
  const user = (await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, avatar: true },
  })) as UserRow | null;
  if (!user) notFound();

  const [animeEntries, mangaEntries] = await Promise.all([
    prisma.listEntry.findMany({ where: { userId: user.id }, select: { status: true, score: true } }),
    prisma.mangaEntry.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { title: true, coverImage: true, status: true, score: true },
    }),
  ]);

  const animeCompleted = animeEntries.filter((e) => e.status === "COMPLETED").length;
  const scored = animeEntries
    .filter((e) => e.score != null)
    .map((e) => e.score as number);
  const animeMean = scored.length ? (scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1) : null;
  const animeWatching = animeEntries.filter((e) => e.status === "CURRENT").length;

  const mangaCount = mangaEntries.length;
  const mangaScored = mangaEntries.filter((e) => e.score != null);
  const mangaMean = mangaScored.length
    ? (mangaScored.reduce((s, e) => s + (e.score || 0), 0) / mangaScored.length).toFixed(1)
    : null;

  const stats = [
    { label: "Anime Watched", value: animeCompleted, icon: "🎬", color: "var(--color-cyan)" },
    { label: "Currently Watching", value: animeWatching, icon: "🔥", color: "var(--color-magenta)" },
    { label: "Anime Mean Score", value: animeMean ?? "—", icon: "⭐", color: "var(--color-amber)" },
    { label: "Manga In List", value: mangaCount, icon: "📚", color: "var(--color-violet)" },
    { label: "Manga Mean Score", value: mangaMean ?? "—", icon: "✍️", color: "#48BB78" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${username}'s Anime List`,
    url: `${BASE_URL}/list/${username}`,
    mainEntity: {
      "@type": "Person",
      name: username,
      url: `${BASE_URL}/u/${username}`,
    },
    publisher: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 animate-page-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{username}&apos;s List</span>
      </nav>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[var(--color-violet)]/30 shrink-0">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.username} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[var(--color-panel)] text-2xl font-bold text-[var(--color-violet)]">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-2xl sm:text-3xl font-black">@{user.username}&apos;s Anime List</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            {animeEntries.length} anime tracked • {mangaCount} manga tracked — shared on ZyniVerse.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href={`/u/${user.username}`} className="rounded-full neon-rgb-border px-3 py-1.5 font-semibold text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors">
              Profile
            </Link>
            <Link href={`/u/${user.username}/watchlist`} className="rounded-full neon-rgb-border px-3 py-1.5 font-semibold text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors">
              Full Watchlist →
            </Link>
            <Link href={`/u/${user.username}/manga`} className="rounded-full neon-rgb-border px-3 py-1.5 font-semibold text-[var(--color-violet)] hover:border-[var(--color-violet)] transition-colors">
              Full Manga List →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 text-center">
            <span className="text-xl">{s.icon}</span>
            <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-1 rounded-full bg-[var(--color-violet)]" />
          <h2 className="font-display text-lg font-bold">Recent Manga</h2>
          <Link href={`/u/${user.username}/manga`} className="text-xs text-[var(--color-cyan)] hover:underline">View all →</Link>
        </div>
        {mangaEntries.length === 0 ? (
          <p className="text-sm text-[var(--color-mute)]">No manga tracked yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {mangaEntries.map((m) => (
              <Link
                key={`${m.title}-${m.status}`}
                href="/manga"
                className="group rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-violet)]/40 transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {m.coverImage ? (
                    <Image src={m.coverImage} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[var(--color-panel)] p-3 text-center text-xs text-[var(--color-mute)]">{m.title}</div>
                  )}
                  {m.score != null && (
                    <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-[10px] font-bold text-[var(--color-violet)] backdrop-blur-sm flex items-center justify-center">{m.score}</div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold truncate">{m.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] mt-0.5">{m.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 text-center mb-10">
        <p className="font-mono text-2xl mb-2">🚀</p>
        <h3 className="font-display text-lg font-bold">Track your own anime & manga list</h3>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          Join ZyniVerse free — build your anime list, track reading, and share it with friends.
        </p>
        <Link href="/register" className="mt-4 inline-block rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          Create Your List Free
        </Link>
      </div>

      <MyListShareRow username={user.username} type="manga" count={mangaCount} />
    </div>
  );
}