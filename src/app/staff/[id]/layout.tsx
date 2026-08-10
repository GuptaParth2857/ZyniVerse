import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  return {
    title: `Staff Profile | ZyniVerse`,
    description: `View anime/manga staff profile, works, and career details on ZyniVerse.`,
    alternates: { canonical: `${baseUrl}/staff/${id}` },
    robots: { index: true, follow: true },
  };
}

export default function StaffDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
