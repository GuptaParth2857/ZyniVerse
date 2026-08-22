import { cache } from "react";
import { notFound } from "next/navigation";
import { getStaffBasic, getStaffMedia } from "@/lib/anilist";
import StaffDetailClient from "./staff-client";

export const revalidate = 3600;

const getStaffBasicCached = cache(getStaffBasic);
const getStaffMediaCached = cache(getStaffMedia);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const staff = await getStaffBasicCached(id);
    const name = staff.name?.full || "Staff";
    const description = (staff.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    return {
      title: `${name} — Staff | ZyniVerse`,
      description: description || `Anime works, roles and details for ${name}.`,
      openGraph: {
        title: `${name} — Staff | ZyniVerse`,
        description,
        images: staff.image?.large ? [{ url: staff.image.large, alt: name }] : undefined,
      },
    };
  } catch {
    return { title: "Staff | ZyniVerse" };
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
  } catch {
    notFound();
  }
  const mediaEdges = await getStaffMediaCached(id).catch(() => undefined);
  return <StaffDetailClient initialStaff={staff} initialEdges={mediaEdges} />;
}
