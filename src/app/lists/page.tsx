import Link from "next/link";
import ListGrid from "./ListGrid";

export const metadata = {
  title: "Custom Anime Lists — Top 10 & Rankings | ZyniVerse",
  description:
    "Browse and create custom anime and manga lists. Top 10 rankings, themed collections, hidden gems — curated by the community.",
  openGraph: {
    title: "Custom Anime Lists — Top 10 & Rankings | ZyniVerse",
    description:
      "Browse and create custom anime and manga lists. Top 10 rankings, themed collections, hidden gems — curated by the community.",
  },
};

export default function ListsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 animate-page-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Lists</h1>
          <p className="mt-1 text-[var(--color-mute)]">Top 10 rankings, themed collections, hidden gems — curated by the community.</p>
        </div>
        <Link
          href="/lists/create"
          className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
        >
          Create Your List
        </Link>
      </div>

      <ListGrid />
    </div>
  );
}
