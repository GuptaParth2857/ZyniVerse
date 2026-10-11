import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "API Documentation — ZyniVerse Public API | ZyniVerse",
  description:
    "Full documentation for the ZyniVerse Public API. Free anime filler guides, airing schedules, dub status, and anime details. Get your API key and start building.",
  alternates: { canonical: `${BASE_URL}/docs` },
  robots: { index: true, follow: true },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
