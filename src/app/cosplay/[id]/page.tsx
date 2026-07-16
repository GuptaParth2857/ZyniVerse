import type { Metadata } from "next";
import CosplayDetailPage from "./client";

async function fetchCosplay(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in"}/api/cosplay/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.cosplay || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await fetchCosplay(id);
  if (!c) return { title: "Cosplay | ZyniVerse" };
  return {
    title: `${c.character} from ${c.animeTitle} — Cosplay by ${c.user.username} | ZyniVerse`,
    description: c.description || `Check out this ${c.character} cosplay from ${c.animeTitle}`,
  };
}

export default async function CosplayDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cosplay = await fetchCosplay(id);
  return <CosplayDetailPage id={id} initialData={cosplay} />;
}
