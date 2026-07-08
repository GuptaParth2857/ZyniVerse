import type { Metadata } from "next";
import DoujinshiBrowseClient from "./client";

export const metadata: Metadata = {
  title: "Doujinshi — Fan Works & Original Creations | ZyniVerse",
  description:
    "Discover and track doujinshi. Browse fan works, original creations, and community favorites.",
};

export default function DoujinshiPage() {
  return <DoujinshiBrowseClient />;
}
