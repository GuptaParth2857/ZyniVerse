import type { Metadata } from "next";
import WatchPartyRoom from "@/components/WatchPartyRoom";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Watch Party | ZyniVerse",
    description: "Join the watch party and watch anime together!",
  };
}

export default async function WatchPartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WatchPartyRoom partyId={id} />;
}
