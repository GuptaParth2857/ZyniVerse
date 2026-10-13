import type { Metadata } from "next";
import VoiceActorDetail from "@/components/VoiceActorDetail";

export const revalidate = 86400;

// Empty array => no build-time prerender, but on-demand ISR at runtime
// (Next.js only enables it for a dynamic segment when this function exists).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  try {
    const { getVoiceActor } = await import("@/lib/voice-actors");
    const actor = await getVoiceActor(parseInt(id));
    return {
      title: `${actor.name} — Voice Actor`,
      description: actor.bio ? actor.bio.slice(0, 160) : `Profile of voice actor ${actor.name}`,
      alternates: { canonical: `${baseUrl}/voice-actors/${id}` },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Voice Actor", description: "Browse voice actor profiles, their roles, and the characters they've brought to life. Discover Indian and Japanese voice actors on ZyniVerse.", robots: { index: true, follow: true } };
  }
}

export default async function VoiceActorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VoiceActorDetail id={id} />;
}
