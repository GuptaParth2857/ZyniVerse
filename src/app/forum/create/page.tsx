import type { Metadata } from "next";
import Link from "next/link";
import ForumCreateThread from "@/components/ForumCreateThread";

export const metadata: Metadata = {
  title: "Create Thread | ZyniVerse",
  description: "Start a new discussion thread on the ZyniVerse forum.",
};

export default async function ForumCreatePage({ searchParams }: { searchParams: Promise<{ animeId?: string; animeTitle?: string; animeImage?: string }> }) {
  const sp = await searchParams;
  const animeId = sp.animeId ? parseInt(sp.animeId) : undefined;
  const animeTitle = sp.animeTitle;
  const animeImage = sp.animeImage;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/forum" className="text-sm text-[var(--color-cyan)] hover:underline inline-flex items-center gap-1 mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
        Back to Forum
      </Link>

      <h1 className="font-display text-3xl font-bold mb-6">Create Thread</h1>

      <ForumCreateThread
        initialAnimeId={animeId}
        initialAnimeTitle={animeTitle}
        initialAnimeImage={animeImage}
      />
    </div>
  );
}
