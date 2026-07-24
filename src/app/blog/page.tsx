import type { Metadata } from "next";
import BlogPageClient from "@/components/BlogPageClient";

export const metadata: Metadata = {
  title: "Anime Blog — Reviews, News & Fan Stories | ZyniVerse",
  description: "Read anime reviews, news, seasonal previews & fan stories. Write your own blog and share with India's anime community.",
  keywords: ["anime blog", "anime reviews", "anime news", "seasonal anime", "anime opinions", "indian anime blog"],
  openGraph: {
    title: "Anime Blog — Reviews, News & Fan Stories",
    description: "Read anime reviews, news, seasonal previews & fan stories. Join India's anime community.",
    url: "https://zyverse.in/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Anime Blog — Reviews, News & Fan Stories",
    description: "Read anime reviews, news, seasonal previews & fan stories.",
  },
  alternates: { canonical: "https://zyverse.in/blog" },
  robots: { index: true, follow: true },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
