import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDecode } from "@/lib/url-params";

interface UserRow {
  id: string;
  username: string;
  avatar: string | null;
  signature: string | null;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  READING: { label: "Reading", color: "bg-green-500" },
  COMPLETED: { label: "Completed", color: "bg-[var(--color-violet)]" },
  PLANNING: { label: "Planning", color: "bg-blue-500" },
  DROPPED: { label: "Dropped", color: "bg-red-500" },
  PAUSED: { label: "Paused", color: "bg-amber-500" },
  REREADING: { label: "Rereading", color: "bg-purple-500" },
};

function subTypeLabel(subType: string): string {
  switch (subType) {
    case "light_novel": return "Light Novel";
    case "manhwa": return "Manhwa";
    case "manhua": return "Manhua";
    default: return "Manga";
  }
}

export default async function PublicMangaListPage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const username = safeDecode(rawUsername);

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, avatar: true, signature: true },
  }) as UserRow | null;

  if (!user) notFound();

  let mangaListPublic = false;
  try {
    const meta = JSON.parse(user.signature ?? "{}");
    mangaListPublic = meta.mangaListPublic ?? meta.watchlistPublic ?? false;
  } catch {
    mangaListPublic = false;
  }

  const entries = await prisma.mangaEntry.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const scored = entries.filter((e) => e.score != null);
  const meanScore = scored.length > 0
    ? (scored.reduce((sum, e) => sum + (e.score || 0), 0) / scored.length).toFixed(1)
    : null;
  const totalChapters = entries.reduce((sum, e) => sum + e.chapters, 0);
  const completedCount = entries.filter((e) => e.status === "COMPLETED").length;

  const statusGroups: Record<string, typeof entries> = {};
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
        <span className="text-[var(--color-ink)]">Manga List</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[var(--color-violet)]/30 shrink-0">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.username} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[var(--color-panel)] text-xl font-bold text-[var(--color-violet)]">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-2xl font-bold">{user.username}&apos;s Manga List</h1>
          </div>
          <p className="text-sm text-[var(--color-mute)]">
            {entries.length} {entries.length === 1 ? "title" : "titles"} • {totalChapters} chapters read
          </p>
          <Link href={`/u/${user.username}/watchlist`} className="text-xs text-[var(--color-cyan)] hover:underline">
            View {user.username}&apos;s Anime Watchlist →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Titles", value: entries.length, color: "var(--color-violet)" },
          { label: "Chapters Read", value: totalChapters, color: "var(--color-cyan)" },
          { label: "Completed", value: completedCount, color: "#48BB78" },
          { label: "Mean Score", value: meanScore ?? "—", color: "var(--color-magenta)" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 text-center">
            <p className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {!mangaListPublic ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <p className="font-display text-lg font-bold">This manga list is private</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            {user.username} hasn&apos;t made their manga list public yet.
          </p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-12 text-center">
          <div className="text-3xl mb-3">📚</div>
          <p className="font-display text-lg font-bold">No manga in this list</p>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            {user.username} hasn&apos;t added any manga to their list yet.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(statusGroups).map(([status, items]) => {
            const info = STATUS_META[status] || { label: status, color: "bg-gray-500" };
            return (
              <section key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`h-3 w-1 rounded-full ${info.color}`} />
                  <h2 className="font-display text-lg font-bold">{info.label}</h2>
                  <span className="text-xs text-[var(--color-mute)] font-mono">{items.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {items.map((entry) => (
                    <Link
                      key={entry.mediaId}
                      href={`/manga/${entry.mediaId}`}
                      className="group rounded-xl neon-rgb-border bg-[var(--color-panel)] overflow-hidden hover:border-[var(--color-violet)]/40 transition-all"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {entry.coverImage ? (
                          <Image
                            src={entry.coverImage}
                            alt={entry.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-[var(--color-panel)] p-3 text-center text-xs text-[var(--color-mute)]">
                            {entry.title}
                          </div>
                        )}
                        {entry.score != null && (
                          <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-[var(--color-violet)] backdrop-blur-sm">
                            {entry.score}
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold text-[var(--color-violet)] backdrop-blur">
                            {subTypeLabel(entry.subType)}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold truncate group-hover:text-[var(--color-violet)] transition-colors">
                          {entry.title}
                        </p>
                        {entry.chapters > 0 && (
                          <p className="text-[10px] text-[var(--color-mute)] mt-0.5 font-mono">
                            Ch {entry.chapters}
                            {entry.totalChapters ? `/${entry.totalChapters}` : ""}
                            {entry.volumes > 0 ? ` • Vol ${entry.volumes}` : ""}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
