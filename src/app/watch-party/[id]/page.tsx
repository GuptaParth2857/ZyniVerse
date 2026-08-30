import type { Metadata } from "next";
import WatchPartyRoom from "@/components/WatchPartyRoom";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: _id } = await params;
  return {
    title: "Watch Party | ZyniVerse",
    description: "Watch anime together with friends in real time! Start a synchronized ZyniVerse watch party, chat while you watch, and share the experience with your community.",
  };
}

export default async function WatchPartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WatchPartyRoom partyId={id} />;
}
