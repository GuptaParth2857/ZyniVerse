import { cache } from "react";
import { notFound } from "next/navigation";
import { getStudio, AniListUnavailableError } from "@/lib/anilist";
import StudioDetailClient from "./studio-client";
import AnimeUnavailableCard from "@/components/AnimeUnavailableCard";

export const revalidate = 172800;

// Empty array => no build-time prerender, but on-demand ISR at runtime
// (Next.js only enables it for a dynamic segment when this function exists).
export function generateStaticParams() {
  return [];
}

const getStudioCached = cache(getStudio);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const studio = await getStudioCached(Number(id));
    return {
      title: `${studio.name} — Studio`,
      description: `Anime produced by ${studio.name} — ${studio.media?.pageInfo?.total || 0} titles on ZyniVerse.`,
    };
  } catch {
    return { title: "Studio" };
  }
}

export default async function StudioDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let studio;
  try {
    studio = await getStudioCached(Number(id));
  } catch (err) {
    if (err instanceof AniListUnavailableError) {
      return <AnimeUnavailableCard href={`/studio/${id}`} />;
    }
    notFound();
  }
  if (!studio) notFound();
  return <StudioDetailClient initialStudio={studio} />;
}
