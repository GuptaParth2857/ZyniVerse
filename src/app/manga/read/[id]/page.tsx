import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MangaReader from "@/components/MangaReader";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chapter?: string; title?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const title = sp.title || "Manga";
  return {
    title: `Reading ${title} | ZyniVerse`,
    description: `Read ${title} online for free through legal sources.`,
  };
}

export default async function MangaReadPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  if (!id) notFound();

  return (
    <MangaReader
      mangaTitle={sp.title}
      mangaId={id}
      initialChapterId={sp.chapter}
    />
  );
}
