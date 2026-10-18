import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MangaReader from "@/components/MangaReader";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chapter?: string; title?: string; mediaId?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id: _id } = await params;
  const sp = await searchParams;
  const raw = sp.title || "Manga";
  const safeTitle = raw.replace(/[<>{}"\\]/g, "").trim().slice(0, 80);
  return {
    title: `Reading ${safeTitle}`,
    description: `Read ${safeTitle} online for free through legal sources.`,
    robots: { index: false, follow: false },
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
      mediaId={sp.mediaId}
    />
  );
}
