import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let caption: string | null = null;
  try {
    const reel = await prisma.reel.findUnique({
      where: { id },
      select: { caption: true },
    });
    caption = reel?.caption ?? null;
  } catch {
    caption = null;
  }
  const ogImage = `${BASE_URL}/api/og/reel/${id}`;
  return {
    title: caption ? `${caption.slice(0, 60)} | ZyniVerse Reels` : "Anime Reel | ZyniVerse",
    openGraph: {
      title: caption ? caption.slice(0, 90) : "Anime Reel | ZyniVerse",
      type: "video.other" as const,
      url: `${BASE_URL}/reels/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: caption || "Anime reel" }],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [ogImage],
    },
  };
}

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/reels?reel=${encodeURIComponent(id)}`);
}
