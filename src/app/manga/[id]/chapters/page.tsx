import { Metadata } from "next";
import { redirect } from "next/navigation";
import MangaChaptersClient from "./client";

export const revalidate = 86400;

// Empty array => no build-time prerender, but on-demand ISR at runtime
// (Next.js only enables it for a dynamic segment when this function exists).
export function generateStaticParams() {
  return [];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mangaId = parseInt(id, 10);
  if (isNaN(mangaId)) {
    return { title: "Chapters", robots: { index: false, follow: true } };
  }
  // Canonical must point at THIS manga's chapter list, not the non-existent
  // /manga/chapters page the old hardcoded value produced — that wrong canonical
  // told Google every chapter list was a duplicate, de-indexing them all.
  return {
    title: "Chapters",
    description: "Browse manga chapters and read your favorite manga series online. Complete chapter list with reading order.",
    alternates: { canonical: `${BASE_URL}/manga/${mangaId}/chapters` },
    robots: { index: true, follow: true },
  };
}

export default async function MangaChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mangaId = parseInt(id, 10);
  if (isNaN(mangaId)) redirect("/manga");

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <MangaChaptersClient mangaId={mangaId} />
      </div>
    </main>
  );
}
