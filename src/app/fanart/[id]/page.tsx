import type { Metadata } from "next";
import FanArtDetailPage from "./client";

const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

const ART_TYPE_LABELS: Record<string, string> = {
  digital: "Digital Art",
  traditional: "Traditional Art",
  sketch: "Sketch",
  manga: "Manga Style",
  pixel: "Pixel Art",
};

interface FanArtMeta {
  id: string;
  title: string;
  description: string | null;
  animeTitle: string | null;
  animeId: number | null;
  character: string | null;
  imageUrl: string;
  artType: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

async function fetchFanArt(id: string): Promise<FanArtMeta | null> {
  try {
    const res = await fetch(`${SITE}/api/fanart/${id}`, {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.fanArt || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const f = await fetchFanArt(id);
  if (!f) {
    return {
      title: "Fan Art",
      description: "Browse anime fan art, upload your own creations, and discover talented artists on ZyniVerse.",
      robots: { index: true, follow: true },
    };
  }

  const title = `${f.title} — Fan Art by ${f.user.username}`;
  const description =
    f.description ||
    `${f.title}${f.character ? ` of ${f.character}` : ""}${
      f.animeTitle ? ` from ${f.animeTitle}` : ""
    } — a ${ART_TYPE_LABELS[f.artType] || "fan art"} piece shared on ZyniVerse.`;
  const images = f.imageUrl
    ? [{ url: f.imageUrl, alt: `${f.title} — fan art by ${f.user.username}` }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/fanart/${id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE}/fanart/${id}`,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: f.imageUrl ? [f.imageUrl] : undefined,
    },
  };
}

export default async function FanArtDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fanArt = await fetchFanArt(id);
  if (!fanArt) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: fanArt.imageUrl,
    name: fanArt.title,
    description:
      fanArt.description ||
      `${fanArt.title}${fanArt.character ? ` of ${fanArt.character}` : ""}${
        fanArt.animeTitle ? ` from ${fanArt.animeTitle}` : ""
      } — anime fan art.`,
    url: `${SITE}/fanart/${id}`,
    datePublished: fanArt.createdAt,
    uploadDate: fanArt.createdAt,
    keywords: fanArt.tags || undefined,
    genre: ART_TYPE_LABELS[fanArt.artType] || fanArt.artType,
    ...(fanArt.character && { about: { "@type": "Thing", name: fanArt.character } }),
    author: {
      "@type": "Person",
      name: fanArt.user.username,
      url: `${SITE}/profile?id=${fanArt.user.id}`,
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: fanArt.likes,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <FanArtDetailPage key={id} id={id} initialData={fanArt} />
    </>
  );
}
