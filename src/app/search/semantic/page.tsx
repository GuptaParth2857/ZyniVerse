import type { Metadata } from "next";
import SemanticSearch from "@/components/search/SemanticSearch";

export const metadata: Metadata = {
  title: "Search by Meaning · ZyniVerse",
  description:
    "Find wiki pages, blog posts and forum threads by what they mean rather than the words they happen to contain.",
};

export default function SemanticSearchPage() {
  return <SemanticSearch />;
}