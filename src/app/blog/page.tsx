import type { Metadata } from "next";
import BlogPageClient from "@/components/BlogPageClient";

export const metadata: Metadata = {
  title: "Anime Blog — Reviews, News & Fan Stories",
  description: "Read anime reviews, news, seasonal previews & fan stories. Write your own blog and share with the anime community.",
  keywords: ["anime blog", "anime reviews", "anime news", "seasonal anime", "anime opinions", "indian anime blog"],
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "Anime Blog — Reviews, News & Fan Stories",
    description: "Read anime reviews, news, seasonal previews & fan stories. Join the anime community on ZyniVerse.",
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
