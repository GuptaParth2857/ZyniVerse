import type { Metadata } from "next";
import CosplayDetailPage from "./client";

async function fetchCosplay(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in"}/api/cosplay/${id}`, {
      next: { revalidate: 300 },
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  if (!c) return { title: "Cosplay | ZyniVerse", description: "Browse anime cosplay photos, upload your own, and connect with the cosplay community on ZyniVerse.", robots: { index: true, follow: true } };
  return {
    title: `${c.character} from ${c.animeTitle} — Cosplay by ${c.user.username} | ZyniVerse`,
    description: c.description || `Check out this ${c.character} cosplay from ${c.animeTitle}`,
    alternates: { canonical: `${baseUrl}/cosplay/${id}` },
    robots: { index: true, follow: true },
  };
}

export default async function CosplayDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cosplay = await fetchCosplay(id);
  return <CosplayDetailPage id={id} initialData={cosplay} />;
}
