import type { Metadata } from "next";
import BlogPageClient from "@/components/BlogPageClient";

export const metadata: Metadata = {
  title: "Anime Blog — Reviews, Thoughts & Stories | ZyniVerse",
  description: "Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.",
  openGraph: {
    title: "Anime Blog — Reviews, Thoughts & Stories | ZyniVerse",
    description: "Read and write anime blog posts. Share your thoughts, reviews, and stories with the community.",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
