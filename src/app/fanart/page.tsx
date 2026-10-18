import type { Metadata } from "next";
import FanArtGallery from "@/components/FanArtGallery";

const SITE = "https://zyverse.in";

export const metadata: Metadata = {
  title: "Fan Art Gallery — Anime Fan Creations",
  description:
    "Browse and share anime fan art. Discover amazing drawings, digital art, and illustrations from the community.",
  keywords: [
    "fan art",
    "anime fan art",
    "anime artwork",
    "digital art",
    "fanart gallery",
    "anime illustrations",
    "manga style art",
    "anime sketches",
  ],
  openGraph: {
    title: "Fan Art Gallery — Anime Fan Creations",
    description:
      "Browse and share anime fan art. Discover amazing drawings, digital art, and illustrations from the community.",
    url: `${SITE}/fanart`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Fan Art Gallery — Anime Fan Creations",
    description: "Browse and share anime fan art from artists around the world.",
  },
  alternates: {
    canonical: "/fanart",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Fan Art Gallery — Anime Fan Creations",
  url: `${SITE}/fanart`,
  description:
    "Browse and share anime fan art. Discover amazing drawings, digital art, and illustrations from the community.",
  isPartOf: {
    "@type": "WebSite",
    name: "ZyniVerse",
    url: SITE,
  },
};

export default function FanArtPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <FanArtGallery />
    </>
  );
}
