import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostDetailView from "./client";
import { logError } from "@/lib/logger";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Empty `generateStaticParams` => no build-time prerender, but Next.js only
// enables on-demand ISR for a dynamic segment when it exists. Without it the
// route renders dynamically on every request (no-store self-fetch also forced
// that; it now uses a time-based revalidate instead).
export const revalidate = 43200;

export function generateStaticParams() {
  return [];
}

// Fallback for slugless/broken slugs. noindex on purpose: without it every
// missing slug would render HTTP 200 + the same "Blog Post" title, which
// Google indexes as mass-duplicate soft-404s (seen in GSC as "Crawled -
// not indexed"). Real 404s are handled by notFound() in the page below; this
// only covers transient API failures that happen while rendering.
const FALLBACK_METADATA: Metadata = {
  title: "Blog Post",
  description:
    "Read the latest anime blog posts on ZyniVerse - news, reviews, recommendations, and guides for anime fans worldwide.",
  robots: { index: false, follow: true },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${BASE_URL}/api/blog/${slug}`, {
      next: { revalidate: 21600 },
    });

    if (!res.ok) return FALLBACK_METADATA;

    const data = await res.json();
    const post = data.post;

    if (!post || !post.title) return FALLBACK_METADATA;

    return {
      title: `${post.title} Blog`,
      description: post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
      openGraph: {
        title: `${post.title} Blog`,
        description: post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
        type: "article",
        url: `${BASE_URL}/blog/${slug}`,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/blog/${slug}`,
      },
    };
  } catch {
    return FALLBACK_METADATA;
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post = null;
  let definitivelyMissing = false;
  try {
    const res = await fetch(`${BASE_URL}/api/blog/${slug}`, {
      next: { revalidate: 21600 },
    });
    if (res.ok) {
      const data = await res.json();
      post = data.post || null;
      // API answered but sent no post - treat as missing, not as a render.
      if (!post) definitivelyMissing = true;
    } else if (res.status === 404) {
      // Deleted/never-existed/draft-for-you slugs must be real 404s so they
      // drop out of the index instead of piling up as duplicate soft-404s.
      definitivelyMissing = true;
    }
    // Non-404 failures (5xx/network blips) fall through and render: the
    // client component retries the same API call and shows the real state.
  } catch (e) {
    // Network blip while SSR-ing - render and let the client retry rather
    // than 404ing a perfectly valid post.
    logError(e);
  }

  if (definitivelyMissing) notFound();

  const jsonLd = post?.title
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || "",
        url: `${BASE_URL}/blog/${slug}`,
        author: {
          "@type": "Organization",
          name: "ZyniVerse",
          url: BASE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "ZyniVerse",
          url: BASE_URL,
          logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
        },
        datePublished: post.publishedAt || new Date().toISOString(),
        dateModified: post.updatedAt || new Date().toISOString(),
        mainEntityOfPage: `${BASE_URL}/blog/${slug}`,
        ...(post.coverImage ? { image: post.coverImage } : {}),
      }
    : null;

  const breadcrumbJsonLd = post?.title
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/blog/${slug}` },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BlogPostDetailView slug={slug} />
    </>
  );
}
