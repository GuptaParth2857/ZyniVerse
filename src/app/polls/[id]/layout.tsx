import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Anime Poll — Vote Now | ZyniVerse`,
    description: `Vote on this anime poll and see what the ZyniVerse community thinks.`,
    robots: { index: true, follow: true },
  };
}

export default function PollDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
