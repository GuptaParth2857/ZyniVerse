import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — ZyniVerse Public API | ZyniVerse",
  description:
    "Full documentation for the ZyniVerse Public API. Free anime filler guides, airing schedules, dub status, and anime details. Get your API key and start building.",
  robots: { index: true, follow: true },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
