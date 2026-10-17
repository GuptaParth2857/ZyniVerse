import type { Metadata } from "next";
import { Suspense } from "react";
import CosplayGallery from "@/components/CosplayGallery";

const SITE = "https://zyverse.in";

export const metadata: Metadata = {
  title: "Cosplay Gallery — Anime Cosplays & Costumes",
  description:
    "Browse and share anime cosplays. Show off your costumes and discover talented cosplayers from India and around the world.",
  keywords: [
    "cosplay",
    "anime cosplay",
    "cosplay gallery",
    "anime costumes",
    "cosplayers India",
    "cosplay photos",
    "character cosplay",
  ],
  openGraph: {
    title: "Cosplay Gallery — Anime Cosplays & Costumes",
    description:
      "Browse and share anime cosplays from India and around the world. Discover talented cosplayers and show off your costumes.",
    url: `${SITE}/cosplay`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Cosplay Gallery — Anime Cosplays & Costumes",
    description: "Browse and share anime cosplays from India and around the world.",
  },
  alternates: {
    canonical: "/cosplay",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Cosplay Gallery — Anime Cosplays & Costumes",
  url: `${SITE}/cosplay`,
  description:
    "Browse and share anime cosplays. Show off your costumes and discover talented cosplayers from India and around the world.",
  isPartOf: {
    "@type": "WebSite",
    name: "ZyniVerse",
    url: SITE,
  },
};

export default function CosplayPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense fallback={null}>
        <CosplayGallery />
      </Suspense>
    </>
  );
}
