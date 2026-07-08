import type { Metadata } from "next";
import WikiCreatePageClient from "./WikiCreatePageClient";

export const metadata: Metadata = {
  title: "Create Wiki Page — ZyniVerse",
  description: "Create a new wiki page on ZyniVerse. Share your anime and manga knowledge with the community.",
};

export default function WikiCreatePage() {
  return <WikiCreatePageClient />;
}
