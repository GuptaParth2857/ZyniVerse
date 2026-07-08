import RecommendationsPageClient from "./client";

export const metadata = {
  title: "Anime Recommendations — AI-Powered Picks | ZyniVerse",
  description:
    "Get personalized anime recommendations based on your taste. Discover similar shows, trending anime, and genre-based picks tailored for you.",
};

export default function RecommendationsPage() {
  return <RecommendationsPageClient />;
}
