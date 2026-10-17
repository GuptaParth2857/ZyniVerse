import type { Metadata } from "next";
import MangaMillionClient from "./MangaMillionClient";

export const metadata: Metadata = {
  title: "MANGA MILLION: Shueisha's Free Manga Platform — Hindi & 100+ Languages",
  description:
    "MANGA MILLION is Shueisha's free manga platform with ~400 titles (One Piece, Naruto, Jujutsu Kaisen, Oshi no Ko) in 100+ languages including Hindi. No registration needed. Read for free until December 2027.",
  keywords: [
    "manga million",
    "manga million hindi",
    "shueisha manga million",
    "manga million free",
    "shueisha 100th anniversary manga",
    "hindi manga app",
    "one piece hindi manga",
    "naruto hindi manga",
    "free manga in hindi",
    "shueisha free manga",
  ],
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "MANGA MILLION: Shueisha's Free Manga Platform — Hindi & 100+ Languages",
    description:
      "Nearly 400 manga titles, 1 million pages, 100+ languages including Hindi — completely free with no registration. Here's everything Indian anime fans need to know.",
    type: "article",
    url: "https://zyverse.in/manga-million",
    siteName: "ZyniVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "MANGA MILLION: Shueisha's Free Manga Platform — Hindi & 100+ Languages",
    description:
      "Nearly 400 manga titles, 1 million pages, 100+ languages including Hindi — completely free with no registration.",
  },
  alternates: { canonical: "https://zyverse.in/manga-million" },
  robots: { index: true, follow: true },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",
      headline: "MANGA MILLION: Shueisha's Free Manga Platform — 1 Million Pages in 100+ Languages Including Hindi",
      description:
        "Shueisha launched MANGA MILLION on August 6, 2026 — a free, no-registration manga platform with ~400 titles in 100+ languages including Hindi, available until December 2027.",
      url: `${BASE_URL}/manga-million`,
      datePublished: "2026-08-06",
      dateModified: "2026-08-06",
      author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
      publisher: {
        "@type": "Organization",
        name: "ZyniVerse",
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
      },
      mainEntityOfPage: `${BASE_URL}/manga-million`,
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is MANGA MILLION?",
          acceptedAnswer: { "@type": "Answer", text: "MANGA MILLION is a digital manga platform launched by Shueisha on August 6, 2026 to mark the publisher's 100th anniversary. It offers roughly 400 manga titles — about one million pages in total — translated into more than 100 languages, free of charge." },
        },
        {
          "@type": "Question",
          name: "Is MANGA MILLION free in India?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. MANGA MILLION is available worldwide, including India, completely free of charge and without registration. You can read titles in Hindi and many other languages directly on the official website." },
        },
        {
          "@type": "Question",
          name: "Does MANGA MILLION need an account?",
          acceptedAnswer: { "@type": "Answer", text: "No. Unlike most manga services, MANGA MILLION does not require you to create an account or log in. You can open the site and start reading immediately." },
        },
        {
          "@type": "Question",
          name: "Is MANGA MILLION available in Hindi?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, Hindi is among the 100+ supported languages. One Piece alone is translated into 107 languages. The exact set of languages varies by title, so check each series page on the platform." },
        },
        {
          "@type": "Question",
          name: "How long is MANGA MILLION available?",
          acceptedAnswer: { "@type": "Answer", text: "MANGA MILLION is a limited-time service scheduled to remain available through the end of December 2027." },
        },
        {
          "@type": "Question",
          name: "Which manga can I read on MANGA MILLION?",
          acceptedAnswer: { "@type": "Answer", text: "The lineup includes One Piece, Naruto, Bleach, Demon Slayer, Jujutsu Kaisen, Chainsaw Man, Oshi no Ko, SPY×FAMILY, Hunter x Hunter, JoJo's Bizarre Adventure, Dr. Stone, Hell's Paradise, Black Clover, My Hero Academia, Kingdom, and over 150 shojo titles such as NANA and Kimi ni Todoke." },
        },
        {
          "@type": "Question",
          name: "Are the MANGA MILLION translations made by AI?",
          acceptedAnswer: { "@type": "Answer", text: "No. Shueisha's MANGA Plus Editor-in-Chief Shuhei Hosono confirmed that no AI was used in the translation process — all translations were produced by professional translators." },
        },
      ],
    },
  ],
};

export default function MangaMillionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <MangaMillionClient />
    </>
  );
}
