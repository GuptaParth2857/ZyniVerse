import { cache } from "react";
import { notFound } from "next/navigation";
import { getStaffBasic, getStaffMedia, AniListUnavailableError } from "@/lib/anilist";
import StaffDetailClient from "./staff-client";
import AnimeUnavailableCard from "@/components/AnimeUnavailableCard";

export const revalidate = 172800;

// Empty array => no build-time prerender, but on-demand ISR at runtime
// (Next.js only enables it for a dynamic segment when this function exists).
export function generateStaticParams() {
  return [];
}

const getStaffBasicCached = cache(getStaffBasic);
const getStaffMediaCached = cache(getStaffMedia);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const staff = await getStaffBasicCached(id);
    const name = staff.name?.full || "Staff";
    const description = (staff.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    return {
      title: `${name} — Staff`,
      description: description || `Anime works, roles and details for ${name}.`,
      openGraph: {
        title: `${name} — Staff`,
        description,
        images: staff.image?.large ? [{ url: staff.image.large, alt: name }] : undefined,
      },
    };
  } catch {
    return { title: "Staff" };
  }
}

export default async function StaffDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let staff;
  try {
    staff = await getStaffBasicCached(id);
  } catch (err) {
    if (err instanceof AniListUnavailableError) {
      return <AnimeUnavailableCard href={`/staff/${id}`} />;
    }
    notFound();
  }
  if (!staff) notFound();
  const mediaEdges = await getStaffMediaCached(id).catch(() => undefined);
  return <StaffDetailClient initialStaff={staff} initialEdges={mediaEdges} />;
}
