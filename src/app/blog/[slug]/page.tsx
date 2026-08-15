import type { Metadata } from "next";
import BlogPostDetailView from "./client";
import { logError } from "@/lib/logger";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${BASE_URL}/api/blog/${slug}`, { cache: "no-store" });

    if (!res.ok) return { title: "Blog Post | ZyniVerse", description: "Read the latest anime blog posts on ZyniVerse — news, reviews, recommendations, and guides for Indian anime fans.", robots: { index: true, follow: true } };

    const data = await res.json();
    const post = data.post;

    if (!post || !post.title) return { title: "Blog Post | ZyniVerse", description: "Read the latest anime blog posts on ZyniVerse — news, reviews, recommendations, and guides for Indian anime fans.", robots: { index: true, follow: true } };

    return {
      title: `${post.title} | ZyniVerse Blog`,
      description: post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
      openGraph: {
        title: `${post.title} | ZyniVerse Blog`,
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
    return { title: "Blog Post | ZyniVerse", description: "Read the latest anime blog posts on ZyniVerse — news, reviews, recommendations, and guides for Indian anime fans.", robots: { index: true, follow: true } };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post = null;
  try {
    const res = await fetch(`${BASE_URL}/api/blog/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      post = data.post;
    }
  } catch (e) { logError(e); }

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
