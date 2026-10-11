import type { Metadata } from "next";
import ClubDetailPageClient from "./ClubDetailPageClient";
import { logError } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.club.name} — Anime Club | ZyniVerse`,
        alternates: { canonical: `${BASE_URL}/clubs/${slug}` },
        robots: { index: true, follow: true },
      };
    }
  } catch (e) { logError(e); }
  return {
    title: "Club — ZyniVerse",
    description: "Join anime clubs on ZyniVerse — discuss your favorite series, share recommendations, and connect with fellow anime fans from India.",
    alternates: { canonical: `${BASE_URL}/clubs/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default function ClubDetailPage({ params }: Props) {
  return <ClubDetailPageClient params={params} />;
}
