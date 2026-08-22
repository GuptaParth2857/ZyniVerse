import { cache } from "react";
import { notFound } from "next/navigation";
import { getStudio } from "@/lib/anilist";
import StudioDetailClient from "./studio-client";

export const revalidate = 3600;

const getStudioCached = cache(getStudio);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const studio = await getStudioCached(Number(id));
    return {
      title: `${studio.name} — Studio | ZyniVerse`,
      description: `Anime produced by ${studio.name} — ${studio.media?.pageInfo?.total || 0} titles on ZyniVerse.`,
    };
  } catch {
    return { title: "Studio | ZyniVerse" };
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
  } catch {
    notFound();
  }
  return <StudioDetailClient initialStudio={studio} />;
}
