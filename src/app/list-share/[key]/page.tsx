import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getMediaBatch, bestTitle } from "@/lib/anilist";
import CopyLinkButton from "@/components/CopyLinkButton";

interface Props {
  params: Promise<{ key: string }>;
}

interface ResolvedMedia {
  id: number;
  title: string;
  cover: string | null;
  color: string | null;
  genres: string[];
}

export async function generateMetadata({ params }: Props) {
  const { key } = await params;
  const share = await prisma.listShare.findUnique({
    where: { key },
    include: { user: { select: { username: true } } },
  });
  if (!share) return { title: "Card Not Found | ZyniVerse" };
  return {
    title: `@${share.user.username}'s Anime Card | ZyniVerse`,
    description: `See ${share.user.username}'s anime stats, top genres, and rankings.`,
    openGraph: {
      title: `@${share.user.username}'s Anime Card`,
      description: "ZyniVerse shareable anime list card",
    },
  };
}

export default async function ListSharePage({ params }: Props) {
  const { key } = await params;
  const share = await prisma.listShare.findUnique({
    where: { key },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!share) notFound();

  const rows = await prisma.listEntry.findMany({
    where: { userId: share.userId },
    select: { mediaId: true, status: true, score: true, progress: true },
  });

  const mediaMap = new Map<number, ResolvedMedia>();
  try {
    const batch = await getMediaBatch(rows.map((r) => r.mediaId));
    for (const m of batch) {
      mediaMap.set(m.id, {
        id: m.id,
        title: bestTitle(m.title),
        cover: m.coverImage?.large || m.coverImage?.extraLarge || null,
        color: m.coverImage?.color || null,
        genres: m.genres || [],
      });
    }
  } catch {
    // AniList unavailable — card renders with entry counts only.
  }

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
  const total = rows.length;

  const genreCount = new Map<string, number>();
  for (const r of rows) {
    const m = mediaMap.get(r.mediaId);
    if (m) for (const g of m.genres) genreCount.set(g, (genreCount.get(g) || 0) + 1);
  }
  const topGenres = [...genreCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxGenre = topGenres[0]?.[1] || 1;

  const topRated = rows
    .filter((r) => r.score != null && r.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 6);

  const recent = rows.slice(-12).reverse();
  const completed = counts["COMPLETED"] || 0;
  const watching = (counts["CURRENT"] || 0) + (counts["REWATCHING"] || 0);
  const planning = counts["PLANNING"] || 0;
  const dropped = counts["DROPPED"] || 0;

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/list-share/${share.key}`;

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10 animate-page-in">
      <div className="w-full max-w-md">
        {/* Shareable Card */}
        <div className="relative overflow-hidden rounded-2xl neon-rgb-border bg-[var(--color-panel)]">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-500/20 blur-[100px]" />
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-full overflow-hidden border border-[var(--color-line)] bg-[var(--color-void)]">
                {share.user.avatar && (
                  <Image src={share.user.avatar} alt={share.user.username} fill className="object-cover" sizes="56px" unoptimized />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs text-[var(--color-cyan)]">✦ ZYNIVERSE ANIME CARD</p>
                <h1 className="text-xl font-bold truncate">@{share.user.username}</h1>
              </div>
            </div>

            {/* Counts */}
            <div className="mt-5 grid grid-cols-5 gap-1.5 text-center">
              {[
                { label: "Total", value: total, c: "#e0e0ff" },
                { label: "Done", value: completed, c: "#00ff7f" },
                { label: "Watching", value: watching, c: "#29f2e0" },
                { label: "Plan", value: planning, c: "#60a5fa" },
                { label: "Dropped", value: dropped, c: "#ff6b6b" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-1 py-2">
                  <div className="text-lg font-bold" style={{ color: s.c }}>{s.value}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[var(--color-mute)]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top genres */}
            {topGenres.length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Top Genres</p>
                <div className="mt-2 space-y-1.5">
                  {topGenres.map(([g, n]) => (
                    <div key={g} className="flex items-center gap-2">
                      <span className="w-24 text-[11px] text-[var(--color-mute)] truncate">{g}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded" style={{ width: `${(n / maxGenre) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--color-mute)]">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top rated */}
            {topRated.length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Highest Rated</p>
                <div className="mt-2 space-y-1.5">
                  {topRated.map((r, i) => {
                    const m = mediaMap.get(r.mediaId);
                    return (
                      <a key={r.mediaId} href={`/anime/${r.mediaId}`} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors">
                        <span className="w-4 text-center text-[11px] font-bold text-[var(--color-mute)]">{["🥇", "🥈", "🥉"][i] || (i + 1)}</span>
                        {m?.cover && (
                          <span className="relative h-8 w-6 rounded overflow-hidden shrink-0 bg-[var(--color-line)]">
                            <Image src={m.cover} alt={m.title} fill className="object-cover" sizes="24px" unoptimized />
                          </span>
                        )}
                        <span className="text-[12px] truncate flex-1 text-[var(--color-ink)]">{m?.title || `Anime #${r.mediaId}`}</span>
                        <span className="text-[11px] font-bold text-emerald-400">★ {r.score}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent posters */}
            {recent.length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-mute)]">Recent Activity</p>
                <div className="mt-2 grid grid-cols-6 gap-1.5">
                  {recent.slice(0, 12).map((r) => {
                    const m = mediaMap.get(r.mediaId);
                    if (!m?.cover) return <div key={r.mediaId} className="aspect-[3/4] rounded-md bg-white/5" />;
                    return (
                      <a key={r.mediaId} href={`/anime/${r.mediaId}`} className="aspect-[3/4] rounded-md overflow-hidden">
                        <Image src={m.cover} alt={m.title} width={80} height={106} className="w-full h-full object-cover hover:scale-105 transition-transform" unoptimized />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
              <span className="text-[10px] text-[var(--color-mute)]">made with 💜 on ZyniVerse</span>
              <CopyLinkButton url={url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}