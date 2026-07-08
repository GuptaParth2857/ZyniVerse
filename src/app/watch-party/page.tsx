import type { Metadata } from "next";
import WatchPartyClient from "./client";

export const metadata: Metadata = {
  title: "Watch Party — Watch Anime Together | ZyniVerse",
  description:
    "Host or join watch parties. Watch anime episodes together with friends in real-time sync.",
};

export default function WatchPartyPage() {
  return <WatchPartyClient />;
}
