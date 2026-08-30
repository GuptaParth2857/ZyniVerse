import type { Metadata } from "next";
import WikiHistoryPageClient from "./WikiHistoryPageClient";

export const metadata: Metadata = {
  title: "Revision History — Wiki | ZyniVerse",
  description: "Browse the revision history of wiki pages on ZyniVerse. See every edit, compare changes over time, and follow how the community-built anime encyclopedia evolves.",
};

export default function WikiHistoryPage() {
  return <WikiHistoryPageClient />;
}
