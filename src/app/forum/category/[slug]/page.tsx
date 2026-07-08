import type { Metadata } from "next";
import Link from "next/link";
import ForumCategoryClient from "./ForumCategoryClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  return {
    title: `${name} — Forum | ZyniVerse`,
    description: `Browse ${name} threads in the ZyniVerse forum.`,
  };
}

export default async function ForumCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/forum" className="text-sm text-[var(--color-cyan)] hover:underline inline-flex items-center gap-1 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
            Back to Forum
          </Link>
          <h1 className="font-display text-3xl font-bold capitalize">{slug.replace(/-/g, " ")}</h1>
        </div>
        <Link href="/forum/create"
          className="rounded-xl bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition"
        >+ New Thread</Link>
      </div>
      <ForumCategoryClient slug={slug} />
    </div>
  );
}
