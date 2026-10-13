import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  return {
    title: `Staff Profile`,
    description: `View anime/manga staff profile, works, and career details on ZyniVerse.`,
    alternates: { canonical: `${baseUrl}/staff/${id}` },
    // Thin AniList mirror (name + filmography). No unique content — keep it
    // out of the index but let crawlers follow links through it.
    robots: { index: false, follow: true },
  };
}

export default function StaffDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
