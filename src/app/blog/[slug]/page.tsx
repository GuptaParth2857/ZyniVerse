import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogPostDetailView from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog?limit=1`, { cache: "no-store" });

    if (!res.ok) return { title: "Blog Post | ZyniVerse" };

    const data = await res.json();
    const posts = data.posts || [];
    const post = posts.find((p: any) => p.slug === slug);

    if (!post) return { title: "Blog Post | ZyniVerse" };

    return {
      title: `${post.title} | ZyniVerse Blog`,
      description: post.excerpt || post.content?.slice(0, 200) || "",
      openGraph: {
        title: `${post.title} | ZyniVerse Blog`,
        description: post.excerpt || post.content?.slice(0, 200) || "",
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
    };
  } catch {
    return { title: "Blog Post | ZyniVerse" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return <BlogPostDetailView slug={slug} />;
}
