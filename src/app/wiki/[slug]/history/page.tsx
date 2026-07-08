import type { Metadata } from "next";
import WikiHistoryPageClient from "./WikiHistoryPageClient";

export const metadata: Metadata = {
  title: "Revision History — Wiki | ZyniVerse",
  description: "View revision history for wiki pages on ZyniVerse.",
};

export default function WikiHistoryPage() {
  return <WikiHistoryPageClient />;
}
