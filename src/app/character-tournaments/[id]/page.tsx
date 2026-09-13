import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import TournamentDetail from "./client";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await prisma.characterTournament
    .findUnique({
      where: { id },
      select: { title: true, description: true, status: true, size: true, creator: { select: { username: true } } },
    })
    .catch(() => null);

  const title = t
    ? `${t.title} — ${t.size}-Player Character Tournament | ZyniVerse`
    : "Character Tournament | ZyniVerse — Vote Your Favorite Anime Fan";
  const description = t
    ? `${t.description || `${t.title} — anime characters battle it out.`} Vote your favorite on ZyniVerse by @${t.creator.username}.`
    : "Anime characters fight in community tournaments. Build brackets, vote and crown champions on ZyniVerse.";

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/character-tournaments/${id}` },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "ZyniVerse",
      url: `${BASE}/character-tournaments/${id}`,
      images: [{ url: `${BASE}/api/og/character-tournament/${id}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}/api/og/character-tournament/${id}`] },
  };
}

export default function CharacterTournamentPage() {
  return <TournamentDetail />;
}