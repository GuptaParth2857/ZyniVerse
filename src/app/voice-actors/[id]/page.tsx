import type { Metadata } from "next";
import VoiceActorDetail from "@/components/VoiceActorDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  try {
    const { getVoiceActor } = await import("@/lib/voice-actors");
    const actor = await getVoiceActor(parseInt(id));
    return {
      title: `${actor.name} — Voice Actor | ZyniVerse`,
      description: actor.bio ? actor.bio.slice(0, 160) : `Profile of voice actor ${actor.name}`,
      alternates: { canonical: `${baseUrl}/voice-actors/${id}` },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Voice Actor | ZyniVerse", description: "Browse voice actor profiles, their roles, and the characters they've brought to life. Discover Indian and Japanese voice actors on ZyniVerse.", robots: { index: true, follow: true } };
  }
}

export default async function VoiceActorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VoiceActorDetail id={id} />;
}
