import type { Metadata } from "next";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const genreName = decodeURIComponent(name).replace(/-/g, " ");
  const title = `${genreName.charAt(0).toUpperCase() + genreName.slice(1)} Anime — Browse by Genre | ZyniVerse`;
  const desc = `Browse the best ${genreName} anime. Trending, popular, and top-rated ${genreName} anime series and movies on ZyniVerse.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
    },
    robots: { index: true, follow: true },
  };
}

export default function GenreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
