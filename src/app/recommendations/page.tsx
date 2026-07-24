import RecommendationsPageClient from "./client";

export const metadata = {
  title: "Anime Recommendations — Find Your Next Favorite Show (AI-Powered)",
  description:
    "Tell us what you like — we'll find your next anime obsession. AI-powered recommendations based on your taste, mood & genre preferences. 100% free.",
  keywords: ["anime recommendations", "what anime should i watch", "anime like", "similar anime", "best anime 2026", "ai anime recommendations"],
  openGraph: {
    title: "Anime Recommendations — Find Your Next Favorite Show",
    description: "AI-powered anime recommendations based on your taste. 100% free.",
    url: "https://zyverse.in/recommendations",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Anime Recommendations — Find Your Next Favorite Show",
    description: "AI-powered anime recommendations based on your taste. 100% free.",
  },
  alternates: { canonical: "https://zyverse.in/recommendations" },
  robots: { index: true, follow: true },
};

export default function RecommendationsPage() {
  return <RecommendationsPageClient />;
}
