import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDoujinshiById } from "@/lib/mangadex-api";
import DoujinshiDetail from "@/components/DoujinshiDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getDoujinshiById(id);
  if (!entry) return { title: "Not Found" };

  return {
    title: `${entry.title} — Doujinshi | ZyniVerse`,
    description: entry.description || `${entry.title} doujinshi from MangaDex`,
  };
}

export default async function DoujinshiDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await getDoujinshiById(id);

  if (!entry) notFound();

  return <DoujinshiDetail entry={entry} />;
}
