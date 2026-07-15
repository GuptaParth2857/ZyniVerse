import type { Metadata } from "next";
import ForumThreadDetail from "@/components/ForumThreadDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
    const res = await fetch(`${baseUrl}/api/forum/threads/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.thread.title} — Forum | ZyniVerse`,
        description: data.thread.content?.slice(0, 160) || "View thread discussion",
      };
    }
  } catch {}
  return { title: "Thread — Forum | ZyniVerse" };
}

export default async function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ForumThreadDetail threadId={id} />
    </div>
  );
}
