import type { Metadata } from "next";
import CosplayDetailPage from "./client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cosplay/${id}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    const c = data.cosplay;
    return {
      title: `${c.character} from ${c.animeTitle} — Cosplay by ${c.user.username} | ZyniVerse`,
      description: c.description || `Check out this ${c.character} cosplay from ${c.animeTitle}`,
    };
  } catch {
    return { title: "Cosplay | ZyniVerse" };
  }
}

export default async function CosplayDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CosplayDetailPage id={id} />;
}
