import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface AniListMedia {
  id: number;
  title: { romaji: string; english: string | null; native: string | null };
  coverImage: { large: string; extraLarge: string | null };
}

interface AniListResponse {
  data: { Media: AniListMedia } | null;
}

interface ListEntryRow {
  mediaId: number;
  status: string;
  progress: number;
  total: number;
  score: number | null;
}

interface UserRow {
  id: string;
  username: string;
  avatar: string | null;
  signature: string | null;
}

async function fetchAnimeDetails(mediaIds: number[]): Promise<Map<number, AniListMedia>> {
  const map = new Map<number, AniListMedia>();
  if (mediaIds.length === 0) return map;

  const query = `query ($ids: [Int]) { Media(id_in: $ids, type: ANIME) { id title { romaji english native } coverImage { large extraLarge } } }`;

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { ids: mediaIds } }),
      next: { revalidate: 60 },
    });
    const json = await res.json();
    const media = json.data?.Media;
    if (media) {
      const list: AniListMedia[] = Array.isArray(media) ? media : [media];
      for (const m of list) map.set(m.id, m);
    }
  } catch {}

  if (map.size < mediaIds.length) {
    const missing = mediaIds.filter((id) => !map.has(id));
    for (const id of missing) {
      try {
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query ($id: Int) { Media(id: $id, type: ANIME) { id title { romaji english native } coverImage { large extraLarge } } }`,
            variables: { id },
          }),
          next: { revalidate: 60 },
        });
        const json: AniListResponse = await res.json();
        if (json.data?.Media) map.set(id, json.data.Media);
      } catch {}
    }
  }

  return map;
}

function getMediaTitle(title: AniListMedia["title"]): string {
  return title.english || title.romaji || title.native || "Unknown";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CURRENT: { label: "Watching", color: "bg-green-500" },
  COMPLETED: { label: "Completed", color: "bg-[var(--color-cyan)]" },
  PLANNING: { label: "Planning", color: "bg-blue-500" },
  PAUSED: { label: "Paused", color: "bg-amber-500" },
  DROPPED: { label: "Dropped", color: "bg-red-500" },
  REWATCHING: { label: "Rewatching", color: "bg-purple-500" },
};

export default async function PublicWatchlistPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, avatar: true, signature: true },
  }) as UserRow | null;

  if (!user) notFound();

  let watchlistPublic = false;
  try {
    const meta = JSON.parse(user.signature ?? "{}");
    watchlistPublic = meta.watchlistPublic ?? false;
  } catch {
    watchlistPublic = false;
  }

  const entries = await prisma.listEntry.findMany({
    where: { userId: user.id },
    select: { mediaId: true, status: true, progress: true, total: true, score: true },
    orderBy: { updatedAt: "desc" },
  }) as ListEntryRow[];

  const mediaMap = await fetchAnimeDetails(entries.map((e) => e.mediaId));

  const statusGroups: Record<string, ListEntryRow[]> = {};
  for (const entry of entries) {
    if (!statusGroups[entry.status]) statusGroups[entry.status] = [];
    statusGroups[entry.status].push(entry);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/u" className="hover:text-[var(--color-cyan)] transition-colors">Users</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{user.username}</span>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Watchlist</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[var(--color-magenta)]/30 shrink-0">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.username} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[var(--color-panel)] text-xl font-bold text-[var(--color-magenta)]">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.username}&apos;s Watchlist</h1>
          <p className="text-sm text-[var(--color-mute)]">
            {entries.length} {entries.length === 1 ? "anime" : "anime"} in list
          </p>
        </div>
      </div>

      {!watchlistPublic ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <p className="font-display text-lg font-bold">This watchlist is private</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            {user.username} hasn&apos;t made their watchlist public yet.
          </p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
          <div className="text-3xl mb-3">📋</div>
          <p className="font-display text-lg font-bold">No anime in this watchlist</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            {user.username} hasn&apos;t added any anime to their list yet.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(statusGroups).map(([status, items]) => {
            const info = STATUS_LABELS[status] || { label: status, color: "bg-gray-500" };
            return (
              <section key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`h-3 w-1 rounded-full ${info.color}`} />
                  <h2 className="font-display text-lg font-bold">{info.label}</h2>
                  <span className="text-xs text-[var(--color-mute)] font-mono">{items.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {items.map((entry) => {
                    const media = mediaMap.get(entry.mediaId);
                    if (!media) return null;
                    const title = getMediaTitle(media.title);
                    return (
                      <Link
                        key={entry.mediaId}
                        href={`/anime/${entry.mediaId}`}
                        className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-magenta)]/40 transition-all"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <Image
                            src={media.coverImage.extraLarge || media.coverImage.large}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                          />
                          {entry.score && (
                            <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-[var(--color-magenta)] backdrop-blur-sm">
                              {entry.score}
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold truncate group-hover:text-[var(--color-cyan)] transition-colors">
                            {title}
                          </p>
                          {entry.progress > 0 && (
                            <p className="text-[10px] text-[var(--color-mute)] mt-0.5 font-mono">
                              Ep {entry.progress}{entry.total ? `/${entry.total}` : ""}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
