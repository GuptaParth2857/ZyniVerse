import type { Metadata } from "next";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists (page.tsx here is a Client Component, so the
// config lives in this layout). Empty array => no build-time prerender.
export const revalidate = 1800;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

  return {
    title: `Anime Poll — Vote Now`,
    description: `Vote on this anime poll and see what the ZyniVerse community thinks.`,
    alternates: { canonical: `${baseUrl}/polls/${id}` },
    robots: { index: true, follow: true },
  };
}

export default function PollDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
