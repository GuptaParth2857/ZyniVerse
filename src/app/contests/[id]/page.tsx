import type { Metadata } from "next";
import { parseContestId } from "@/lib/contests";
import { contestTypeMeta } from "@/lib/contest-meta";
import ContestDetailClient from "./ContestDetailClient";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ entry?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { type, weekStart } = parseContestId(id);
  const meta = contestTypeMeta(type);
  const week = weekStart
    ? weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const title = week ? `${meta.label} Contest — Week of ${week}` : `${meta.label} Contest`;
  const description = `${meta.blurb} Submit one entry, vote once, and take home the weekly badge, XP and coins.`;
  return {
    title,
    description,
    openGraph: {
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
      title: `ZyniVerse ${title}`,
      description,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function ContestDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { entry } = await searchParams;
  return <ContestDetailClient id={id} initialEntryId={entry ?? null} />;
}
