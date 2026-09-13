import type { Metadata } from "next";
import { PERSONALITIES, type PersonalityKey } from "@/lib/quiz-personality";
import QuizPersonality from "@/components/QuizPersonality";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

type Props = { searchParams: Promise<{ a?: string; n?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const key = (sp.a || "").toLowerCase();
  const p = PERSONALITIES[key as PersonalityKey];
  const n = sp.n ? `&n=${encodeURIComponent(sp.n)}` : "";

  const title = p
    ? `Tumhara anime personality: ${p.name} ${p.emoji} | ZyniVerse`
    : "Anime Personality Test — Tum kaunse anime character ho? | ZyniVerse";
  const description = p
    ? `${p.name} (${p.anime}) — ${p.line}`
    : "6 sawaal, apna anime personality jano aur dosto ke saath WhatsApp pe share karo!";

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/quiz/personality` },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "ZyniVerse",
      url: `${BASE}/quiz/personality?a=${key}${n}`,
      images: [{ url: `${BASE}/api/og/quiz-personality?a=${key}${n}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}/api/og/quiz-personality?a=${key}${n}`] },
  };
}

export default async function QuizPersonalityPage({ searchParams }: Props) {
  const sp = await searchParams;
  const key = (sp.a || "").toLowerCase();
  const p = key && PERSONALITIES[key as PersonalityKey] ? PERSONALITIES[key as PersonalityKey] : undefined;
  return <QuizPersonality initialResult={p} />;
}