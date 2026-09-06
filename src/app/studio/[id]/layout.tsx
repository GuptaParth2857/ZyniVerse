import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

  return {
    title: `Studio Details — Anime Productions & Staff | ZyniVerse`,
    description: `Browse anime studio details, productions, and staff members on ZyniVerse.`,
    openGraph: {
      title: `Anime Studio — Productions & Staff | ZyniVerse`,
      description: `Browse anime studio details, productions, and staff members on ZyniVerse.`,
    },
    alternates: { canonical: `${baseUrl}/studio/${id}` },
    robots: { index: true, follow: true },
  };
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
