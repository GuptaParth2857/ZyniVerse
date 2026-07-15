import type { Metadata } from "next";
import WikiDetailPageClient from "./WikiDetailPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
    const res = await fetch(`${baseUrl}/api/wiki/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return { title: `${data.page.title} — Anime Wiki | ZyniVerse` };
    }
  } catch {}
  return { title: "Wiki — ZyniVerse" };
}

export default function WikiDetailPage() {
  return <WikiDetailPageClient />;
}
