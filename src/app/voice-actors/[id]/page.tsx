import type { Metadata } from "next";
import VoiceActorDetail from "@/components/VoiceActorDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const { getVoiceActor } = await import("@/lib/voice-actors");
    const actor = await getVoiceActor(parseInt(id));
    return {
      title: `${actor.name} — Voice Actor | ZyniVerse`,
      description: actor.bio ? actor.bio.slice(0, 160) : `Profile of voice actor ${actor.name}`,
    };
  } catch {
    return { title: "Voice Actor | ZyniVerse" };
  }
}

export default async function VoiceActorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VoiceActorDetail id={id} />;
}
