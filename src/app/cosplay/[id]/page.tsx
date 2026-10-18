import type { Metadata } from "next";
import CosplayDetailPage from "./client";

const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

interface CosplayMeta {
  id: string;
  title: string;
  description: string | null;
  character: string;
  animeTitle: string;
  animeId: number | null;
  imageUrl: string;
  tags: string;
  likes: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

async function fetchCosplay(id: string): Promise<CosplayMeta | null> {
  try {
    const res = await fetch(`${SITE}/api/cosplay/${id}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.cosplay || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await fetchCosplay(id);
  if (!c) return { title: "Cosplay", description: "Browse anime cosplay photos, upload your own, and connect with the cosplay community on ZyniVerse.", robots: { index: true, follow: true } };

  const title = `${c.character} from ${c.animeTitle} — Cosplay by ${c.user.username}`;
  const description = c.description || `Check out this ${c.character} cosplay from ${c.animeTitle}`;
  const images = c.imageUrl ? [{ url: c.imageUrl, alt: `${c.character} cosplay by ${c.user.username}` }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/cosplay/${id}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE}/cosplay/${id}`,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: c.imageUrl ? [c.imageUrl] : undefined,
    },
  };
}

export default async function CosplayDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cosplay = await fetchCosplay(id);
  if (!cosplay) return null;
  // null guard above prevents the type error on the initialData prop.
  const jsonLd = cosplay
    ? {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        contentUrl: cosplay.imageUrl,
        name: cosplay.title,
        description: cosplay.description || `${cosplay.character} cosplay from ${cosplay.animeTitle}`,
        url: `${SITE}/cosplay/${id}`,
        datePublished: cosplay.createdAt,
        uploadDate: cosplay.createdAt,
        keywords: cosplay.tags || undefined,
        about: { "@type": "Thing", name: cosplay.character },
        author: {
          "@type": "Person",
          name: cosplay.user.username,
          url: `${SITE}/profile?id=${cosplay.user.id}`,
        },
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: cosplay.likes,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <CosplayDetailPage key={id} id={id} initialData={cosplay} />
    </>
  );
}
