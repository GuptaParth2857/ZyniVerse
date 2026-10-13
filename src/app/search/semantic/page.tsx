import type { Metadata } from "next";
import SemanticSearch from "@/components/search/SemanticSearch";
import { SOURCES, SOURCE_LABEL } from "@/lib/semantic-index";

export const metadata: Metadata = {
  title: "Search by Meaning",
  description:
    "Find wiki pages, blog posts, forum threads, reviews and community tags by what they mean rather than the words they happen to contain.",
};

export default function SemanticSearchPage() {
  // Derived from the index's own source list rather than repeated here, so a new
  // source becomes searchable from the filter row as soon as it is backfilled.
  const sources = SOURCES.map((key) => ({ key, label: SOURCE_LABEL[key] }));
  return <SemanticSearch sources={sources} />;
}