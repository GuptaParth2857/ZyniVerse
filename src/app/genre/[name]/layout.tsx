import type { Metadata } from "next";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists (page.tsx here is a Client Component, so the
// config lives in this layout). Empty array => no build-time prerender.
export const revalidate = 43200;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const genreName = decodeURIComponent(name).replace(/-/g, " ");
  const title = `${genreName.charAt(0).toUpperCase() + genreName.slice(1)} Anime — Browse by Genre`;
  const desc = `Browse the best ${genreName} anime. Trending, popular, and top-rated ${genreName} anime series and movies on ZyniVerse.`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${baseUrl}/genre/${name}`,
    },
    alternates: { canonical: `${baseUrl}/genre/${name}` },
    robots: { index: false, follow: true },
  };
}

export default function GenreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
