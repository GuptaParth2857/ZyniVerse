import { Metadata } from "next";
import { redirect } from "next/navigation";
import MangaChaptersClient from "./client";

export const metadata: Metadata = {
  title: "Chapters - ZyniVerse",
  description: "Browse manga chapters",
};

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
