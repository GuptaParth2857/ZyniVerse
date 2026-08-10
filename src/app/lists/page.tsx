import Link from "next/link";
import { Suspense } from "react";
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
          <div className="neon-rgb-border rounded-xl px-4 py-2">
            <h1 className="text-3xl font-bold">Custom Lists</h1>
          </div>
          <p className="mt-1 text-[var(--color-mute)]">Top 10 rankings, themed collections, hidden gems — curated by the community.</p>
        </div>
        <Link
          href="/lists/create"
          className="neon-rgb-border rounded-xl bg-[var(--color-panel)] px-5 py-2.5 text-sm font-bold text-[var(--color-cyan)] transition-all hover:text-[var(--color-ink)]"
        >
          Create Your List
        </Link>
      </div>

      <Suspense fallback={null}>
        <ListGrid />
      </Suspense>
    </div>
  );
}
