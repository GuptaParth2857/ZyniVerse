import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Light Novel Details — Read & Track | ZyniVerse`,
    description: `Browse light novel details, volumes, and reading progress on ZyniVerse.`,
    openGraph: {
      title: `Light Novel Details | ZyniVerse`,
      description: `Browse light novel details, volumes, and reading progress on ZyniVerse.`,
    },
    robots: { index: true, follow: true },
  };
}

export default function LightNovelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
