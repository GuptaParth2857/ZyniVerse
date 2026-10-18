import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDoujinshiById } from "@/lib/mangadex-api";
import DoujinshiDetail from "@/components/DoujinshiDetail";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getDoujinshiById(id);
  if (!entry) return { title: "Not Found" };

  return {
    title: `${entry.title} — Doujinshi`,
    description: entry.description || `${entry.title} doujinshi from MangaDex`,
  };
}

export default async function DoujinshiDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await getDoujinshiById(id);

  if (!entry) notFound();

  return <DoujinshiDetail entry={entry} />;
}
