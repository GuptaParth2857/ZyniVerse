import type { Metadata } from "next";
import Link from "next/link";
import ForumAnimeClient from "./ForumAnimeClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Discussions for Anime #${id} — Forum | ZyniVerse`,
    description: `Browse and join discussions about this anime on ZyniVerse forum.`,
  };
}

export default async function ForumAnimePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/anime/${id}`} className="text-sm text-[var(--color-cyan)] hover:underline inline-flex items-center gap-1 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
            Back to Anime
          </Link>
          <h1 className="font-display text-3xl font-bold">Anime Discussions</h1>
        </div>
        <Link href={`/forum/create?animeId=${id}`}
          className="rounded-xl bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition"
        >+ New Thread</Link>
      </div>
      <ForumAnimeClient animeId={parseInt(id)} />
    </div>
  );
}
