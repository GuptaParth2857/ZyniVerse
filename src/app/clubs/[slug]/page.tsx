import type { Metadata } from "next";
import ClubDetailPageClient from "./ClubDetailPageClient";
import { logError } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${BASE_URL}/api/clubs/${slug}`, {
      next: { revalidate: 21600 },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.club.name} — Anime Club`,
        alternates: { canonical: `${BASE_URL}/clubs/${slug}` },
        robots: { index: true, follow: true },
      };
    }
  } catch (e) { logError(e); }
  return {
    title: "Club",
    description: "Join anime clubs on ZyniVerse — discuss your favorite series, share recommendations, and connect with fellow anime fans from India.",
    alternates: { canonical: `${BASE_URL}/clubs/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default function ClubDetailPage({ params }: Props) {
  return <ClubDetailPageClient params={params} />;
}
