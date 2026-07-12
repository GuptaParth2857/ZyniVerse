import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Staff Profile | ZyniVerse`,
    description: `View anime/manga staff profile, works, and career details on ZyniVerse.`,
  };
}

export default function StaffDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
