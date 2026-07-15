import type { Metadata } from "next";
import WikiEditPageClient from "./WikiEditPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
    const res = await fetch(`${baseUrl}/api/wiki/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return { title: `Edit ${data.page.title} — Wiki | ZyniVerse` };
    }
  } catch {}
  return { title: "Edit Wiki Page — ZyniVerse" };
}

export default function WikiEditPage({ params }: Props) {
  return <WikiEditPageClient params={params} />;
}
