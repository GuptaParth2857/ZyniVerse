import type { Metadata } from "next";
import { Suspense } from "react";
import DoujinshiBrowseClient from "./client";

const SITE = "https://zyverse.in";

export const metadata: Metadata = {
  title: "Doujinshi — Fan Works & Original Creations",
  description:
    "Discover and track doujinshi. Browse fan works, original creations, and community favorites from MangaDex — updated daily on ZyniVerse.",
  keywords: [
    "doujinshi",
    "doujinshi online",
    "read doujinshi",
    "fan works",
    "doujin",
    "manga fan art",
    "doujinshi tracker",
    "community favorites",
  ],
  openGraph: {
    title: "Doujinshi — Fan Works & Original Creations",
    description:
      "Browse fan-made doujinshi, original creations and community favorites from MangaDex. Track what you love.",
    url: `${SITE}/doujinshi`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Doujinshi — Fan Works & Original Creations",
    description:
      "Browse fan-made doujinshi, original creations and community favorites from MangaDex.",
  },
  alternates: {
    canonical: "/doujinshi",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Doujinshi — Fan Works & Original Creations",
  url: `${SITE}/doujinshi`,
  description:
    "Browse and track doujinshi — fan works, original creations and community favorites from MangaDex.",
  isPartOf: {
    "@type": "WebSite",
    name: "ZyniVerse",
    url: SITE,
  },
};

export default function DoujinshiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense fallback={null}>
        <DoujinshiBrowseClient />
      </Suspense>
    </>
  );
}
