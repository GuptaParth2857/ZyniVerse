import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReviewDetailClient from "@/components/ReviewDetailClient";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 43200;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const review = await prisma.longReview.findUnique({
    where: { id },
    select: { title: true, content: true, mediaTitle: true, user: { select: { username: true } } },
  });

  if (!review) return { title: "Review Not Found" };

  return {
    title: `${review.title} — Review by ${review.user.username}`,
    description: review.content.slice(0, 160),
    openGraph: {
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
      title: `${review.title} — ${review.mediaTitle}`,
      description: review.content.slice(0, 160),
      type: "article",
    },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;

  const review = await prisma.longReview.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  if (!review) notFound();

  const serialized = {
    ...review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };

  return <ReviewDetailClient review={serialized} />;
}
