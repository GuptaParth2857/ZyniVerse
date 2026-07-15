import type { Metadata } from "next";
import ClubDetailPageClient from "./ClubDetailPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
    const res = await fetch(`${baseUrl}/api/clubs/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return { title: `${data.club.name} — Anime Club | ZyniVerse` };
    }
  } catch {}
  return { title: "Club — ZyniVerse" };
}

export default function ClubDetailPage({ params }: Props) {
  return <ClubDetailPageClient params={params} />;
}
