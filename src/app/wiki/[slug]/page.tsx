import type { Metadata } from "next";
import WikiDetailPageClient from "./WikiDetailPageClient";
import { logError } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Empty `generateStaticParams` => no build-time prerender, but Next.js only
// enables on-demand ISR for a dynamic segment when it exists. Without it the
// route renders dynamically on every request.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${BASE_URL}/api/wiki/${slug}`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.page.title} — Anime Wiki`,
        alternates: { canonical: `${BASE_URL}/wiki/${slug}` },
        robots: { index: true, follow: true },
      };
    }
  } catch (e) { logError(e); }
  return {
    title: "Wiki",
    description: "Browse the ZyniVerse anime wiki for detailed information about your favorite anime series, characters, episodes, and more. India's free anime encyclopedia.",
    alternates: { canonical: `${BASE_URL}/wiki/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default function WikiDetailPage() {
  return <WikiDetailPageClient />;
}
