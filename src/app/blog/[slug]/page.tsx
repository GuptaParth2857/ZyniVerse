import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogPostDetailView from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await fetch(`${BASE_URL}/api/blog/${slug}`, { cache: "no-store" });

    if (!res.ok) return { title: "Blog Post | ZyniVerse" };

    const post = await res.json();

    if (!post || !post.title) return { title: "Blog Post | ZyniVerse" };

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
    return { title: "Blog Post | ZyniVerse" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post = null;
  try {
    const res = await fetch(`${BASE_URL}/api/blog/${slug}`, { cache: "no-store" });
    if (res.ok) post = await res.json();
  } catch {}

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

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostDetailView slug={slug} />
    </>
  );
}
