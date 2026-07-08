import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDoujinshiById } from "@/lib/doujinshi-data";
import DoujinshiDetail from "@/components/DoujinshiDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = getDoujinshiById(id);
  if (!entry) return { title: "Not Found" };

  return {
    title: `${entry.title} — Doujinshi | ZyniVerse`,
    description: entry.description || `${entry.title} doujinshi by ${entry.circle || entry.artist}`,
  };
}

export default async function DoujinshiDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = getDoujinshiById(id);

  if (!entry) notFound();

  return <DoujinshiDetail entry={entry} />;
}
