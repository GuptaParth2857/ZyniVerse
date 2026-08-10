import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToonsWithImages } from "@/lib/toons-images";
import ToonDetailClient from "./ToonDetailClient";

export async function generateStaticParams() {
  const toons = await getToonsWithImages();
  return toons.map((t) => ({ slug: t.id }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const toons = await getToonsWithImages();
  const toon = toons.find((t) => t.id === slug);
  if (!toon) return { title: "Toon Not Found" };
  return {
    title: `${toon.displayTitle} — Hindi Dubbed Cartoon Info | ZyniVerse`,
    description: toon.description || toon.synopsis,
    openGraph: {
      title: `${toon.displayTitle} — Toon Info`,
      description: toon.description || toon.synopsis,
      type: "website",
    },
  };
}

export default async function ToonDetailPage({ params }: Props) {
  const { slug } = await params;
  const toons = await getToonsWithImages();
  const toon = toons.find((t) => t.id === slug);
  if (!toon) notFound();
  return <ToonDetailClient toon={toon} />;
}
